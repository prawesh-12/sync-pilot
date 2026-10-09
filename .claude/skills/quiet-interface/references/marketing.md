# Marketing, landing and docs pages

The same language applied to pages that are read rather than worked in. The principles do not
change: the product leads, structure is felt not seen, one accent, calm type, nothing twice. What
changes is scale: bigger type, more space, and the product itself as the main image.

## The canvas

- Dark by default: a near-black warm canvas one step below the product's chrome (#0e0d0c works
  with the tokens in `foundations.md`; never pure #000). Panels and cards use the product's
  raised and panel surfaces. A light version uses the light theme's chrome as the canvas and white
  cards.
- Page width: content capped at 1024 to 1200 px and centered, even on very wide screens; reading
  text capped at about 680 px. Side gutter 24 px (16 px on phones).
- Section rhythm: 96 to 160 px between sections, 48 to 64 px between a section's heading and its
  content. Space does the separating; no section borders or alternating background bands.

## Type for marketing

Same family as the product (a neutral grotesque with a display cut), weights around 500 to 600 for
headings, never bold 700 or black.

| Role | Size / line | Tracking |
|---|---|---|
| Hero | 56 to 80 px / 1.05 | -0.025em |
| Section heading | 40 to 48 px / 1.1 | -0.018em |
| Sub-heading | 22 to 28 px / 1.25 | -0.01em |
| Lead paragraph | 17 to 20 px / 1.5 | -0.01em |
| Body | 15 to 16 px / 1.6 | -0.005em |
| Label above a heading | 12 px, 500, uppercase | +0.04em |

Headlines are short: two lines at most, set in primary text, often with the second half in
tertiary text for a quiet emphasis instead of a colour or a gradient. Lead paragraphs are
secondary text, two or three lines.

## The page, top to bottom

1. **Navigation bar:** 64 to 72 px, sticky, the canvas at about 70% opacity with a background
   blur and a hairline bottom border. Logo left; four to six plain text links (14 px, secondary,
   hover to primary); right: a text "Log in" and one small primary button ("Get started",
   "Open app"). Dropdowns open as product menus (`components.md`).
2. **Hero:** a two-line headline, a two-line lead, then one primary and one ghost button side by
   side. Directly below, the product itself: a real screen of the app (rendered UI or a crisp
   screenshot), framed in a large rounded card (16 to 24 px radius, hairline border), wider than
   the text column, often fading into the canvas at its bottom edge. No illustration, no stock
   photo, no abstract 3D shape.
3. **Proof:** a single row of customer logos, monochrome at about 50% opacity, evenly spaced, no
   boxes.
4. **Features:** each major feature is one section: a short label, a heading, a lead sentence and
   a product visual (a cropped, focused piece of the real UI showing exactly that feature).
   Alternate text left and right between sections, or stack text above a wide visual. Smaller
   features sit in a grid of two or three columns divided by hairlines (cells share borders)
   rather than separate cards with gaps and shadows. Each cell: a 18 to 20 px icon in tertiary
   text, a 15 to 16 px title in primary, two lines of secondary text.
5. **Depth sections (optional):** a "how it works" sequence of three or four steps, a changelog or
   "what's new" strip, an integrations grid of monochrome logos.
6. **Testimonial:** one large quote (22 to 28 px, primary, no quotation-mark graphics) with a
   small avatar, name and role in tertiary text. One great quote beats a carousel.
7. **Pricing (if any):** two to four columns with shared hairline borders; the recommended plan
   gets a stronger border and a small neutral "Recommended" pill, not a coloured fill. Prices large
   and tabular; features as short lines with a small check icon in tertiary.
8. **Closing call to action:** a centered heading, one sentence, the same two buttons as the hero.
9. **Footer:** multi-column links in 13 px tertiary text under 12 px quaternary column labels, the
   logo and a one-line legal note. Hairline top border, generous padding.

## Buttons and links on marketing pages

- **Primary:** a pill (full radius), 40 px tall (32 px in the nav), 20 px padding, 14 px medium
  text. On a dark canvas the strongest primary is inverted: a near-white fill (#ecebe9) with dark
  text; the brand accent is then kept for links and small highlights. Pick one approach per site
  and keep it everywhere.
- **Ghost:** the same pill with a hairline border and no fill; hover adds a 5% white fill.
- Hover on buttons: a 1 px lift and a slightly lighter fill over about 120 ms. No glow, no
  gradient border.
- Text links: secondary text with an arrow ("Learn more →") that moves 2 px on hover.

## Product visuals

- Show the real product, at real density. A marketing visual is a crop of the actual interface,
  built with the same tokens, so it never looks like a different product.
- Frame: large radius (16 to 24 px), hairline border, the panel surface; optionally a soft fade
  to the canvas at the bottom or a faint top highlight. No device mockups, no tilted perspective
  for its own sake, no heavy drop shadows.
- Keep text in visuals legible at the page's size; crop tighter rather than shrinking.
- Aspect ratio around 16:10 for wide shots; lazy-load everything below the hero.

## Colour and light on marketing pages

- Monochrome first. The accent appears in links, a small label or two, and inside product visuals
  where the product itself uses it.
- One subtle light effect is allowed: a soft radial glow or gradient behind the hero visual, at
  low opacity (5 to 15%), in a neutral or the accent hue. Not on every section, never a rainbow,
  never animated noise.
- No glassmorphism panels, no neon, no gradient text in headlines.

## Motion on marketing pages

- On scroll, each section's content fades in and rises 8 to 12 px once, over about 300 to 500 ms
  with the ease-out curve, children staggered by 40 to 60 ms. Never on every scroll pass.
- A hero visual may animate in once on load (fade and a small rise). Product visuals may play a
  short real interaction (a list filling, a status changing) if it explains the feature.
- No parallax stacks, no scroll-jacking, no cursor followers. Under `prefers-reduced-motion`,
  content simply appears.

## Docs and content sites

- A left sidebar of sections (the product's sidebar styling: muted rows, group labels, the active
  page a filled row), the article in the center at about 680 px of 15 to 16 px prose on a 1.6
  line height, and an on-this-page list at the right in 13 px tertiary text with the current
  heading in primary.
- Headings in the product's scale (24 / 19 / 15 px semibold), code blocks in the code theme, notes
  and warnings as a left hairline in the status colour with a 12% tint, not a full coloured box.
- A search field in the top bar opening the command palette.

## Marketing checklist

- [ ] Hero headline two lines or fewer; lead three lines or fewer; one primary and one ghost button.
- [ ] The main image is the real product, framed calmly; no stock photos or abstract shapes.
- [ ] Sections separated by space, not by borders or background bands.
- [ ] Feature grids share hairline borders; no shadowed cards.
- [ ] Accent used only for links and small highlights (or for the primary button, consistently).
- [ ] At most one soft glow, behind the hero.
- [ ] Every section reads at 390 px: headlines scale down to 36 to 44 px, visuals crop rather than
      shrink, grids collapse to one column.
- [ ] Motion runs once, softly, and is off under reduced motion.
