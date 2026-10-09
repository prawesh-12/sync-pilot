# Icons: Hugeicons, never Lucide

One icon set, one style: **Hugeicons, stroke rounded** (free, MIT, 6,000+ icons). Lucide is not
used; neither is any second set on the same screen. If a project already uses Lucide (or Heroicons,
Feather, Tabler, Phosphor), replace it with Hugeicons in the same change and remove the old
package and its imports.

Why this set: its stroke rounded style is a calm, slightly soft line that sits well next to a
neutral grotesque at 13 to 14 px, its coverage is wide enough that no glyph has to be drawn by
hand, and the free set is enough for product UI.

## Using it

### React

```bash
npm install @hugeicons/react @hugeicons/core-free-icons
```

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

<HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.5} color="currentColor" />;
```

Wrap it once in the project (`<Icon icon={...} size="sm" />`) so size and stroke are set in one
place. Export names are the icon's name in PascalCase plus `Icon`: `search-01` is
`Search01Icon`, `arrow-down-01` is `ArrowDown01Icon`, `unfold-more` is `UnfoldMoreIcon`.

### Any framework, no package

Iconify serves the same set under the `hugeicons` prefix
(`https://api.iconify.design/hugeicons.json?icons=search-01,home-01`). `assets/icons.mjs` turns a
list of names into a local module of SVG bodies, so the app ships only the icons it uses, depends
on no icon package and makes no request at run time. Copy it into the project's `scripts/`,
edit its list, run it, and render each body in an `<svg viewBox="0 0 24 24">`. Vue, Svelte and
other wrappers also exist in Hugeicons' own packages if the project prefers them.

## Rules

- **Size:** 16 px in dense rows and inline with 13 px text; 18 px in navigation, rows, menus and
  toolbars; 20 px only for a page-level control; 24 px only in empty states.
- **Stroke:** 1.5 px, and it must not scale with the icon. Set
  `vector-effect: non-scaling-stroke` on the paths (or pass `strokeWidth` adjusted for size) so a
  16 px icon and a 24 px icon have the same line weight.
- **Colour:** `currentColor`, taking the text colour of its context: quaternary or tertiary when
  idle, primary when active. Status icons take their status colour. Never a coloured background
  plate behind an icon.
- **Fewer:** an icon earns its place when it is scanned faster than a word (navigation, status,
  file types, toolbar actions). Rows of labelled facts, settings rows and menu items in a short
  menu usually do not need one.
- **Alignment:** icons sit in a fixed-width column (the icon size) so text starts on one line.
- **Accessibility:** decorative icons get `aria-hidden`; an icon-only button gets its name from
  its label, never from the icon.

## A concept-to-icon map

Names are Hugeicons names (use them with Iconify as `hugeicons:<name>`, or convert to the React
export as above). Every name below exists in the free stroke rounded set; for anything else,
search hugeicons.com or `https://icon-sets.iconify.design/hugeicons/` and confirm the name before
using it.

### Navigation and layout
| Concept | Name |
|---|---|
| Home | `home-01` |
| Inbox, notifications list | `inbox` |
| Search | `search-01` |
| Settings | `settings-01` |
| Menu (hamburger) / list | `menu-01` / `menu-02` |
| Grid view / list view | `grid-view` / `list-view` |
| Sidebar toggle (left / right) | `sidebar-left` / `sidebar-right` |
| Split columns / rows | `layout-2-column` / `layout-2-row` |
| Dashboard | `dashboard-square-02` |
| Maximize / minimize | `arrow-expand-diagonal-01` / `arrow-shrink-02` |
| Chevron down / up / left / right | `arrow-down-01` / `arrow-up-01` / `arrow-left-01` / `arrow-right-01` |
| Expand / collapse all | `unfold-more` / `unfold-less` |
| Arrow (back, next) | `arrow-left-02` / `arrow-right-02` |
| Sort | `arrow-up-down`, `sort-by-down-01` |
| Open in new | `link-square-02` |
| Link | `link-01` |
| More (horizontal / vertical) | `more-horizontal` / `more-vertical` |
| Drag handle | `drag-drop-vertical` |

### Actions
| Concept | Name |
|---|---|
| Add, new | `add-01`, `add-circle` |
| Create, compose | `pencil-edit-02` |
| Edit | `pencil-edit-01`, `edit-02` |
| Close, remove | `cancel-01` |
| Check, confirm | `tick-02` |
| Copy | `copy-01` |
| Delete | `delete-02` |
| Archive | `archive-02` |
| Upload / download | `upload-04` / `download-04` |
| Upload to cloud / image | `cloud-upload` / `image-upload` |
| Attach | `attachment-01` |
| Share | `share-08` |
| Print | `printer` |
| Refresh | `refresh` |
| Undo | `undo` |
| Filter / display options | `filter-horizontal` / `sliders-horizontal` |
| Play / pause / stop | `play` / `pause` / `square` |
| Sign in / sign out | `login-01` / `logout-01` |
| Bookmark | `bookmark-02` |
| Like, favourite, rate | `thumbs-up` / `favourite` / `star` |
| Show / hide | `view` / `view-off` |
| Lock / security | `square-lock-02` / `shield-01` |
| Key, password | `key-01` |
| Fingerprint, biometrics | `fingerprint-scan` |
| QR code | `qr-code` |
| Theme light / dark | `sun-03` / `moon-02` |
| Microphone | `mic-01` |

### Status and feedback
| Concept | Name |
|---|---|
| Idle, to do | `circle` |
| Draft, planned | `dashed-line-circle` |
| Done, success | `checkmark-circle-02` |
| Verified | `checkmark-badge-01` |
| Failed, cancelled | `cancel-circle` |
| Skipped, not applicable | `minus-sign-circle` |
| Blocked, unavailable | `unavailable` |
| Warning | `alert-02` |
| Error | `alert-circle` |
| Info | `information-circle` |
| Help | `help-circle` |
| Loading | `loading-03` (spin it) |
| Needs attention | `notification-03` |
| Under review | `view` |
| Scheduled, time | `clock-01` |
| History | `history` |
| Timer | `timer-02` |

### People and communication
| Concept | Name |
|---|---|
| User / team / invite | `user` / `user-group` / `user-add-01` |
| Organisation | `building-03` |
| Mail | `mail-01` |
| Phone | `call` |
| Message / thread / question | `message-01` / `message-multiple-01` / `message-question` |
| Notification | `notification-01` |
| Support | `customer-support` |
| Location / map pin | `location-01` |
| Calendar / add event | `calendar-03` / `calendar-add-01` |

### Commerce and money
| Concept | Name |
|---|---|
| Cart / bag | `shopping-cart-01` / `shopping-bag-01` |
| Store | `store-01` |
| Product, package / delivered | `package` / `package-delivered` |
| Shipping | `delivery-truck-01` |
| Price tag / discount | `tag-01` / `discount-tag-01` |
| Card payment | `credit-card` |
| Invoice / receipt | `invoice-01` / `receipt-dollar` |
| Money / bank / wallet | `dollar-01` / `bank` / `wallet-01` |
| Percent | `percent` |
| Gift / ticket / award | `gift` / `ticket-01` / `award-01` |

### Data and analytics
| Concept | Name |
|---|---|
| Bar chart | `chart-column` |
| Line chart / activity | `chart-line-data-01` / `activity-01` |
| Pie chart | `pie-chart` |
| Going up / down | `chart-increase` / `chart-decrease` |
| Analytics up / down | `analytics-up` / `analytics-down` |
| Speed, performance | `dashboard-speed-02` |
| Target, goal | `target-02` |
| Database / server / cloud | `database` / `server-stack-01` / `cloud` |
| API, integration | `api` / `plug-01` |

### Content and files
| Concept | Name |
|---|---|
| File / document | `file-01` / `file-02` |
| New / edited / removed file | `file-add` / `file-edit` / `file-remove` |
| Folder / open / new / library | `folder-01` / `folder-open` / `folder-add` / `folder-library` |
| Note / clipboard | `note-01` / `clipboard` |
| Book, docs / education | `book-open-01` / `school` |
| Image / gallery / video / camera | `image-01` / `image-02` / `video-01` / `camera-01` |
| Globe, website | `globe-02` |
| Task list / done list | `task-01` / `task-done-01` |
| Idea | `bulb` |
| Flag | `flag-02` |

### Devices and places
| Concept | Name |
|---|---|
| Desktop / laptop / tablet / phone | `computer` / `laptop` / `tablet-01` / `smart-phone-01` |
| Home / building | `home-03` / `building-03` |
| Travel: plane / car | `airplane-01` / `car-01` |
| Food / coffee | `restaurant-01` / `coffee-01` |
| Health | `stethoscope` / `hospital-01` |
| Nature, sustainability | `leaf-01` |
| Launch, speed | `rocket-01` / `flash` |

### Developer tools (only for products that show code)
| Concept | Name |
|---|---|
| Code / code file | `source-code` / `file-script` |
| Terminal / command line | `computer-terminal-01` / `command-line` |
| Branch / merge / compare / pull request | `git-branch` / `git-merge` / `git-compare` / `git-pull-request` |
| GitHub | `github` |
| Bot, automation | `robot-01` |
