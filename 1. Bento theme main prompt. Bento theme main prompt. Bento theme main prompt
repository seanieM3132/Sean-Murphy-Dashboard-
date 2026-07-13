Turn our dashboard's homepage into a minimal "bento grid" hub — the first thing seen
after the passcode lock. Do this non-destructively:

1. Rename the existing index.html (the goals dashboard) to main.html using `git mv`.
2. Create a NEW index.html as the bento hub.

The hub must match our existing design exactly (same :root tokens, fonts, dark background
with the drifting glow + dot texture, glass cards). Include lock.js, the supabase script,
sync.js, and topbar.js like the other pages. Page heading "Dashboard" using the gradient
.dash-title style.

Layout: a CSS grid, 4 columns, grid-auto-rows ~168px, gap 14px, grid-auto-flow: dense.
Tiles are <a> links wrapped in a glass card (rounded 18px, faint border, backdrop blur).
Two size classes: .big = span 2 cols + 2 rows, .wide = span 2 cols.
Each tile sets its own --accent color and shows: a mono number (·01), an emoji top-right
with a drop-shadow glow in the accent color, a spacer, a bold title, and a footer row with
a grey subtitle on the left and an accent-colored → arrow on the right. On hover: tile lifts
3px, border tints to the accent, and the arrow slides right.

Tiles (in order):
  ·01 🏠 Main      — "Goals & daily plan"        → main.html      (big,  accent #6BE3A4)
  ·02 💪 Fitness   — "Workouts, splits, sessions"→ gym.html       (wide, accent #7DD3FC)
  ·03 💊 Health    — "Supplements & vitals"      → health.html    (small,accent #A7F3D0)
  ·04 💧 Water     — "Hydration"                 → po-water.html  (small,accent #60A5FA)
  ·05 📊 Finance   — "Net worth & spending"      → finance.html   (wide, accent #F2C063)

Responsive: 2 columns under 720px (big becomes 1 row tall), single column under 440px.
Then commit and push to GitHub.
