# Deploy SyncPilot's server on AWS Lightsail (VPS)

A complete, tested walkthrough. Follow it top to bottom and you will have a
working production backend that redeploys itself when you push code.

Every step tells you what to run, what you should see, and what to do if you
see something else. Do not skip a verification. Most of the pain in deploying
this comes from a step that quietly half-worked.

---

## What you are building

```
Vercel (Next.js web app)          Lightsail box ($7/month)
  |                                 |
  |-- POST /sync -----------------> nginx :80
  |                                   |-- :3001  intake server + worker
  |-- GET /signal/v1/... ----------> |-- :8080  signal-cli
  |                                   |-- :6379  redis (internal only)
  |
  '-- Neon Postgres
```

The box does very little work. It takes jobs from Vercel, puts them in a queue,
and calls back to Vercel to run them. It also hosts signal-cli, which is the
only reason a permanent server is needed at all.

Because the box is small, **it never builds anything**. GitHub builds the Docker
image and the box only downloads it.

---

## Before you start

Collect these values and keep them in a scratch file. You will need each one
more than once, and hunting for them mid-step is where mistakes happen.

| Value | Where it comes from | Yours |
| --- | --- | --- |
| Static IP | Step 2 | `______` |
| SSH key file | Downloaded in Step 1 | `______` |
| `SYNC_SECRET` | You generate it in Step 8 | `______` |
| `SIGNAL_AUTH_TOKEN` | You generate it in Step 8 | `______` |
| Vercel app URL | Your Vercel dashboard | `______` |
| Signal phone number | The phone you will link | `______` |
| GitHub repo | e.g. `your-username/your-repo` | `______` |

Generate the two secrets now, on your laptop, and paste them into that scratch
file:

```bash
openssl rand -hex 32    # SYNC_SECRET
openssl rand -hex 32    # SIGNAL_AUTH_TOKEN
```

Each secret goes in **two places** and must match exactly:

- `SYNC_SECRET` → the box's `.env` **and** Vercel
- `SIGNAL_AUTH_TOKEN` → the box's nginx config **and** Vercel

A mismatch gives you a 401 that surfaces as a confusing 500 on the Vercel side.

### Tools you need on your laptop

```bash
ssh -V          # any recent version
git --version
gh --version    # GitHub CLI: https://cli.github.com
npx vercel --version
```

Log in to both:

```bash
gh auth login
npx vercel login
```

### Two rules for copy-pasting

These caused real failures. Read them once.

**1. A `\` continuing a line must be the last character on that line.** If your
editor leaves a space after it, the command silently ends early:

```bash
ssh-copy-id -i key.pub \      # <-- trailing space here = broken
  user@host
```

If unsure, put the whole command on one line.

**2. Paste `cat > file <<'EOF'` blocks in one go.** If your terminal mangles the
first line into something like `<<'EOF'l <<'EOF'`, the file may be written
incomplete. Always `cat` the file afterwards to check.

### Which machine am I on?

Each step is labelled **ON YOUR LAPTOP** or **ON THE SERVER**. Getting this
wrong is the single most common beginner mistake. When in doubt, look at your
shell prompt. The server prompt looks like `ubuntu@ip-172-31-0-1:~$`.

---

# Part A. Build the server

## Step 1. Create the Lightsail instance

**ON YOUR LAPTOP**, in the Lightsail console, click **Create instance**.

| Setting | Choose |
| --- | --- |
| Region | Any near you. This guide uses Singapore (`ap-southeast-1`) |
| Platform | Linux/Unix |
| Blueprint | **OS Only** → **Ubuntu 24.04 LTS** |
| Network type | **Dual-stack** |
| Plan type | **General purpose** |
| Plan | **$7/month** (1 GB RAM, 2 vCPU, 40 GB SSD) |

Three things worth knowing:

- **Do not pick an "Apps + OS" blueprint.** Those are packaged by Bitnami, which
  stopped receiving updates in May 2026 and is being removed. You install
  everything yourself anyway.
- **Do not pick memory-optimized or compute-optimized.** Neither has a $7 tier,
  and this workload is neither. It idles under 1% CPU.
- **Lightsail plans only resize upward.** You can snapshot a $7 instance onto a
  $12 one later, but never the reverse. Starting small is the safe direction.

Download the SSH key when prompted (**Account → SSH keys** if you miss it). Save
it somewhere you will remember.

Wait until the instance shows **Running**.

## Step 2. Attach a static IP

Without this, the IP changes every time the instance restarts, and everything
pointing at it breaks.

1. Open your instance → **Networking** tab
2. Click **Attach static IP**
3. Name it and attach

Write the IP into your scratch file. It is free while attached to a running
instance.

## Step 3. Set the firewall

Still on **Networking**, under **IPv4 Firewall**, you want exactly two rules:

| Application | Port |
| --- | --- |
| SSH | 22 |
| HTTP | 80 |

Delete anything else.

**Never open 8080 or 3001.** Those are the signal-cli and intake ports. The
compose file binds them to `127.0.0.1` so they are unreachable from outside, and
nginx is the only way in. Port 8080 in particular can send Signal messages as
you if exposed.

## Step 4. Connect

**ON YOUR LAPTOP:**

```bash
chmod 400 /path/to/your-key.pem
ssh -i /path/to/your-key.pem ubuntu@YOUR_STATIC_IP
```

**You should see:** a prompt like `ubuntu@ip-172-31-0-1:~$`

**If you see `Permission denied (publickey)`:** the key path is wrong, or you
used a relative path from the wrong directory. Use an absolute path.

**If you see `UNPROTECTED PRIVATE KEY FILE`:** you skipped `chmod 400`.

Everything from Step 5 to Step 11 runs **ON THE SERVER**.

## Step 5. Add swap

Swap is disk space the system uses when RAM runs out. With 1 GB of RAM this is
not optional. Without it, installs and builds get killed halfway.

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

**You should see** a `Swap:` row showing `2.0Gi`.

The `/etc/fstab` line is what makes swap survive a reboot. Do not skip it.

## Step 6. Install packages

```bash
sudo apt update
sudo apt install -y git nginx docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo systemctl enable --now nginx
sudo usermod -aG docker ubuntu
exit
```

**The package is `docker-compose-v2`.** Many guides say `docker-compose-plugin`
(that name only exists in Docker's own apt repository, not Ubuntu's). And when
apt cannot find one package, **it installs none of them**, so you end up
without git and nginx too, and the next three commands fail in a confusing
cascade.

You typed `exit`, so you are on your laptop. Log back in so your new docker
group membership applies:

```bash
ssh -i /path/to/your-key.pem ubuntu@YOUR_STATIC_IP
```

Verify:

```bash
docker --version
docker compose version
```

**You should see** two version numbers.

**If `docker compose` says "is not a docker command":** the plugin did not
install. Run the apt command again and read its output for errors.

## Step 7. Get the code

The server only needs the `server/` folder, so this clone skips `web/`.

```bash
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/YOUR_USER/YOUR_REPO.git syncpilot
cd syncpilot
git sparse-checkout set server
cd server
ls
```

**You should see** `Dockerfile`, `server.ts`, `worker.ts`, `package.json`, and
`.env.example`.

**If it asks for a password and fails**, your repo is private. Pick one:

- **Token:** GitHub → Settings → Developer settings → Personal access tokens →
  generate one with `repo` scope, and use it as the password.
- **Deploy key:** run `ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""` on the
  server, then add `~/.ssh/id_ed25519.pub` to the repo under Settings → Deploy
  keys, and clone with the `git@github.com:...` URL instead.

## Step 8. Create `.env`

```bash
cp .env.example .env
nano .env
```

Set these:

```env
SYNC_SECRET=<the first secret you generated>

REDIS_HOST=redis
REDIS_PORT=6379

PORT=3001
WEB_APP_URL=https://your-app.vercel.app

QUEUE_DASHBOARD_USER=admin
QUEUE_DASHBOARD_PASSWORD=<pick a password>

LOG_LEVEL=info

OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-<zone>.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic%20<base64-instance-id-and-token>
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_SERVICE_NAME=syncpilot-server
```

Save with `Ctrl+O`, `Enter`, `Ctrl+X`.

**`REDIS_HOST` must be `redis`, not `localhost`.** This is the single most
common mistake with this project, and it fails silently.

`.env.example` ships with `localhost` because that is correct for local
development, where you run the worker directly on your machine. In production
the worker runs *inside* Docker, where `localhost` means the worker's own
container, and nothing is listening on port 6379 there. Redis is reachable only
by its compose service name, `redis`.

If you get this wrong, `/health` still returns `{"ok":true}` and nothing looks
broken. Jobs just never process. You will not find out for hours.

**`SYNC_SECRET` must match Vercel byte for byte.** Watch for a trailing space
from copy-paste. It is invisible and it will cost you an evening.

## Step 9. Create the compose file

This file is not in the repository. Create it:

```bash
cat > docker-compose.production.yml <<'YAML'
name: syncpilot-server

services:
  signal-api:
    image: bbernhard/signal-cli-rest-api:latest
    container_name: signal-api
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:8080"
    environment:
      MODE: native
    volumes:
      - ./signal-cli-config/signal-cli-config:/home/.local/share/signal-cli

  redis:
    image: redis:7-alpine
    container_name: syncpilot-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data

  worker:
    image: ghcr.io/YOUR_USER/syncpilot-server:latest
    container_name: syncpilot-worker
    restart: unless-stopped
    env_file:
      - .env
    depends_on:
      - redis
    ports:
      - "127.0.0.1:3001:3001"
    command: sh -c "pnpm start & pnpm worker"

volumes:
  redis-data:
YAML
```

Replace `YOUR_USER` with your GitHub username, lowercase:

```bash
sed -i "s|YOUR_USER|your-github-username|" docker-compose.production.yml
cat docker-compose.production.yml
```

**You should see** the full file with your username filled in.

Four things about this file:

- **`worker` uses `image:`, not `build:`.** GitHub builds it; the box downloads
  it. Building here needs more RAM than you have.
- **`MODE: native`** runs signal-cli as a compiled binary. Do not change it to
  `json-rpc`. That turns the receive endpoint into WebSocket-only and breaks
  reply polling.
- **`127.0.0.1:` prefixes** keep those ports off the internet.
- **`redis` has no `ports:` at all**, which is why `REDIS_HOST=localhost` cannot
  work.

## Step 10. Configure nginx

nginx routes traffic to the right container and blocks the Signal API from
anyone without your token.

**First remove Ubuntu's default site.** The nginx package ships a config that
also claims port 80 as the default server, and two defaults is a fatal error:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

Now write the config. Put your token in a variable first so you cannot mistype
it in two places:

```bash
SIGNAL_TOKEN='<the second secret you generated>'
```

```bash
sudo tee /etc/nginx/conf.d/syncpilot.conf > /dev/null <<'NGINX'
server {
    listen 80 default_server;
    server_name _;

    location = /signal { return 301 /signal/; }

    location /signal/ {
        if ($http_x_signal_auth != "REPLACE_TOKEN") { return 401; }
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /health { proxy_pass http://127.0.0.1:3001; }
    location = /sync   { proxy_pass http://127.0.0.1:3001; }
    location /admin/queues { proxy_pass http://127.0.0.1:3001; }

    location / { return 404; }
}
NGINX
```

Insert the real token, then test:

```bash
sudo sed -i "s|REPLACE_TOKEN|${SIGNAL_TOKEN}|" /etc/nginx/conf.d/syncpilot.conf
sudo grep -c REPLACE_TOKEN /etc/nginx/conf.d/syncpilot.conf
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager | head -4
```

**You should see** `0` from the grep (no placeholder left), `syntax is ok` and
`test is successful` from `nginx -t`, and `active (running)` from status.

**If you see `duplicate default server`:** you skipped the `rm` above.

**If `grep` returns `1`:** your `SIGNAL_TOKEN` variable was empty. Set it and
run the `sed` again.

Two notes:

- The quotes in `<<'NGINX'` are required. Without them the shell would replace
  `$host` and `$http_x_signal_auth` with empty text.
- Use `restart`, not `reload`. A failed reload can leave nginx stopped, and
  `reload` will not bring it back.

## Step 11. Check what is running so far

```bash
sudo systemctl is-active nginx docker
free -h
```

**You should see** `active` twice, and swap showing `2.0Gi`.

No containers are running yet. That is expected. GitHub starts them in Part C.

---

# Part B. Connect the web app

**Do not skip this part.** It is the step most people miss, and the symptom is a
500 error from your cron with nothing obviously wrong on the server.

> Telemetry is optional and skipped here. To send traces, metrics, and logs
> to Grafana Cloud, see **[observability.md](observability.md)** after the
> deploy works.

## Step 12. Set the Vercel environment variables

**ON YOUR LAPTOP**, from your repo:

```bash
cd web
npx vercel link      # only if not already linked
```

You need four variables set to values that match your server:

| Variable | Value |
| --- | --- |
| `INTAKE_SERVER_URL` | `http://YOUR_STATIC_IP` (no trailing slash) |
| `SIGNAL_CLI_REST_URL` | `http://YOUR_STATIC_IP/signal` |
| `SYNC_SECRET` | the same value as the box's `.env` |
| `SIGNAL_AUTH_TOKEN` | the same value as nginx's config |

Vercel marks these as **Sensitive**, which means you cannot read the current
value back, not in the dashboard and not from the CLI. You can only overwrite. So
remove and re-add:

```bash
for V in INTAKE_SERVER_URL SIGNAL_CLI_REST_URL SYNC_SECRET SIGNAL_AUTH_TOKEN; do
  npx vercel env rm $V production --yes 2>/dev/null
done

npx vercel env add INTAKE_SERVER_URL production
npx vercel env add SIGNAL_CLI_REST_URL production
npx vercel env add SYNC_SECRET production
npx vercel env add SIGNAL_AUTH_TOKEN production
```

Each command prompts you to paste the value.

## Step 13. Redeploy Vercel

**Environment variable changes do nothing until you redeploy.** The running
deployment keeps the old values forever.

```bash
npx vercel --prod
```

**You should see** a deployment URL and `Production` in the output.

A warning about the `created` timestamp: `npx vercel env ls production` shows
when a variable was first created, and that does **not** change when you edit
the value. So an old timestamp does not mean the value is stale. Never use it to
judge whether you updated something. Verify functionally instead, which Part E
covers.

---

# Part C. Set up automatic deploys

After this, pushing to `main` deploys by itself, and GitHub starts your
containers for the first time.

## Step 14. Make a deploy key

Use a separate key from your own. Then you can revoke GitHub's access without
losing your own way in.

**ON YOUR LAPTOP:**

```bash
ssh-keygen -t ed25519 -f ~/.ssh/syncpilot_deploy -N "" -C "github-actions"
```

This creates two files:

- `~/.ssh/syncpilot_deploy`: private key, goes to GitHub
- `~/.ssh/syncpilot_deploy.pub`: public key, goes to the server

Install the public one:

```bash
cat ~/.ssh/syncpilot_deploy.pub | ssh -i /path/to/your-key.pem ubuntu@YOUR_STATIC_IP 'cat >> ~/.ssh/authorized_keys'
```

**Do not use `ssh-copy-id` here.** It reports *"All keys were skipped because
they already exist on the remote system"* even when it installed nothing, so you
get a success message and a broken deploy an hour later.

Verify the key actually landed:

```bash
ssh -i /path/to/your-key.pem ubuntu@YOUR_STATIC_IP 'ssh-keygen -lf ~/.ssh/authorized_keys'
```

**You should see two lines**: the Lightsail RSA key and your new ED25519
`github-actions` key. If you only see one, the append did not work; check for a
trailing space after a `\`.

Now test the new key by itself:

```bash
ssh -i ~/.ssh/syncpilot_deploy -o IdentitiesOnly=yes ubuntu@YOUR_STATIC_IP 'echo auth ok'
```

**`-o IdentitiesOnly=yes` matters.** Without it, ssh may log you in with a
different key or your ssh-agent, and you will believe the deploy key works when
it does not.

**You should see** `auth ok`.

## Step 15. Add the GitHub secrets

**ON YOUR LAPTOP**, from your repo root:

```bash
gh secret set LIGHTSAIL_HOST --body "YOUR_STATIC_IP"
gh secret set LIGHTSAIL_SSH_KEY < ~/.ssh/syncpilot_deploy
gh secret list
```

**You should see** both secrets listed with timestamps.

The `<` redirect on the key matters. It sends the file in byte for byte, so you
cannot drop the `-----BEGIN-----` line or add a stray newline the way manual
pasting does.

**If you paste in the browser instead**, include the `-----BEGIN OPENSSH PRIVATE
KEY-----` and `-----END OPENSSH PRIVATE KEY-----` lines.

## Step 16. Run the first deploy

The workflow lives at `.github/workflows/deploy-server.yml`. This run builds the
image, pushes it to GHCR, and starts your containers for the very first time.

```bash
gh workflow run "Deploy server"
sleep 10
gh run watch
```

**You should see** both jobs go green:

- `build + push image`: typecheck, tests, then build and push
- `pull + restart on Lightsail`: pull and start, ending with a health check

It takes 2 to 3 minutes.

**If `build + push image` fails**, your tests or typecheck are broken. Read the
log; it has nothing to do with the server.

**If `pull + restart on Lightsail` fails**, go to Part F, "The deploy workflow
fails".

Confirm on the server:

```bash
ssh -i ~/.ssh/syncpilot_deploy -o IdentitiesOnly=yes ubuntu@YOUR_STATIC_IP 'docker ps'
```

**You should see three containers:** `syncpilot-worker`, `syncpilot-redis`, and
`signal-api` (marked healthy).

<details>
<summary>Fallback: build on the box by hand</summary>

Only if the workflow cannot run for some reason. This is slow and can run out of
memory, which is why it is not the default:

```bash
cd ~/syncpilot/server
docker build -t ghcr.io/YOUR_USER/syncpilot-server:latest .
docker compose -f docker-compose.production.yml up -d
```

</details>

## Step 17. Link Signal

signal-cli is registered as a **second device** on your Signal account, exactly
like Signal Desktop. You are not re-registering your phone number.

1. Open your app's dashboard in a browser
2. Open the Signal card and show the QR code
3. On your phone: Signal → Settings → Linked devices → **+**
4. Scan the QR code

Then clean up: in that same **Linked devices** list, delete any old dead entries
from previous servers. Signal allows only 5 linked devices.

## Step 18. Back up the Signal folder

This folder is the only thing on the server you cannot rebuild. Your code is in
GitHub and your database is in Neon; this is neither. Losing it means re-linking.

**ON THE SERVER:**

```bash
cd ~/syncpilot/server
tar czf ~/signal-backup-$(date +%F).tar.gz signal-cli-config
```

**ON YOUR LAPTOP:**

```bash
scp -i /path/to/your-key.pem ubuntu@YOUR_STATIC_IP:~/signal-backup-*.tar.gz ~/Downloads/
```

Repeat any time you re-link Signal.

---

# Part D. Set up the cron triggers

The web app needs something to call it on a schedule. This guide uses
[cron-job.org](https://cron-job.org), which is free.

Create two jobs. Both need an `Authorization` header of `Bearer YOUR_CRON_SECRET`
using the `CRON_SECRET` from your Vercel environment.

| Job | URL | Schedule |
| --- | --- | --- |
| Fetch emails | `https://your-app.vercel.app/api/cron/fetch-emails` | Every 15 minutes |
| Poll Signal replies | `https://your-app.vercel.app/api/cron/poll-signal-replies` | Every 1 minute |

Use **Test run** on each.

**You should see** `200` with a body like `{"mode":"queued","accountsQueued":1}`.

**If you see 500:** the handler threw. Almost always one of:

1. `INTAKE_SERVER_URL` points at the wrong or an old IP
2. `SYNC_SECRET` differs between the box and Vercel
3. You changed Vercel variables but did not redeploy

**If you see 401:** your `CRON_SECRET` header is wrong.

**If you see 200 with `accountsQueued: 0`:** not an error. It means no Gmail
account is connected to a user who *also* has Signal linked. Go back to Step 17.

---

# Part E. Prove it actually works

Do all four of these. Each one checks something the others cannot.

## 1. Public health

**ON YOUR LAPTOP:**

```bash
curl http://YOUR_STATIC_IP/health
```

Want: `{"ok":true}`

This proves nginx and the intake server are up. **It proves nothing else.**
this endpoint returns ok even when Redis is dead. Never treat it as "everything
works".

## 2. The Signal API is protected

```bash
curl -i "http://YOUR_STATIC_IP/signal/v1/qrcodelink?device_name=test"
```

Want: `401 Unauthorized`. A 200 here means anyone on the internet can send
Signal messages as you. Go back to Step 10.

```bash
curl -i -H "X-Signal-Auth: YOUR_TOKEN" \
  "http://YOUR_STATIC_IP/signal/v1/qrcodelink?device_name=test"
```

Want: anything that is not 401.

## 3. Redis is really connected

**ON THE SERVER:**

```bash
docker exec syncpilot-worker sh -c 'echo $REDIS_HOST'
docker exec syncpilot-redis redis-cli ping
```

Want: `redis` and `PONG`.

If the first prints `localhost`, fix `.env` and recreate the container:

```bash
cd ~/syncpilot/server
nano .env
docker compose -f docker-compose.production.yml up -d --force-recreate worker
```

`--force-recreate` is required. Compose does not always rebuild a container
just because `env_file` contents changed.

## 4. Vercel is actually talking to the box

This is the check that cannot be faked, and the one to reach for whenever
something seems wrong.

**ON THE SERVER**, after the cron has run at least once:

```bash
sudo grep "POST /sync" /var/log/nginx/access.log | tail -5
```

**You should see** lines ending in `200` with user agent `node`:

```
203.0.113.10 - - [01/Jan/2026:09:04:03 +0000] "POST /sync HTTP/1.1" 200 24 "-" "node"
```

- **`401`** → `SYNC_SECRET` does not match between box and Vercel
- **No lines at all** → Vercel is not reaching this box. `INTAKE_SERVER_URL` is
  wrong, or you did not redeploy after changing it.

Then confirm jobs are being processed:

```bash
docker exec syncpilot-redis redis-cli zcard bull:email-sync:completed
docker exec syncpilot-redis redis-cli zcard bull:email-sync:failed
```

Want a rising `completed` count and `failed` at 0.

You can also open `http://YOUR_STATIC_IP/admin/queues` in a browser and log in
with `QUEUE_DASHBOARD_USER` / `QUEUE_DASHBOARD_PASSWORD`. That dashboard reads
Redis to render, so if it loads at all, the queue is genuinely alive.

---

# Part F. Day to day

## Deploy code

```bash
git add .
git commit -m "your message"
git push origin main
```

That is all. Only changes under `server/` trigger a deploy; `web/` changes go to
Vercel separately.

Watch it with `gh run watch`.

## Change a value in `.env`

Secrets are deliberately not in GitHub, so this still needs SSH:

```bash
ssh -i ~/.ssh/syncpilot_deploy -o IdentitiesOnly=yes ubuntu@YOUR_STATIC_IP
cd ~/syncpilot/server
nano .env
docker compose -f docker-compose.production.yml up -d --force-recreate worker
```

## Read logs

```bash
docker logs -f syncpilot-worker
docker logs -f signal-api
```

`Ctrl+C` stops watching. It does not stop the container.

A healthy worker startup looks like:

```
Queue dashboard mounted at /admin/queues
Listening on port 3001
```

## Restart everything

```bash
cd ~/syncpilot/server
docker compose -f docker-compose.production.yml restart
```

## Check memory

```bash
free -h
docker stats --no-stream
```

Read the **`available`** column, not `free`. Linux keeps `buff/cache` full on
purpose and hands it back on demand, so a low `free` number is normal.

Typical healthy figures: signal-api ~150 MB, worker ~70 MB, redis ~2 MB, so
about 220 MB of containers with 450 MB or so available.

Some swap in use is normal after a build and is not a problem by itself. To tell
residue from real pressure:

```bash
vmstat 1 5
```

If the `si` and `so` columns are near zero, it is residue. Ignore it.

## Roll back

Every deploy also tags the image with the commit SHA.

```bash
cd ~/syncpilot/server
docker pull ghcr.io/YOUR_USER/syncpilot-server:GOOD_COMMIT_SHA
docker tag ghcr.io/YOUR_USER/syncpilot-server:GOOD_COMMIT_SHA \
           ghcr.io/YOUR_USER/syncpilot-server:latest
docker compose -f docker-compose.production.yml up -d
```

## Rotate a secret

Both halves must change together:

```bash
openssl rand -hex 32
```

- **`SYNC_SECRET`:** edit the box's `.env`, recreate the worker, then update
  Vercel and redeploy.
- **`SIGNAL_AUTH_TOKEN`:** edit `/etc/nginx/conf.d/syncpilot.conf`,
  `sudo nginx -t && sudo systemctl reload nginx`, then update Vercel and
  redeploy.

Between the two changes, requests fail. Do them back to back.

---

# Part G. When something breaks

## `apt install` says "Unable to locate package"

You used `docker-compose-plugin`. On Ubuntu it is `docker-compose-v2`.

Because apt installs nothing when one package is missing, git and nginx will
also be absent. Re-run the whole Step 6 command with the right name.

## nginx says "duplicate default server"

Ubuntu's nginx package installs its own site that also claims port 80.

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## nginx returns 502

nginx is fine; the container behind it is not answering.

```bash
docker ps
curl -v http://127.0.0.1:3001/health
docker logs syncpilot-worker --tail 50
```

If `curl` prints nothing at all, the container is not up.

## `/health` returns ok but nothing works

Expected. `/health` never touches Redis. Use Part E check 4 instead. The usual
cause is `REDIS_HOST=localhost`.

## The cron returns 500

The handler caught an exception. In order of likelihood:

1. `SYNC_SECRET` mismatch → check nginx access log for `POST /sync` with 401
2. `INTAKE_SERVER_URL` wrong or stale → check for no `/sync` lines at all
3. Vercel not redeployed after the variable change
4. A database problem

The exact answer is in Vercel → your project → **Logs**, filtered to the cron
route. Look for `fetch-emails handler failed` and read the attached error.

## The deploy workflow fails at the SSH step

In order:

1. Is `LIGHTSAIL_HOST` set? `gh secret list`. An empty one gives
   `error: missing server host`.
2. Did the whole private key get in? Re-run
   `gh secret set LIGHTSAIL_SSH_KEY < ~/.ssh/syncpilot_deploy`.
3. Is the key on the server?
   `ssh -i /path/to/your-key.pem ubuntu@IP 'ssh-keygen -lf ~/.ssh/authorized_keys'`
   You want two fingerprints. One means Step 14 did not work.
4. Does the key work by hand?
   `ssh -i ~/.ssh/syncpilot_deploy -o IdentitiesOnly=yes ubuntu@IP 'echo ok'`
5. Is port 22 still open in the Lightsail firewall?

## The deploy fails on the health check

Log ends with `curl: (56) Recv failure: Connection reset by peer`, right after
the container started.

The container was recreated and had not finished booting. The workflow polls for
60 seconds, so if it still times out, something is genuinely wrong with startup:

```bash
docker logs syncpilot-worker --tail 40
```

## A container keeps restarting

Usually out of memory.

```bash
docker ps -a
docker logs syncpilot-worker
free -h
```

In order:

1. Confirm swap is on. `free -h` must show `2.0Gi`. If it shows `0B`, run
   `sudo swapon /swapfile` and check your `/etc/fstab` line from Step 5.
2. Compile instead of using `tsx`. `package.json` has `"start": "tsx server.ts"`,
   which transpiles TypeScript at runtime across two processes. Building with
   `tsc` and running plain `node` saves 40 to 80 MB.
3. Only then, move to the $12 plan: snapshot the instance, create a new one from
   the snapshot on the larger plan.

Remember Lightsail plans only go **up**. Never jump to step 3 first.

## Signal stopped replying

```bash
docker logs signal-api
docker pull bbernhard/signal-cli-rest-api:latest
docker compose -f docker-compose.production.yml up -d
```

An outdated signal-cli image throws a `getServerGuid` error and silently drops
incoming replies, so keep the image on `latest`.

Also confirm `MODE` is still `native`. In `json-rpc` mode the receive endpoint
becomes WebSocket-only and reply polling breaks.

## Container start downloads pnpm every time

Logs show `Corepack is about to download ... pnpm`. This means you are on an old
image. `corepack` caches pnpm per-user, so a build as root leaves nothing for
`USER node`. The `Dockerfile` now uses `npm install -g pnpm@<version>` instead.
Pull the latest image.

---

# Cost

Example figures from one month of running this stack on an oversized
instance, versus the same workload on Lightsail:

| Item | EC2 `c7i-flex.large` | Lightsail $7 |
| --- | --- | --- |
| Compute | ~$71 | included |
| Disk | ~$2 | included |
| Public IPv4 | ~$4 | included |
| Data transfer | ~$0 | included (2 TB) |
| **Monthly** | **~$77** | **$7** |

The old bill was not about traffic or user count. EC2 charges by the hour for
the machine being switched on, and `c7i-flex.large` is a compute-optimized
instance running a workload that idles below 1% CPU.

Lightsail bundles compute, disk, IP, and bandwidth into one flat price, which is
why it wins even against a right-sized EC2 instance. The IPv4 charge alone is
half the bundle price.

Set a budget alarm so a surprise cannot repeat: AWS Billing console →
**Budgets** → $10/month with an email alert.

---

# Not covered here

- **HTTPS.** This runs on plain HTTP to an IP address. Traffic between Vercel
  and the box is unencrypted. To fix it you need a domain name pointed at the
  static IP, then Certbot for a free certificate. Worth doing before real users.
- **`server/.env` changes.** Deliberately not in GitHub, so still manual.
- **nginx config changes.** Lives at `/etc/nginx/conf.d/syncpilot.conf` on the
  server, not in the repo.
- **Database migrations.** There is no auto-migrate on deploy. Run
  `pnpm db:migrate` against production yourself after generating migrations, or
  routes will 500 on missing tables.
