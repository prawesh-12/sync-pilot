# Dashboards, data and tables

Analytics pages, admin panels, usage and billing views, monitoring. The principles carry over
directly: the numbers lead, the chrome recedes, colour means something, and nothing appears twice.

## Page shape

- The usual shell (`layout.md`): location bar with the page title and actions (export, share),
  then a view bar holding the controls that change what every number means: the date range,
  the comparison period, the main filter. Controls that affect one chart live on that chart.
- Content in one column of 1100 to 1280 px, or the full panel width for a monitoring wall.
- Order by question: the three to five numbers the user came for, then the trend that explains
  them, then the breakdown, then the raw table.

## Metric tiles

- A row of three to five equal tiles, or one strip divided by hairlines. On the panel surface
  with a hairline border, or no border at all when the strip is the only thing in the row.
- Inside: the label (13 px tertiary, sentence case), the value (24 to 32 px, semibold, tabular,
  primary), and an optional delta line (13 px: an arrow and a percentage in success or danger
  colour, then "vs last week" in quaternary). A tiny sparkline (32 px tall, a single neutral
  line) is optional.
- Deltas use colour only when direction has a meaning (more errors is bad even though it goes
  up). When it has none, the delta stays neutral.
- A missing value is a dash and a one-word reason on hover, never a zero.

## Charts

- **Grid and axes:** horizontal gridlines only, 1 px in the subtle line colour; no vertical
  gridlines, no chart border, no background fill. Axis labels 12 px quaternary, tabular, few
  ticks (four to six). The baseline at zero is one step stronger.
- **Series:** one series in the accent or in primary text; two in accent and neutral; more from
  a calm categorical set: accent, then the status hues (info, review, success, attention,
  danger) in that order, each desaturated, and grey for "other". Never more than six; group the
  rest.
- **Marks:** lines 1.5 to 2 px with rounded joins and no dots except on hover; bars with 2 to 4 px
  top radius and 2 to 4 px gaps; areas at 10 to 16% opacity under their line. No 3D, no pie
  charts beyond two or three slices (use a bar), no donut with a number inside unless it is the
  only number.
- **Hover:** a vertical hairline at the pointer, dots on each series, and a tooltip in the menu
  style (`components.md`): the date in 12 px tertiary, then one row per series with a 6 px
  colour dot, the name and the value right-aligned and tabular.
- **Legend:** inline above the chart as small dots and names in secondary text; clickable to hide
  a series. No legend for a single series.
- **Titles:** a chart's title is 14 px medium with its total or latest value beside it in
  tertiary; no subtitle that repeats the axis.
- **States:** loading is a flat skeleton the chart's height; empty says "No data for this
  period" and offers to widen the range; partial periods (today) are drawn dashed.

## Tables

- Rows 36 to 40 px, 14 px text; the header 32 px, 12 to 13 px tertiary, sentence case, sticky.
  Hairlines between rows at most; zebra stripes never.
- Text left-aligned, numbers right-aligned and tabular, units in the header not the cells.
  Dates relative when recent ("2h ago") with the full date in a tooltip.
- The first column (the thing the row is about) in primary text; the rest secondary; identifiers
  and hashes in monospace quaternary.
- Sorting from the header (a small chevron on the sorted column only); filtering in the view bar.
- Row actions on hover at the right end, as ghost icon buttons; a whole row may link to its
  detail page.
- Selection: a checkbox column that appears on hover, then a quiet bar ("3 selected" and the
  actions) in place of the view bar's left side.
- Long tables paginate with "Load more" or virtualise; never a page-number strip with ten links.
- On narrow widths, drop the least important columns under container queries, then collapse each
  row into a two-line list item.

## Status and health

- Live state is a small dot (6 to 8 px) in a status colour before the label; pulsing only for "in
  progress", slowly (2 s), and never for more than a few items at once.
- An incident or alert banner sits at the top of the content, full column width, with a left
  hairline in the status colour, a 12% tint, one sentence and one action.

## Filters and date ranges

- Date range: a segmented control of presets (24h, 7d, 30d, 90d) and a "Custom" item that opens a
  calendar popover. The current range is always visible as text.
- Filters: a "Filter" button that opens a menu of fields, then each active filter as a chip
  ("Status is Failed", with a small remove button) in the view bar. "Clear" appears only when a
  filter is set.
