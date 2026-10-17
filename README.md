# alitaylor.nl

Plain HTML and CSS. No build step, no dependencies.

## Site structure

- `index.html`: the homepage (intro, selected work, interests, contact).
- `work/<case-study>/`: the three case studies.
- `404.html`: page not found.
- `draft/`: redirect stubs only. The site was built under `/draft/` before launch; these send old links to the new addresses.
- `robots.txt` and `sitemap.xml` list the public pages for search engines. Add a line to the sitemap if you add a page.

## 8px grid

Spacing, line heights and fixed-height elements (nav pills, buttons, tabs, circles) are multiples of 8px.

- Type: 12px captions on a 16px line, 16px body on 24px, 24px reading text on 32px (16/24 on phones). Headings stay fluid, with `line-height: round(…em, 8px)` so they still sit on the grid.
- Fluid spacing is wrapped in `round(clamp(…), 8px)` so it steps in 8px increments as the screen grows.
- Elements with a 1px border use `calc(… - 1px)` padding so the outer size stays on the grid.

## Cache busting

Every page links `site.css` and `site.js` with a `?v=` version, because GitHub Pages lets browsers cache them for 10 minutes. After changing either file, update the version on every page so visitors get the new file:

```sh
V=$(cat assets/css/site.css assets/js/site.js | sha256sum | cut -c1-8)
grep -rl 'site\.\(css\|js\)?v=' --include=*.html . | xargs sed -i -E "s#(site\.(css|js))\?v=[^\"]*#\1?v=$V#g"
```

## Publish on GitHub Pages

1. Copy everything in this folder into the root of the repo your domain already points at. Replace what's there. Keep the `CNAME` file (it contains `alitaylor.nl`).
2. Commit and push to the branch Pages publishes from (usually `main`).
3. In the repo: Settings > Pages. Check the source branch is `main` / root, and that "Enforce HTTPS" is ticked.

`.nojekyll` tells GitHub to serve the files as they are.

## Adding your images

Every image frame on the site shows a hatched placeholder with a brief and a file path until a file exists at that path. Send PNGs at 2x the shown size; `python3 tools/add_image.py SRC.png assets/img/<project>/<name>.webp` saves a lossless WebP plus a sharpened half-size copy for `srcset`. Add `--photo` for photographic images (high-quality lossy, much smaller).

| Path | What goes there |
|---|---|
| `assets/img/showcar/cover.webp` (+ `cover-620.webp` 1x) | Added: homepage card, design system spread |
| `assets/img/showcar/hero.webp` (+ `hero-1120.webp` 1x) | Added: foundations and components, two brands |
| `assets/img/showcar/modals.webp` (+ `modals-410.webp` 1x) | Added: the 6 modal variants found in production, 820 x 480 |
| `assets/img/showcar/variables.webp` (+ `-550` 1x) | Added: tokens across brand modes, with the mode switcher |
| `assets/img/showcar/components/<brand>.webp` (+ `-550` 1x) | Added: component sheet per brand (autoscout24, autotrader-ca, autotrader-nl, gebrauchtwagen), 1100 x 940 |
| `assets/img/showcar/homepages/<brand>.webp` (+ `-550` 1x) | Added: homepage per brand, same four brands, 1100 x 940 |
| `assets/img/showcar/docs.webp` (+ `-550` 1x) | Added: button documentation (do's, don'ts, hug vs fill) |
| `assets/img/competitive-insights/cover.webp` (+ `cover-620.webp` 1x) | Added: homepage card, competitor table with price development |
| `assets/img/competitive-insights/hero.webp` (+ `hero-1120.webp` 1x) | Added: the feature in the inventory list |
| `assets/img/competitive-insights/workshop.webp` (+ `-550` 1x) | Added: workshop artefacts, insights and sketches |
| `assets/img/competitive-insights/iterations.webp` (+ `-550` 1x) | Added: prototype before and after testing |
| `assets/img/competitive-insights/prototype-{1120,2240}.{mp4,webm}` + `prototype-poster*.webp` | Added: looping prototype walkthrough (muted, plays while on screen) |
| `assets/img/cross-border/cover.webp` (+ `-620` 1x) | Homepage card, 1240 x 620. Added |
| `assets/img/cross-border/hero.webp` (+ `-1120` 1x) | Hero, 2000 x 1000. Added |
| `assets/img/cross-border/research.webp` (+ `-1120` 1x) | Added: research workshop boards, full width in The problem |
| `assets/img/cross-border/key-1.webp` to `key-4.webp` (+ `-550` 1x) | Key product screens, 1100 x 690. key-1 coming-soon banner, key-2 inventory with marketplaces menu, key-3 listing stats (B2C + B2B), key-4 exclusion rule builder. All added |
| `assets/img/cross-border/prototype-{1120,2240}.{mp4,webm}` + `prototype-poster*.webp` | Added: looping prototype walkthrough (muted, plays while on screen) |
| `assets/img/about/ali.webp` (+ `-520` 1x) | Homepage hero portrait, 1040 x 1040, shown as a circle. Added |

Frames marked `contain` in the HTML show the whole image (good for UI screenshots). The rest crop to fill.

## Editing copy

Each page is one HTML file:

- `index.html` (homepage)
- `work/showcar/index.html`
- `work/competitive-insights/index.html`
- `work/cross-border/index.html`

The header, footer and contact block repeat on every page, so change them in all four.

Colours, fonts and the three project tones (`--tone-1` to `--tone-3`) live at the top of `assets/css/site.css`.
