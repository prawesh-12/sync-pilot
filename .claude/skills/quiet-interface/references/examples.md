# Worked examples

The same language applied to products in different fields. Each example shows the decisions to
make; reuse the reasoning, not the exact content.

## 1. E-commerce admin: Orders

**One job:** find the orders that need action and act on them.

```
┌ sidebar ────────┐┌ Orders · 1,284                          [Export] [⋯]  ┐
│ ▣ Store         ││ All  Unfulfilled 23  Returns 4   Today ▾   Filter  Display │
│ ⌂ Home          ││───────────────────────────────────────────────────────────│
│ ⊡ Orders     23 ││ ○ #10482  Maya Chen      2 items   $128.00   Unpaid   2m  │
│ ▢ Products      ││ ✓ #10481  Omar Haddad    1 item     $42.50   Paid     9m  │
│ ☺ Customers     ││ ◐ #10480  Lena Fischer   4 items   $310.20   Packing  1h  │
│ ▥ Analytics     ││ ...                                                     │
│                 │└──────────────────────────────────────────────────────────┘
│ Sales channels ▾│
│   Online store  │
│ ○ Ana Ruiz    ⇕ │
└─────────────────┘
```

- The count of unfulfilled orders appears once: on the "Unfulfilled" tab. The sidebar's Orders
  row shows it only if it is the user's to-do; never both.
- Status is an icon in the first column (named in its tooltip); payment state is a word in a
  quiet column, not a coloured pill per row.
- Money right-aligned, tabular, in secondary text; the customer's name in primary.
- Opening an order shows detail and properties columns: items and totals in the middle,
  customer, shipping and payment as property rows on the right, the timeline of events below the
  items. One primary action in the location bar ("Fulfil order").

## 2. SaaS analytics dashboard

**One job:** see whether the product is growing and why.

- View bar: date range presets (7d, 30d, 90d, Custom) and a comparison toggle.
- A strip of four metric tiles divided by hairlines: Active users, New sign-ups, Conversion,
  Revenue. Each: label, value at 28 px, a delta line coloured only where up is good or bad.
- One wide line chart of the main metric with the comparison period as a dashed neutral line.
- Two half-width bar charts (by channel, by plan) with at most five bars each and "Other".
- A table of top accounts at the bottom with right-aligned numbers and a "View all" link.
- No gauge charts, no donut with a number inside, no coloured tile backgrounds.

## 3. Banking app (mobile)

**One job:** know how much money there is and move some.

- Top bar: the user's avatar left, a notification bell right. The balance as the first content:
  "Available balance" in 13 px tertiary, the amount at 34 px semibold tabular, the account name
  below in tertiary.
- Three quick actions as round 48 px icon buttons with 12 px labels (Send, Request, Top up);
  only these three.
- Recent transactions as a list: merchant icon or initial in a 36 px circle, merchant name in
  primary, category in tertiary, amount right-aligned (negatives in primary text with a minus
  sign, income in success colour). Grouped by day.
- Bottom tab bar: Home, Cards, Payments, Insights, Profile.
- Light theme by default for a consumer finance app; the accent is the bank's brand colour put
  through `assets/palette.mjs`.

## 4. Clinic scheduling

**One job:** see today's appointments and handle the next patient.

- Day view of the calendar (`screens.md`) for the selected practitioner, with the current time
  line; appointments as tinted blocks with a solid left edge per appointment type.
- A right panel shows the selected appointment: patient name, age, reason, notes, and actions
  (Check in as primary, Reschedule and Cancel as secondary and ghost).
- Status per appointment (booked, checked in, in session, done, no-show) as an icon on the block,
  never a full-block colour change.
- Sensitive data stays out of list rows and tooltips; it appears only in the detail panel.

## 5. Landing page for a developer API

**One job:** make a developer try the API.

- Hero: "Payments for every app. Five lines of code." with the second sentence in tertiary text;
  lead paragraph of two lines; "Start building" (primary) and "Read the docs" (ghost).
- The hero visual is a real code sample in the code theme beside a rendered result, framed in one
  large rounded card; no illustrations.
- Logos strip, then three feature sections alternating text and visual, then a three-column grid
  of smaller features sharing hairline borders, then one large testimonial, a pricing table with
  the recommended plan marked by a stronger border, and a closing call to action.

## 6. Internal admin tool: user management

**One job:** find a user and change their access.

- Location bar "Users · 4,812" and an "Invite user" primary button.
- View bar: role tabs (All, Admins, Members, Guests) with muted counts; search on the right.
- Table: avatar and name with email below in tertiary, role as a small select that changes in
  place, last active as relative time, a row menu for Suspend and Remove (danger, last).
- Bulk actions appear in place of the tabs when rows are selected.
- Removing a user opens a confirmation dialog naming the user and what they lose access to.

## 7. Marketplace product page (consumer)

**One job:** decide to buy.

- Light theme, the brand accent on the "Add to cart" button only.
- Left: a large product image with small thumbnails below (8 px radius, the selected one with a
  primary-text outline). Right: product name (24 px semibold), price (20 px tabular), rating as
  a small star and "4.8 (312)" in tertiary, a short description, option selects (size, colour as
  small swatches), quantity, and the primary button full width; delivery estimate in tertiary
  below it.
- Details, specifications and reviews below as sections separated by space, not tabs inside
  boxes.

## What stays the same in every example

- The work leads; navigation is quieter than content.
- One primary action per screen; colour only for meaning.
- Counts, titles and actions appear once.
- Hairlines over boxes, space over hairlines.
- Hugeicons at 16 to 18 px, muted.
- The same tokens, generated from the product's own brand colour.
