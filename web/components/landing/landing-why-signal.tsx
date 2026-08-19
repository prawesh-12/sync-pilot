export function LandingWhySignal() {
  return (
    <div>
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Why Signal
      </h2>
      <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-sp-muted">
        Most inbox tools want you to open a new dashboard or install a new app
        — which means the thing built to save you attention now costs you a
        habit. SyncPilot goes to Signal instead, because it&rsquo;s already
        open on your phone, it&rsquo;s encrypted end to end, and it
        isn&rsquo;t owned by a platform that mines your messages for anything.
        Your inbox becomes something you run by texting four characters to a
        thread you already check.
      </p>
      <p className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-sp-muted/80">
        SyncPilot is an independent tool. It connects through Signal&rsquo;s
        own client protocol using a self-hosted signal-cli bridge, and is not
        affiliated with or endorsed by Signal.
      </p>
    </div>
  );
}
