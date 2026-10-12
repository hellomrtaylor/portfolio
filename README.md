# alitaylor.nl

Plain HTML and CSS. No build step, no dependencies.

The site is currently a **wireframe**: greyscale, system fonts, no brand styling. Layout, spacing and responsive behaviour are all in place, so styling it means editing `assets/css/site.css`, starting with the tokens at the top.

## Publish on GitHub Pages

1. Copy everything in this folder into the root of the repo your domain already points at. Replace what's there. Keep the `CNAME` file (it contains `alitaylor.nl`).
2. Commit and push to the branch Pages publishes from (usually `main`).
3. In the repo: Settings > Pages. Check the source branch is `main` / root, and that "Enforce HTTPS" is ticked.

`.nojekyll` tells GitHub to serve the files as they are.

## Adding your images

Every image frame on the site shows a hatched placeholder with a brief and a file path until a file exists at that path. Save each image with exactly that name and it appears. JPG, around 2400px wide, under 400KB each.

| Path | What goes there |
|---|---|
| `assets/img/showcar/cover.jpg` | Homepage card. Tight crop of components, or one screen in two brands |
| `assets/img/showcar/hero.webp` | Added: spread of real components across brands |
| `assets/img/showcar/ui-guild.jpg` | A UI Guild session |
| `assets/img/showcar/modals.jpg` | The 11 modal variants in a grid (very wide) |
| `assets/img/showcar/variables.jpg` | Figma variables panel with brand modes |
| `assets/img/showcar/two-brands.jpg` | One component in two brands |
| `assets/img/showcar/docs.jpg` | A component documentation page |
| `assets/img/showcar/search.jpg` | Search |
| `assets/img/showcar/private-seller.jpg` | Private seller flow |
| `assets/img/showcar/dealer-1.jpg` | Dealer interface |
| `assets/img/showcar/dealer-2.jpg` | Dealer interface |
| `assets/img/competitive-insights/cover.jpg` | Homepage card. Shipped feature |
| `assets/img/competitive-insights/hero.jpg` | Product shot of the feature in the inventory list |
| `assets/img/competitive-insights/old-workflow.jpg` | The manual workflow, messy |
| `assets/img/competitive-insights/workshop.jpg` | Workshop photos or artefacts |
| `assets/img/competitive-insights/iterations.jpg` | Prototype before and after testing |
| `assets/img/competitive-insights/feature.jpg` | Close-up of the feature in use |
| `assets/img/competitive-insights/bad-match.jpg` | A bad default match, annotated |
| `assets/img/cross-border/cover.jpg` | Homepage card. Europe price map |
| `assets/img/cross-border/hero.jpg` | Europe price map, Italy and Denmark called out |
| `assets/img/cross-border/same-car.jpg` | Same car, two markets, two prices |
| `assets/img/cross-border/flow-1.jpg` to `flow-3.jpg` | Publishing flow screens |
| `assets/img/cross-border/marketplace.jpg` | B2B marketplace listing view |
| `assets/img/cross-border/offers.jpg` | Offer or response screens |

Frames marked `contain` in the HTML show the whole image (good for UI screenshots). The rest crop to fill.

## Editing copy

Each page is one HTML file:

- `index.html` (homepage)
- `work/showcar/index.html`
- `work/competitive-insights/index.html`
- `work/cross-border/index.html`

The header, footer and contact block repeat on every page, so change them in all four.

Colours, fonts and the three project tones (`--tone-1` to `--tone-3`) live at the top of `assets/css/site.css`. `components/` shows every component in one place for checking your styles. It is linked from the footer for now and is noindexed.
