---
name: quiet-interface
description: A complete, project-independent design language for building any user interface in the calm, precise style of today's most respected software products. Works for any domain and any page type - SaaS apps, admin panels, e-commerce back offices and storefronts, CRMs, finance, health, booking, internal tools, dashboards and data tables, landing, pricing and marketing pages, docs sites, mobile app screens, sign-in, onboarding, forms, checkout, settings. Navigation recedes, the content leads, structure is felt rather than seen, a neutral palette generated from the project's own brand colour, calm dense type, Hugeicons and never Lucide. Ships principles, a palette generator, dark and light tokens, layouts, components, common screens, dashboard and marketing patterns, worked examples across industries, an icon map and a review checklist. Load it before designing, building, restyling or reviewing any page or component in any project, and whenever a prompt asks to design a page, build a landing page or dashboard, make a UI look professional or premium, clean up or make a UI consistent, or names this skill.
---

# Quiet interface

A design language taken from the most respected modern software products and written down so it
can be applied to any project without researching it again. It produces interfaces that are
dense with information yet calm to look at: the interface steps back and the user's content and
task come forward.

It is domain independent (it works the same for orders, patients, invoices, tickets, listings or
messages) and stack independent (rules are stated in plain terms; recipes use CSS variables and
Tailwind classes, which map directly to any styling system or native toolkit).

## Files

Read the ones the task needs before writing any code. Each is self-contained.

| File | Read it for |
|---|---|
| `references/foundations.md` | colour from a brand, dark and light themes, status colours, type, space, radii, elevation, motion |
| `references/layout.md` | the app shell, sidebar, location bar, view bar, list / detail / properties, settings, messaging, split panels |
| `references/components.md` | buttons, inputs, menus, tooltips, tabs, dialogs, toasts, cards, rows, badges, avatars, progress, uploads, date pickers, banners and more |
| `references/screens.md` | sign-in, onboarding, lists, forms, checkout, search, boards, calendars, notifications, profile, mobile shells, error pages |
| `references/dashboards.md` | metric tiles, charts, tables, filters and date ranges |
| `references/marketing.md` | landing, pricing and feature pages, and docs sites |
| `references/examples.md` | the language applied to e-commerce, analytics, banking, clinics, APIs, admin tools and storefronts |
| `references/icons.md` | Hugeicons setup, sizing rules and a map of about 180 concepts to icons |
| `references/review.md` | screenshotting, measuring and checking a screen before it is done |
| `assets/palette.mjs` | generates the full colour token set from any brand colour |
| `assets/tokens.css` | drop-in tokens: dark and light themes plus a Tailwind v4 mapping |
| `assets/icons.mjs` | builds a local, dependency-free icon module from Hugeicons |

## The seven principles

Every rule in the reference files follows from one of these. When a case is not covered, decide by
them.

1. **Do not compete for attention you have not earned.** What orients and navigates recedes;
   what the user came to see or do leads. Navigation is a few steps dimmer than the content;
   inactive items are muted. Once the user has arrived, the chrome stops asking to be looked at.
2. **Structure should be felt, not seen.** Borders and separators multiply quietly until a screen
   is a grid of boxes. Use alignment and space first, a change of surface second, a soft
   low-contrast line last. Round the edges. A line earns its place only where two regions would
   otherwise run together.
3. **One layered layout.** Chrome, then a location bar (where am I, what can I do here), then an
   optional view bar (how am I looking at it), then the content in one panel lifted off the
   chrome. Marketing pages keep the same idea: a quiet navigation bar, then content.
4. **Predictable places; nothing twice.** Page actions always sit in the same place (the right of
   the location bar); view controls always sit at the right of the view bar. A list, count,
   title or action appears once per screen.
5. **Fewer, smaller icons. Colour is for meaning.** Icons are 16 to 18 px, one set, one stroke,
   muted until active, never on coloured plates. Colour says something happened or needs
   attention; it is never decoration.
6. **A neutral, timeless palette.** Near-neutral greys with a whisper of warmth (or of the brand's
   hue), generated in OKLCH from three inputs: base, accent, contrast. One accent, the brand's,
   spent on focus, links, the one primary action and live states.
7. **Dense but calm type.** One sans family, interface text at 13 to 14 px, a tight scale,
   hierarchy by weight and colour before size, tabular numbers. Larger sizes only for page
   headings and marketing.

## How to design anything

Follow these steps in order. Each has a default; depart from it only with a reason you can state.

1. **Name the surface:** product screen, dashboard, marketing page, docs, settings, mobile, or a
   common screen (sign-in, checkout and so on). Read its reference file.
2. **Set up the foundation once per project.** Find the project's existing tokens, components and
   icons. If there are no tokens, run `assets/palette.mjs` with the brand colour (or the default
   blue) and start from `assets/tokens.css`. If the project uses Lucide or another icon set,
   switch to Hugeicons (`icons.md`).
3. **Write the screen's one job in a sentence.** Everything on screen serves it, sits behind a
   menu, or goes.
4. **Inventory and remove.** List every label, control, count, icon, border and sentence (for a
   redesign) or what the job needs (for a new screen). Remove duplicates, labels that repeat a
   heading, icons that repeat a word, borders inside borders, and anything not used here.
5. **Place it in the layers** (`layout.md`, or `marketing.md` for pages that are read).
6. **Compose from the recipes** (`components.md`, `screens.md`, `dashboards.md`), reusing the
   project's own components first and restyling them; a new look for a solved problem is a bug.
   Tokens only: never type a colour or size a token covers.
7. **Align to one grid:** one icon column and one text column per list; right edges line up;
   heights from the scale (28 / 32 / 36 / 40 / 44 px).
8. **Design every state:** loading, empty, error, long content, many items, and narrow widths.
9. **Add motion last and keep it small:** 100 to 200 ms fades with an ease-out curve; nothing
   bounces or zooms; nothing re-wraps while it animates.
10. **Look at it** (`review.md`): screenshots at desktop, laptop and phone widths, compared with a
    finished neighbouring screen, then the checklist. Fix what does not match before calling it
    done.

## Decisions already made

Apply these everywhere without re-deciding them.

- **Surfaces** (dark): chrome (window, sidebar) is darkest, the content panel one step lighter,
  raised surfaces (cards, menus, inputs) one more; a sunken well sits below the panel. Light
  theme: soft grey chrome, near-white panel, white raised surfaces with hairline borders.
- **Four text levels:** primary (what is read), secondary (supporting values), tertiary (labels,
  inactive navigation), quaternary (metadata, placeholders, counts). Never invent another grey.
- **Active states** in tabs, segmented controls and navigation are a soft filled pill on the
  active surface with primary text. Never an accent underline or accent fill.
- **Counts** are muted numbers after a label, hidden at zero, never blue; one that needs action
  may sit in a small neutral pill.
- **One tooltip component:** 12 px, quick, fading, the shortcut as faint keys; never the native
  `title` tooltip; none on menu triggers; on truncated text only while it is truncated.
- **Status** is a small icon or dot in its status colour, named in a tooltip; never a coloured row
  or a coloured title.
- **One primary button per screen** in the accent. Everything else is secondary or ghost.
  Marketing pages may use an inverted near-white pill as the primary instead and keep the accent
  for links; choose one per site.
- **Menus:** the chosen item has a check at the right; groups have quiet labels; destructive items
  come last; no submenus on phones.
- **Settings** are a mode with their own sidebar and a "Back" item, one 720 px column, a heading
  per section and grouped rows (`layout.md`).
- **Icons:** Hugeicons stroke rounded, 1.5 px stroke that does not scale, `currentColor`.
- **Code,** only in products that show it, uses one editor theme (One Dark Pro by default) edge
  to edge.

## Narrow widths

- Design for the width of the region, not the window: container queries on panels and columns.
- As space runs out, drop in this order: decorative words, secondary totals, controls that are
  useless when narrow, then fold what remains into one menu. Never hide what tells the user what
  will happen (what is selected, what the main action does).
- Sidebars become drawers; lists that lived in a sidebar become tabs or a select; submenus become
  inline groups; multi-column forms become one column; tables drop columns, then become lists.
- Touch targets at least 44 px on touch devices.

## Anti-patterns

Each of these makes an interface look generic, dated or noisy.

- Native `title` tooltips; large, slow, zooming tooltips.
- Accent underlines or fills on active tabs; blue counts; accent on anything but focus, links,
  the one primary action and live states; several accent colours.
- The same list, count, title or action twice on a screen; a heading that repeats the location
  bar; a description that repeats its title.
- An icon on every row whose label already speaks; coloured icon plates; mixed icon sets; Lucide.
- Cards inside cards; a card with a header bar, a divider and bordered rows; shadows on cards that
  do not float.
- Labels that float to the middle when a value wraps; text cut with no ellipsis; icons clipped
  by a column narrower than the icon.
- Pure black or pure white text on dark; saturated or blue-tinted greys; gradients, glows and
  glass in product screens (a marketing page may have one soft glow behind its hero).
- Stock photos, abstract 3D shapes and illustrations standing in for the product.
- Dashboards with gauges, many-slice pies, 3D charts, zebra tables, coloured tiles.
- Motion that bounces, zooms, slides on hover, re-wraps text, or flashes a scrollbar.

## Adapting to a project

1. The project's own written rules win over this skill; say which rule decided a conflict.
2. Keep the project's framework and component library; restyle their parts to these recipes.
3. Map these token roles onto an existing token file instead of adding a second system.
4. Brand: the brand colour becomes the accent through `palette.mjs`; a brand typeface stays if
   it is a calm sans with tabular figures, otherwise only for marketing headlines.
5. Light or dark first follows the audience: tools used for hours lean dark, consumer products
   lean light; ship both when unsure.
6. When a request is vague ("make this look professional"), apply the principles, remove
   duplicates, align to the grid, match the nearest finished screen, and show before and after.
   Ask only when the screen's one job is unclear.
