# Components

Each recipe gives the shape, sizes and states. Class names are Tailwind v4 against the mapping in
`assets/tokens.css` (`bg-panel`, `text-fg-3`, `border-line` and so on); translate them directly
to CSS where Tailwind is not used. Build on the project's primitives (Radix, shadcn/ui, Headless
UI, native elements) and restyle them; do not swap libraries.

## Buttons

| Variant | Look | Use |
|---|---|---|
| Primary | `bg-accent text-white`, hover `bg-accent-hover` | the one main action on the screen |
| Secondary | `bg-raised border border-line-2 text-fg`, hover `bg-hover` | ordinary actions |
| Ghost | transparent `text-fg-2`, hover `bg-hover text-fg` | toolbar and row actions |
| Danger | `bg-status-danger text-white` | only to confirm a destructive action in a dialog |
| Link | `text-accent-text`, underline on hover | inline navigation in text |

Height 32 px (28 px in toolbars, 36 px for a form's main action), 8 px radius, 14 px medium
text, 12 px horizontal padding, icon 16 px with 6 px gap. Pressed: no scale, a step darker.
Disabled: disabled text colour, no hover, a tooltip on a focusable wrapper explaining why.
Loading: a small spinner replaces the icon, the label stays, the width does not change.

## Icon buttons

28 to 32 px square, 8 px radius (or round when it floats), 16 to 18 px icon in tertiary text;
hover `bg-hover` and the icon to primary. The accessible name and the tooltip come from one
`label`. A toggle shows its pressed state as `bg-active` with the icon in primary text. Accent
only for a live state (recording, live, connected).

## Tooltips

12 px text in secondary colour on the raised surface, 3 by 8 px padding, 6 px radius, a hairline
border and the popover shadow, max width about 280 px, 5 px from the trigger. Open after about
400 ms, then instantly for neighbours within 300 ms (a shared delay group). Fade 100 ms, no zoom,
no slide. A shortcut follows the label as faint keys without boxes. Rules:

- Every icon-only control has one. Menu triggers do not (it would cover the menu).
- Truncated text gets one only while it is truncated: compare `scrollWidth` with `clientWidth`
  on open.
- Times show their full date and time on hover.
- Never the native `title` attribute.

## Tabs and segmented controls

32 px tall items, 8 px radius, 14 px medium text in tertiary colour, 10 px padding; hover
`bg-hover`; active `bg-active` with primary text. Items sit with a 2 px gap on no background,
or inside a `bg-sunken` track with 2 px inner padding for a segmented control. A count follows the
label as a muted tabular number. In a narrow bar the inactive tabs may show only their icon,
each with a tooltip naming it and its shortcut; the active tab shows its name. No underline, no
accent.

## Inputs

32 to 36 px, `bg-raised`, `border-line-2`, 8 px radius, 14 px text, placeholder in quaternary.
Focus: border to the accent at about 60% and no glow beyond a 2 px focus ring. Prefix and suffix
(units, a search icon) sit inside the field in tertiary text. Errors show one line of danger text
under the field and a danger border; never a shake. Labels sit above the field (14 px medium) or
to the left in settings rows.

Selects look like inputs with a chevron at the right; their menu is the standard menu below.
Switches are 28 by 16 px, track `bg-active` off and accent on. Checkboxes are 16 px with a 4 px
radius.

## Menus and popovers

`bg-raised`, `border-line-2`, 11 px radius, popover shadow, 4 px inner padding, min width 200 px.
Items 32 px tall, 8 px radius, 14 px text, an optional 16 px icon in tertiary text, hover
`bg-hover`. A selected choice shows a check at the right; trailing values (a current setting, a
shortcut) sit right-aligned in tertiary text. Groups are separated by a 1 px line with 4 px space
and may have a quiet 12 px label. Destructive items last, in danger text. Open with a 100 ms fade
and a 2 px move; close with a fade. On a phone, choices that would be a submenu sit inline under a
label instead.

## Command palette

Centered near the top, 640 px wide, the menu surface with the dialog shadow and a dimmed
backdrop. A 44 px search field with a search icon and no border of its own, then grouped results
(group labels 12 px quaternary), each row an icon, a title in primary, context in tertiary and a
shortcut right. The highlighted row is `bg-hover`. Enter opens, Escape closes; an optional faint
footer names those keys.

## Dialogs

440 px (confirmations) or 560 px (forms) wide, `bg-raised`, 12 px radius, dialog shadow, 20 to
24 px padding. Title 19 px semibold, a one-line description in tertiary text, the content, then
a footer with actions right-aligned: Cancel (secondary) then the action (primary, or danger when
it destroys). A list inside a dialog (files, items) sits in a `bg-sunken` well with a 300 px max
height, each entry's distinctive part first (a file's name, then its folder in tertiary text).

## Toasts

Bottom right, 360 px, `bg-raised`, hairline border, popover shadow, 11 px radius. A 18 px status
icon, a 14 px medium title, an optional one- to two-line description, an optional text action,
and a ghost close button (never a filled one). 5 s, pause on hover, at most three stacked. Only
for things that happen elsewhere or finish later; a form error stays in the form.

## Cards

Only when the content is a unit the user acts on or reads as a whole (an order summary, a
report, a comment, a receipt). `bg-raised` (or the panel with a hairline), 11 to 12 px radius, one border at most, no
shadow on the page. A card that reports facts:

- a title row: a status icon in its status colour, the title (14 px medium), meta (amount, date)
  right-aligned in tertiary;
- then rows of a muted label column (about 80 px, tertiary) and a value, aligned to the value's
  first line, with no row icons and no dividers between rows;
- then at most one row of actions, right-aligned, without a divider above it.

## Lists and rows

See `layout.md` for list layout. A row is a link or button covering its whole width; inner
controls stop propagation. The status column is exactly as wide as its icon (never narrower, or
the icon is clipped). Titles truncate with an ellipsis and get a truncation tooltip. Unread rows
put the title in medium weight and a small accent dot at the right, not a coloured background.

## Properties and key-value rows

Label in 13 px tertiary, value in 14 px secondary or primary. Values are interactive: hover
`bg-hover` on the value only, a menu or popover to change it. An unset value reads as a quiet
action ("Set priority") in tertiary text with a muted icon.

## Badges, chips and counts

- Counts: a tabular number in quaternary or tertiary text after a label. Hidden at zero.
- A count that needs the user: 18 px tall neutral pill (`bg-active`, secondary text), never
  coloured.
- Labels and tags: a 6 px coloured dot and the label in secondary text inside a 22 px pill with
  a hairline border. Colour lives in the dot only.
- "New", "Beta", "Default": 18 px pill, 12 px medium text, `bg-active` and secondary text.

## Status icons

16 to 18 px, drawn as one family: an empty circle for idle or todo, a dashed circle for backlog
or draft, a half-filled circle for in progress, a check circle for done, a cross circle for
failed or cancelled, a pause or hand for waiting. Colour from the status palette on the icon
only. In lists the icon stands alone, named in its tooltip.

## Breadcrumbs

14 px, crumbs in tertiary text with hover to secondary, the last crumb in primary; chevron
separators 12 px in quaternary; each crumb max about 200 px and truncating; an optional 16 px icon
before a crumb that names an object's type.

## Empty, loading and error states

- Empty: one sentence and one action, centered in the region at a reading width.
- Loading: skeleton blocks in `bg-hover` with a slow (about 1.5 s) shimmer, shaped like the
  result; nothing at all for loads under about 300 ms. No full-page spinners after the first load.
- Error: inline where the content would be, what happened in one sentence and a retry; a page
  that cannot load at all says so in the panel, with the sidebar still usable.

## Floating input bar

For messaging, comments, search-first screens and assistants: a raised card with a 16 to 20 px
radius, a 1 px inner top highlight and a soft shadow, pinned to the bottom of its column. The
text area grows to about 10 to 18 lines (15 / 22). Below it, one 48 to 56 px control row: attach
or a "+" menu on the left, then any options as plain text or bare 16 px icons with tooltips;
on the right a 32 to 36 px round send button (`bg-active` with a dim arrow while empty, accent
once there is something to send). Enter sends, Shift+Enter adds a line. On a narrow bar, options
fold into the "+" menu; the send button never moves.

## Avatars

Circles of 20, 24, 32 or 64 px. Image if there is one, otherwise the initial in 11 to 24 px
medium on `bg-active` with secondary text (never a random bright colour). Groups overlap by a
quarter with a 2 px ring in the surface colour, at most three and then "+4" in tertiary.

## Progress and steps

- Progress bar: 4 px tall, full radius, `bg-active` track, accent fill (success when complete).
  A percentage in tertiary text beside it only when the exact value matters.
- Spinner: 16 px, the loading icon rotating once a second, in tertiary text. Only inside the
  thing that is loading.
- Steps: small numbered or checked circles joined by a hairline, labels 13 px; current in
  primary, done with a check, next in tertiary.

## Pagination

Prefer "Load more" (a ghost button at the end of the list) or infinite loading for feeds. For
tables that need pages: "1-50 of 1,284" in tertiary text and previous and next icon buttons,
right-aligned under the table. No strip of page numbers.

## File upload

A dashed 1 px border (`border-line-3`) on the sunken surface, 8 to 12 px radius, an upload icon
and one sentence ("Drop files here or browse", with "browse" as a link) and the limits in 12 px
quaternary. While dragging over it the border turns accent and the surface `bg-hover`. Each
uploading file becomes a row: icon, name, size in tertiary, a thin progress bar, and a remove
button.

## Date and time pickers

The field looks like an input with a calendar icon at the right. The popover is the menu surface
with a month grid: 32 px day cells, 8 px radius, today in primary medium text, the selected day a
filled accent circle, a range as a `bg-accent-subtle` band between two filled ends, other months
in quaternary. Presets ("Today", "Last 7 days") in a narrow column to the left for range pickers.

## Banners and inline alerts

A row across the top of the content or inside a form: a 2 px left edge in the status colour, a
12% tint of that colour (or the raised surface for neutral notes), a 16 px status icon, one
sentence, an optional text action, and a dismiss button when it can be dismissed. Never a full
saturated colour block.

## Accordions and disclosure

A row with the title in 14 px medium and a small chevron after it (rotating 90 degrees over
150 ms), the content below with the same left edge. Hairlines between items only in a list of
them; a single disclosure has none. Opening animates height with the ease-out curve and never
jumps the page.

## Code surfaces (only for products that show code)

The code theme fills its region edge to edge (`foundations.md`). A code block in prose: 8 px
radius, a 32 px header in the chrome tone with the language or file name in 12 px tertiary and a
copy button, then the code at 13 / 20 with 12 to 16 px padding and horizontal scroll. Inline code:
13 px mono in secondary text on `bg-hover` with 4 px radius and 2 by 4 px padding.
