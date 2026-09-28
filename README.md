# PAWA project page

Source of <https://pawa.siki.moe>, the project page of the arXiv version of
*PAWA: Panoramic Action-conditioned World Modeling for Multiple Agents*.
The paper source lives on the `arxiv` branch of this repository; this `site` branch holds only the page.

## Stack

Scaffolded with [Better-T-Stack](https://www.better-t-stack.dev/) (`--frontend astro --web-deploy cloudflare --addons ultracite`, Bun workspaces) and then trimmed to a static site:

- **Astro 7** with `output: "static"`, TypeScript in strictest mode, Tailwind CSS v4.
- **Astro Fonts API** self-hosts Inter, Instrument Serif and JetBrains Mono with preloads and metric-matched fallbacks.
- **Astro Images** turn every figure into responsive AVIF/WebP at build time.
- **Ultracite (Biome)** for lint and format.
- **Cloudflare Workers static assets** (the platform Cloudflare recommends over Pages for new projects). The Worker has no script, so every request is served straight from the asset store at the edge. Config is in `apps/web/wrangler.jsonc`, headers in `apps/web/public/_headers`.
- **Cloudflare R2** holds the videos behind `media.pawa.siki.moe` (immutable caching, range requests). Scaffolded Alchemy infra was replaced by plain Wrangler.

```
apps/web/            Astro app
  src/data/          site metadata, clip list, paper tables (edit these for content changes)
  src/components/    Hero, Player (video tabs), Figure (zoomable), Tables, Citation, ...
  src/scripts/       client TypeScript (lazy video playback, tabs, nav, lightbox, copy)
  src/assets/        paper figures and video posters, optimized at build
  wrangler.jsonc     assets-only Worker bound to pawa.siki.moe
packages/config/     shared tsconfig
scripts/             upload-media.ts (R2), make-og.ts (social preview)
media/               local staging of the clips (git-ignored)
```

## Commands

```sh
bun install
bun run dev            # http://localhost:4321
bun run check          # astro check + ultracite
bun run deploy         # astro build && wrangler deploy
bun run media:upload   # push media/videos to R2 (see below)
bun run og             # regenerate apps/web/public/og.jpg
```

Wrangler needs `wrangler login`. The Cloudflare account is pinned in `wrangler.jsonc`.

## Content

- **arXiv link.** Set `arxivId` in `apps/web/src/data/site.ts`. This enables the arXiv and PDF buttons, the nav button, the Google Scholar `citation_pdf_url` tag and the BibTeX `journal` field. Fill `code` and `dataset` on release.
- **Text, figures and tables** follow the `arxiv` branch: figures from `figures/*.pdf` (rasterized at 2000 px wide), tables from `tables/*.tex`, captions from `figures/*.tex`. When the paper changes, recheck every number and caption. Figure and table numbers match the arXiv PDF (Figures 1 to 5 and 7, Tables 1, 5, 6 and 9).
- **Videos.** The 22 clips are the ones in `static/videos` on the `pages` branch (built by `scripts/build_website_media.py` on `main`). They are H.264 High, yuv420p, `+faststart`, for the widest browser support. A VMAF-guided re-encode (x264 veryslow, CRF 24 to 30) could not make any clip smaller without dropping below VMAF 95.5, so the originals are served as is. Posters are the frame at 1 s, in `src/assets/posters/<group>/<clip>.webp`.
  To change a clip, copy it into `media/videos/<group>/`, bump `VERSION` in `scripts/upload-media.ts` and `mediaBase` in `site.ts` together (objects are cached as immutable), run `bun run media:upload`, then deploy.

## Performance notes

- One HTML document with inlined CSS and JS (about 23 KB compressed). Hashed assets under `/_astro/` are cached for a year.
- Only the hero loop and its poster load up front. Players use `preload="none"`, get their poster when within 800 px of the viewport, play while at least 35 % visible and pause otherwise. Autoplay is off under reduced motion or Save-Data.
- Figures are lazy responsive AVIF/WebP; the full-resolution WebP loads only when a figure is opened.
