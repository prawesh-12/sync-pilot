# Common screens

Recipes for the screens almost every product has, whatever its domain. Each follows the
principles in `SKILL.md`, the layers in `layout.md` and the parts in `components.md`.

## Sign in, sign up, reset password

- A single centered column, 360 to 400 px wide, on the chrome surface. No card around it on dark;
  on light, an optional white card with a hairline border and 32 px padding.
- From top: the logo mark (24 to 32 px), a heading ("Sign in to Acme", 24 px semibold), one line
  of tertiary text if needed, then the fastest method first (a single sign-on button such as
  "Continue with Google" as a secondary button with the provider's small mark), a quiet "or"
  divider, then email and password fields and the primary button full width.
- Secondary links (forgot password, create an account) are 13 px tertiary text below, never
  buttons. Legal text 12 px quaternary at the bottom of the column.
- Errors appear inline under the field or as one line above the button; the form never clears
  what the user typed. The primary button shows a spinner while waiting and stays the same width.
- No marketing panel beside the form unless the product's brand needs one; if it does, a single
  product image on the right half, never a stock photo.

## Onboarding

- Ask only what changes the first screen. Two to four steps, each one question, with a quiet step
  count ("2 of 3") and a Back link.
- Each step: a heading, one sentence of why, the input (large option cards or a short form), and
  Continue as the primary button. Skip as a text link where a step is optional.
- End in the real product with the user's first item already there or one clear empty state,
  not a "You're all set" page.

## Lists with detail

Mail, tickets, orders, contacts, deals, patients, documents. See `layout.md` for the list, detail
and properties columns. Every list has: a count in the location bar or view bar, a search field
(or the command palette), filters as chips, sorting from the Display menu, keyboard movement
(j/k or arrows, Enter to open), multi-select, and an empty state that says how items arrive.

## Create and edit forms

- One column, 560 to 640 px, labels above fields (14 px medium), help text below (13 px
  tertiary), errors below in danger text replacing the help. Group related fields under a small
  section title with 32 px between groups.
- Field widths hint at their content: a postcode is short, an address is full width. Pair short
  fields side by side (first and last name, city and postcode); never three across.
- Required is the default; mark the few optional fields "(optional)" in tertiary text instead of
  starring the required ones.
- Actions at the end of the form, left-aligned with the fields or right-aligned in a footer:
  primary ("Create order") then secondary ("Cancel"). A long form keeps them in a sticky footer
  bar.
- Validate on blur, not on every keystroke; validate everything on submit and move focus to the
  first error.
- A short form (one to four fields) lives in a dialog; a long one is a page; editing a single
  property happens in place (click the value, change it, press Enter).

## Multi-step flows (checkout, booking, setup)

- A step indicator at the top: step names in 13 px, the current one in primary text, done steps
  with a small check, upcoming in tertiary. No thick progress bars.
- Two columns on desktop: the step's form on the left, a summary on the right in a raised card
  (items, quantities, totals with tabular numbers, the total in 15 px semibold). One column on a
  phone with the summary collapsed into an expandable bar.
- The primary action names the next step ("Continue to payment", "Pay $42.00"), never "Next".
- Payment fields grouped in one bordered block; trust marks small and monochrome.

## Search results

- The query stays in the field at the top. A results count and filters in the view bar.
- Results as list rows: the title with the matched words in medium weight (no yellow highlight),
  a one-line excerpt in tertiary text, and the item's type and location in quaternary.
- Group results by type when the product has several ("Projects", "People", "Documents"), five
  per group with "Show all".
- No results: say what was searched, suggest removing a filter, and offer the closest matches.

## Board (kanban)

- Columns of about 280 to 320 px on the panel surface with 8 to 12 px gaps, each headed by a
  status icon, the column name and a muted count; no column backgrounds, or a very faint sunken
  one.
- Cards are raised surfaces with a hairline border and 8 px radius, 12 px padding: the title in
  14 px, then one line of properties as small icons and avatars in tertiary. No coloured card
  backgrounds; a label shows as a small dot.
- Dragging lifts the card with the popover shadow and leaves a dashed outline where it came from;
  the drop target column gets `bg-hover`.

## Calendar and schedule

- Month view: a grid with hairline borders between days (not boxes around them), day numbers in
  13 px tertiary at the top left, today's number in a small filled accent circle, weekends on the
  sunken surface.
- Week and day views: hours in 12 px quaternary down the left, hairlines on the hour, events as
  rounded blocks in a 12 to 16% tint of their calendar's colour with a 2 px solid left edge and
  the title in primary text.
- The current time as a 1 px accent line with a small dot. Navigation (Today, previous, next, the
  month name) in the location bar; view switch (Day, Week, Month) in the view bar.

## Notifications

- A list in a popover (from a bell in the sidebar or top bar) or an inbox page: each item an
  avatar or icon, one sentence ("Maya commented on Q3 report"), the time in quaternary, and an
  unread dot on the right. Read items are not greyed out; unread ones get the dot and medium
  weight.
- Group by day ("Today", "Yesterday"). "Mark all as read" as a text button in the header.

## Profile and account

- The settings pattern (`layout.md`). Profile: avatar (64 px, with a "Change" text button), name,
  email, and other fields as settings rows. Danger zone last: a separate group with a hairline in
  the danger colour and a secondary button that opens a confirmation dialog.

## Mobile app shell

- A top bar (48 to 56 px) with the page title in 17 px semibold and at most two icon buttons.
- A bottom tab bar (56 px plus the safe area) of four or five destinations, each a 22 to 24 px
  icon over an 11 px label; the active one in primary text, the rest tertiary. No accent fill.
- Lists are full width with 16 px side padding and 52 to 64 px rows; touch targets at least
  44 px. Sheets slide up from the bottom for menus and short forms.
- Native platforms map the same tokens: the surfaces, text levels, radii and motion rules carry
  over to SwiftUI, Jetpack Compose or React Native unchanged.

## Error and system pages

- 404, 500, offline, no permission: inside the normal shell when the user is signed in, so they
  can navigate away. A short heading ("Page not found"), one sentence, and one or two actions
  (Go home, Try again). A muted 24 px icon at most; no illustrations or jokes.
- Maintenance and status pages follow the marketing canvas with a status list as in
  `dashboards.md`.

## Empty first run

- The first time a list or dashboard is empty, show what it will hold and the one action that
  fills it ("Import contacts", "Create your first invoice"), optionally with a sample row in a
  ghosted style. Never a page of feature marketing inside the product.
