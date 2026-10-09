# Foundations

Every value here exists as a CSS variable in `assets/tokens.css`. Use roles, not raw values:
code says `--bg-panel`, never `#1a1918`.

## Colour

### Starting from a brand

Most projects already have a brand colour. Make it the accent and generate everything else:

```bash
node assets/palette.mjs --accent "#6d5efc"                # warm neutral greys, the brand as accent
node assets/palette.mjs --accent "#0f9d58" --hue 150      # greys lean faintly toward the brand
node assets/palette.mjs --accent "#e5484d" --contrast high
```

It prints dark and light blocks to paste over the colour section of `tokens.css`. It keeps the
accent's hue, clamps its lightness so text on it and links in it stay readable in both themes, and
lowers chroma until the colour fits the screen's gamut. A brand with two colours keeps the second
for marketing illustrations only; the interface uses one accent.

Consumer products often lead with the light theme; tools used for hours often lead with dark.
Ship both when the audience is mixed, and follow the system setting until the user chooses.

### How the palette is built

A palette comes from three inputs, worked in OKLCH (or LCH) so that equal lightness steps look
equal to the eye, which HSL does not guarantee:

1. **Base:** a neutral with very low chroma (0.002 to 0.005) and a warm hue around 70 to 80. A
   cool, blue-ish base reads as dated and harsh; too warm reads as muddy. Stay just warm of grey.
2. **Accent:** one hue at moderate chroma (about 0.19 at L 0.62 for a blue). Used sparingly.
3. **Contrast:** how far apart the surface and text steps are. Default contrast for everyday use;
   a high-contrast variant widens every text step and darkens or lightens surfaces by a notch for
   accessibility.

Surfaces step by about 0.02 to 0.04 in lightness; text levels by about 0.08 to 0.14. Keep accent
use limited so the neutral base dominates the screen.

### Dark theme (default)

| Role | Variable | Value | OKLCH |
|---|---|---|---|
| Window, sidebar | `--bg-chrome` | #131211 | 0.18 0.003 75 |
| Page, content panel | `--bg-panel` | #1a1918 | 0.21 0.003 75 |
| Well inside a panel | `--bg-sunken` | #100f0e | 0.165 0.003 75 |
| Cards, menus, inputs | `--bg-raised` | #222120 | 0.245 0.003 75 |
| Hover | `--bg-hover` | #252423 | 0.26 0.003 75 |
| Pressed, open, active tab | `--bg-active` | #302f2d | 0.30 0.003 75 |
| A chosen row | `--bg-selected` | #2a2928 | 0.28 0.003 75 |
| Primary text | `--text-primary` | #f2f1ef | 0.96 0.003 75 |
| Secondary text | `--text-secondary` | #c8c6c3 | 0.83 0.004 75 |
| Tertiary text (labels, inactive nav) | `--text-tertiary` | #9e9c99 | 0.69 0.004 75 |
| Quaternary text (meta, counts) | `--text-quaternary` | #858380 | 0.61 0.004 75 |
| Disabled text | `--text-disabled` | #656361 | 0.50 0.004 75 |
| Subtle line (default) | `--border-subtle` | white 5% | |
| Default line (inputs, popovers) | `--border-default` | white 7% | |
| Strong line | `--border-strong` | white 12% | |
| Accent | `--accent` | #3b82f6 | 0.62 0.19 258 |
| Accent hover / pressed | `--accent-hover` / `--accent-pressed` | #5b98f8 / #2f6fe0 | |
| Accent as text (links) | `--accent-text` | #8ab4f8 | 0.75 0.13 258 |
| Focus ring | `--focus-ring` | accent text at 60% | |

### Light theme

Light is not dark inverted: the chrome is a soft grey, the content panel is near white, and
raised surfaces are white with a hairline border rather than a lighter fill.

| Role | Variable | Value |
|---|---|---|
| Window, sidebar | `--bg-chrome` | #f3f2f0 |
| Page, content panel | `--bg-panel` | #fcfcfb |
| Well | `--bg-sunken` | #f0efed |
| Cards, menus, inputs | `--bg-raised` | #ffffff |
| Hover | `--bg-hover` | #efeeec |
| Pressed, active tab | `--bg-active` | #e6e5e2 |
| Chosen row | `--bg-selected` | #ebeae7 |
| Primary text | `--text-primary` | #1c1b1a |
| Secondary text | `--text-secondary` | #45433f |
| Tertiary text | `--text-tertiary` | #6c6965 |
| Quaternary text | `--text-quaternary` | #8a8783 |
| Disabled text | `--text-disabled` | #b0ada8 |
| Lines | `--border-subtle` / `default` / `strong` | black 6% / 9% / 15% |
| Accent / hover / pressed | | #2f6fe0 / #3b82f6 / #2559c4 |
| Accent as text | `--accent-text` | #2559c4 |

### Status colours

Calm, slightly desaturated so a column of them reads quietly. Each has a 12% tint for the rare
background use (a banner, a pill).

| Meaning | Dark | Light |
|---|---|---|
| Neutral, idle | #909090 | #7a7875 |
| Info, running | #6aa6dc | #2f74c0 |
| Attention, needs action | #e0b05e | #a86c00 |
| Review, in review | #a993d8 | #7558c0 |
| Success | #66b98a | #1f8a52 |
| Danger, failed | #e0706a | #c43d35 |

Use status colour on the icon or dot only, never the whole row or the text of a title.

### Code (only for products that show code)

Products that show code (developer tools, docs, API pages) use one editor theme everywhere code
appears: editors, diffs, code blocks, command output, terminals. One Dark Pro is the default;
run the code surface edge to edge in its region.

| Role | Value | | Role | Value |
|---|---|---|---|---|
| Background | #282c34 | | Keyword | #c678dd |
| Foreground | #abb2bf | | String | #98c379 |
| Gutter, chrome | #21252b | | Number, attribute | #d19a66 |
| Cursor | #528bff | | Function | #61afef |
| Selection | rgba(103,118,150,.38) | | Type, class | #e5c07b |
| Comment | #7f848e | | Property, tag, variable | #e06c75 |
| Operator | #56b6c2 | | Punctuation | #abb2bf |

Terminal ANSI: black #3f4451, red #e05561, green #8cc265, yellow #d18f52, blue #4aa5f0, magenta
#c162de, cyan #42b3c2, white #d7dae0; bright: #4f5666, #ff616e, #a5e075, #f0a45d, #4dc4ff,
#de73ff, #4cd1e0, #e6e6e6.

Diffs tint the whole line once (added green at 8 to 14% alpha, removed red at the same) and
brighten the gutter number; never a second solid block in the gutter.

## Type

One neutral sans family with a display cut for headings, and one monospace. Inter (with Inter
Display) and JetBrains Mono are the defaults. A project with its own brand typeface keeps it if
it is a calm sans with tabular figures and several weights (Geist, Söhne, SF Pro, IBM Plex Sans,
Manrope all work); a decorative or serif brand face is kept for marketing headlines only. Self-host the fonts. Turn on tabular numbers for
anything that changes (`font-variant-numeric: tabular-nums`).

| Role | Size / line | Weight | Use |
|---|---|---|---|
| micro | 12 / 16 | 500 | tooltips, keys, tiny meta |
| small | 13 / 18 | 400 | secondary text, meta, descriptions |
| ui | 14 / 20 | 400 to 500 | default interface text, rows, buttons |
| body | 15 / 22 | 400 | inputs, message boxes |
| prose | 15 / 24 | 400 | reading text, messages, articles |
| title | 15 / 22 | 600 | card titles, section titles |
| heading | 19 / 26 | 600, -0.011em | dialog titles |
| display | 24 / 30 | 600, -0.018em | page headings (settings, empty pages) |
| code | 13 / 20 | 400 | code, paths, hashes |

Hierarchy by weight and colour first: a section title is 14 px medium in primary text over 13 px
tertiary rows, not a bigger font. Monospace only for code, identifiers people copy (order
numbers, API keys, hashes) and keyboard keys.

## Space and size

A 4 px base. Root font 16 px so rem-based spacing stays on the grid.

| Thing | Size |
|---|---|
| Small control (toolbar button, small select) | 28 px |
| Control (button, input, tab) | 32 px |
| Large control | 36 px |
| Navigation row | 32 to 36 px |
| List row (one line) | 40 px; two lines 52 to 56 px |
| Settings row | about 58 px with a description |
| Location bar, panel header, toolbar | 44 px |
| View bar | 40 to 42 px |
| Sidebar | 240 to 280 px; collapsed rail 56 px |
| Reading or settings column | 680 to 760 px |
| Menu min width | 200 px; dialog 440 / 560 px; command palette 640 px |
| Icons | 16 px (dense), 18 px (default in rows and nav), 20 to 24 px only for empty states |
| Gutter around the content panel | 8 px |

## Radii

One radius per kind of thing, used everywhere: 5 px for tiny chips and keys, 8 px for controls,
rows and menu items, 11 to 12 px for cards, menus and popovers, 12 px for the content panel,
16 to 20 px for large floating inputs (a message box, a search bar), full for round icon
buttons and pills.

## Elevation

Elevation is shown by surface step first, shadow second. Only things that float get a shadow:

- popover and menu: `0 8px 24px rgba(0,0,0,.45), 0 2px 6px rgba(0,0,0,.3)` in dark; in light
  `0 8px 24px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.06)` plus a hairline border
- dialog: `0 24px 64px rgba(0,0,0,.55), 0 4px 12px rgba(0,0,0,.35)` in dark, far softer in light
- a floating input bar: a 1 px inner top highlight at 4 to 5% white plus a soft
  drop shadow

Cards on a page do not get shadows; they get a raised surface or a hairline, not both and a shadow.

## Motion

| Token | Value | Use |
|---|---|---|
| fast | 100 ms | hover, focus, tooltip fade |
| base | 150 ms | small reveals, chevrons, checkboxes |
| slow | 200 ms | panels, sidebars, drawers |
| ease out | cubic-bezier(0.2, 0, 0, 1) | anything entering or moving |
| ease in | cubic-bezier(0.4, 0, 1, 1) | anything leaving, rarely |

All durations are 0 under `prefers-reduced-motion`.

Rules that keep motion calm:

- Fade and move a few pixels; never bounce, spring, zoom or rotate decoratively.
- A region that changes width (a sidebar, a split pane) animates its outer box while its content
  holds the final width and is clipped by the box. Content that re-wraps on every frame looks
  like vibration.
- Heavy content (a rich editor, a map, a chart, a video) mounts one frame before an animation starts and
  is torn down well after it ends (or kept mounted while hidden), never in the same frame.
- Clip animating containers with `overflow: hidden` so no scrollbar flashes during the move.
  Check that a library's inline `overflow` style is not overriding the class.
- Measure: every frame of a toggle should take under about 20 ms (see `review.md`).
