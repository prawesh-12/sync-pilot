# Layout

## The shell

The global chrome forms an inverted L: the sidebar down the left and the window's top edge. It
controls what the content area shows and it recedes. The content sits in one panel lifted off the
chrome.

```
┌ chrome (--bg-chrome) ─────────────────────────────────────────────┐
│ sidebar          ┌ content panel (--bg-panel, 12 px radius) ────┐ │
│ 240-280 px       │ location bar  (44 px)   crumbs ...  actions  │ │
│                  ├──────────────────────────────────────────────┤ │
│                  │ view bar (optional, 40 px) tabs ... display  │ │
│                  │                                              │ │
│                  │ content                                      │ │
│                  │                                              │ │
│                  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────── 8 px gutter ─────────┘
```

- The panel is inset 8 px from the window on the top, right and bottom; the sidebar sits flush on
  the chrome to its left. The panel's edge is the only line between navigation and content, so
  the sidebar has no border of its own.
- On a phone there is no sidebar and no inset: the panel fills the screen, a compact top bar
  holds a menu button and the page title, and the sidebar opens as a drawer.
- In a desktop app, window controls and back/forward/history buttons live in the sidebar's top
  strip; in a browser they disappear and nothing else moves. Design so either works.

## The sidebar

Anatomy, top to bottom, all on one alignment grid (one icon column, one text column, one right
edge shared by every trailing element):

1. **Top row:** the workspace or product name with a chevron menu on the left (switch workspace,
   account items if the product has no bottom account row); search and a compose button (the
   product's "new thing" action) on the right. The compose button is the only boxed button.
2. **Personal items** with no group label: what belongs to the signed-in user (their inbox,
   tasks, orders, appointments), each an icon and a label, with a count right-aligned where
   something needs them.
3. **Groups** with a small label (12 to 13 px, quaternary text) and a caret right after the word,
   always visible, collapsing the group. More vertical space above each group than between rows.
4. **Folders and teams** show their caret right after their name, not at the row's far end;
   their children indent so the child's icon starts under the parent's text.
5. **Bottom:** an account row (avatar, name, a chevron) or only a small help button, muted like
   the rows above it.

Rows: 32 to 36 px tall, 8 px radius, 18 px icon in quaternary text, label in tertiary text,
medium weight. Hover lifts the label to secondary; active is a filled `--bg-selected` row with
primary text and an icon one step brighter. Inactive rows must read clearly dimmer than the
active one.

A collapsed sidebar becomes a 56 px rail of the same icons with tooltips to the right. The
collapse animates the outer width while each version keeps its full width inside and cross-fades,
so labels never re-wrap mid-animation.

## The location bar

44 px, at the top of the content panel, no background of its own beyond the panel.

- **Left:** breadcrumbs (each crumb at most about 200 px and truncating, chevron separators,
  the last crumb in primary text and the rest tertiary) or a single title. A title can carry a
  chevron menu for page-level commands (rename, archive, delete).
- **Right, always in this place:** the page's actions as small icon buttons with tooltips (copy
  link, share, open externally, toggle a side panel, more). The same action sits in the same spot
  on every page that has it.
- It never repeats in the content: no H1 below that says the same thing.

## The view bar

Only when the page has views, sections or filters. 40 to 42 px, aligned to the content column
below it, not to the window.

- **Left:** view tabs or a segmented control (the active one a filled pill, counts as muted
  numbers after the label).
- **Right:** Filter and Display buttons (icon plus short label), then view toggles. Display holds
  ordering, grouping and which properties show, so the toolbar stays short.

## Content patterns

### A list

Rows of 40 px (one line) or 52 to 56 px (title plus a muted second line). Columns: status icon,
title (takes the space, truncates with an ellipsis), then fixed columns for properties, each
right-aligned and in tertiary text, then time at the far right in quaternary. Headers are
optional; when present they are small tertiary text, not a band. Group headers ("In progress
5") are a quiet row with a status icon, the name and a muted count, sticky while their group
scrolls. Hover is `--bg-hover`; selection is `--bg-selected`; a checkbox for multi-select appears
in the status column on hover. Columns hide under container queries as the list narrows.

### List, detail and properties

The classic three columns of mail, support desks, CRMs, trackers and file managers, all inside one
panel and split by single soft lines:

```
│ list (320-380 px)  │ detail (flexible, reading width)        │ properties (240-280 px) │
│ rows, the selected │ title (20-24 px semibold)                │ label (small, tertiary) │
│ one filled         │ meta line: parent, status chips          │   value (icon + text)   │
│                    │ body text (15 px / 24)                   │ label                   │
│                    │ sub-items list                           │   value                 │
│                    │ activity: one line per event, comments   │                         │
│                    │ as raised cards, a comment box at the end│                         │
```

- The properties panel lists label above value, or label left and value right, never in boxes.
  Each value is an icon and text and is clickable to edit in a menu. Empty values read as an
  action in tertiary text ("Set priority", "Add label").
- Activity events are one quiet line each (avatar, who, what, when) on a thin timeline; comments
  are the only cards in the column.

### Settings

Settings are a mode, not a page:

- The app sidebar is replaced by a settings sidebar: "Back to app" (also Escape) at the top, then
  grouped sections with icons (Account: Profile, Preferences, Notifications, Security;
  Workspace: General, Members, Billing, Integrations; and so on). It is the only list of sections
  on screen. The account menu offers a single "Settings" item, not the sections.
- The content is one column of about 720 px, starting with the section's name as a 24 px
  semibold heading and a one-line description in tertiary text. No location bar and no tab bar on
  desktop; on a phone the sections become tabs under a small title bar.
- Inside, sections each have a small title (14 px medium) and one rounded group of rows. A row
  has a label (14 px medium) and an optional description (13 px tertiary) on the left and its
  control on the right (switch, select, button). No section title repeats the page heading.
- Settings save as they change where possible. When a section needs an explicit save, show one
  bar ("Unsaved changes", Discard, Save) floating at the bottom of the column after the last
  section, and confirm before leaving with unsaved changes.

### Messaging and assistant screens

- The conversation is one centered column (about 720 px; wider when nothing sits beside it) of
  prose at 15 / 24. The user's own messages sit right-aligned in a raised bubble; others' messages
  (or an assistant's answers) sit left with an avatar and no bubble, so long answers read like a
  document.
- Group consecutive messages from one sender; show the time once per group in quaternary text.
- Long or structured content inside a message (a table, a file, a card, code) uses the same
  components as the rest of the app.
- The floating input bar (`components.md`) sits at the bottom of the column.
- A side panel (details, a preview, an attachment) is a second column of the same panel, split by
  one line, with a header level with the conversation's header.

### Empty pages

One sentence that says what the page is for and how it fills, and the one action that fills it.
A muted 24 px icon is optional. No illustration, no second paragraph.

## Split panes and resizing

- Two columns of one panel are divided by a single 1 px line in `--border-subtle`, never by two
  cards with a gap.
- The divider is a 12 px invisible hit area over the 1 px line; it shows no accent on hover, only
  the col-resize cursor (and at most a slightly stronger line).
- Showing or hiding a column eases the split over about 200 ms, with each column's content held
  at its final width and clipped, so nothing re-wraps during the move. A hidden column stays
  mounted for a while so reopening it is instant.
- Remember the user's split per page; never remember a split with a column at zero width.
