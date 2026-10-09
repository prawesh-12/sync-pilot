# Looking at the result

A screen is not done when it compiles. It is done when it has been seen at three widths, measured
where it moves, and has passed the checklist. Review screenshots, not code.

## Screenshot it

Use the project's existing visual test or screenshot setup if it has one. Otherwise write a
throwaway Playwright script outside the repository (in a temp or scratch folder) and run it
against the dev server:

```ts
// shots.spec.ts, run with: npx playwright test -c <scratch>/pw.config.ts
import { test } from "@playwright/test";

const PAGES = ["/", "/settings", "/items/123"];
for (const width of [1440, 1024, 390]) {
  for (const path of PAGES) {
    test(`${width} ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(`http://localhost:5173${path}`);
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: `<scratch>/shots/${width}${path.replaceAll("/", "_") || "_home"}.png`,
        fullPage: true,
        animations: "disabled",
      });
    });
  }
}
```

```ts
// pw.config.ts
import { defineConfig } from "@playwright/test";
export default defineConfig({ testDir: "<scratch>", workers: 1 });
```

- Mock the API with `page.route` (or the project's fixtures) so states are repeatable: empty,
  loading, error, long names, many items.
- Freeze the clock (`page.clock.setFixedTime`) so relative times do not change between shots.
- Capture interactions too: open the menu, hover the tooltip, focus the field, open the dialog.
- Read the images. Crop and enlarge details (with any image tool) to compare small things side by
  side: two tab bars, two rows, a before and an after.
- Run one browser at a time on a laptop; check free memory before a large run.

## Measure it

Paste these into a Playwright `page.evaluate` around the interaction you are checking.

**Frame times during an animation.** Smooth is under about 20 ms a frame. A long frame right
after an animation ends is a mount or unmount landing late; one at the start is new content's
first layout.

```ts
const frames = page.evaluate(() => new Promise<number[]>((done) => {
  const times: number[] = []; const start = performance.now();
  const tick = (t: number) => { times.push(t); t - start < 700 ? requestAnimationFrame(tick) : done(times); };
  requestAnimationFrame(tick);
}));
await page.getByRole("button", { name: "Toggle sidebar" }).click(); // the change under test
const times = await frames;
const long = times.slice(1).map((t, i) => [t - times[i], t - times[0]]).filter(([gap]) => gap > 20);
console.log(long.map(([gap, at]) => `${gap.toFixed(0)}ms@${at.toFixed(0)}`).join(" "));
```

**Unwanted scrollbars.** List every element that scrolls sideways while it should not:

```ts
await page.evaluate(() => [...document.querySelectorAll("*")]
  .filter((e) => ["auto", "scroll"].includes(getComputedStyle(e).overflowX)
    && e.scrollWidth > e.clientWidth + 1)
  .map((e) => `${e.tagName}.${String((e as HTMLElement).className).slice(0, 60)} ${e.scrollWidth}/${e.clientWidth}`));
```

**What covers what.** `document.elementFromPoint(x, y)` at a clipped or overlapped spot names the
element in front; `getComputedStyle` on it tells you why (an `overflow`, a `z-index`, a width).

## The checklist

### Layers and places
- [ ] The page sits in the content panel with the same location bar as its neighbours.
- [ ] Page actions sit at the right of the location bar; view controls at the right of the view bar.
- [ ] A view bar exists only for views or filters, aligned to the content column.

### Nothing twice
- [ ] No list, count, title, action or sentence appears twice on screen, menus included.
- [ ] No heading repeats the location bar; no section title repeats the page heading; no row
      description repeats its title.

### Calm
- [ ] The chrome is darker and quieter than the content; inactive navigation is clearly dimmer
      than active.
- [ ] At most one border around a group; no divider under a card's header; no cards inside cards.
- [ ] Icons are 16 to 18 px, one set (Hugeicons), muted until active, no coloured plates.
- [ ] Colour appears only for status, the one primary action, focus, links and live states.
- [ ] Active tabs are a filled pill; counts are muted numbers; zero counts are hidden.

### Text
- [ ] Interface text 14 px, meta 12 to 13 px, prose 15 px; only the four text greys.
- [ ] Truncated text ends in an ellipsis and has a tooltip that opens only while truncated.
- [ ] Labels align with the first line of a wrapping value; numbers are tabular.
- [ ] Copy is plain: what it is and what to do, no filler, no repeated words.

### Behaviour
- [ ] Loading, empty, error, long-content and narrow states exist and were captured.
- [ ] At a laptop width nothing truncates that has room; at phone width nothing runs off the
      edge and every action is reachable.
- [ ] Tooltips are small and quick; no native `title`.
- [ ] Animations hold under about 20 ms a frame, flash no scrollbar and re-wrap no text.
- [ ] Focus is visible on every control, and everything works from the keyboard (Escape closes
      the topmost layer).
- [ ] If the product shows code, it uses the one code theme, edge to edge.

### Code
- [ ] Existing components were reused; a new one has a reason.
- [ ] Tokens only; no raw hex or pixel values a token covers; light and dark both checked if the
      product has both.
- [ ] No Lucide or second icon package left in the dependency list.
- [ ] The project's lint, type check and format pass.
