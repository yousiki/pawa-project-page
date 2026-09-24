# Anonymous project page

Static page for double-blind review. It has no build step: preview it with
`python3 -m http.server -d website` and open http://localhost:8000.

- `index.html`, `static/css/style.css`, `static/js/main.js`: the page. KaTeX and fonts come from CDNs.
- `static/img/`: the pipeline figure (copied from `figures/collection-pipeline.svg`) and the model
  figure (`figures/model-overview.pdf` rasterized with `pdftoppm -r 200`, resized to 2000 px).
- `static/videos/`: 23 clips, about 63 MiB, built by `scripts/build_website_media.py` (see its
  docstring for sources and layout). Each clip already holds every model in sync.

Episode selection: two-player comparisons use the paper's median and largest-regression cases, plus
the 10/30/50/70/90th percentiles of PAWA (Distilled) POV LPIPS over the 30-episode interaction tier.
Each population (4/8/16) uses its lower-median episode. Tables are copied from `tables/`.

**Anonymity.** Do not serve this page with GitHub Pages from this repository, because the URL shows
the account. Upload the `website/` folder to an anonymous host (for example
anonymous.4open.science, or a fresh anonymous account) or include it in the supplementary zip.
Before uploading, check again for names, hostnames and repository links:
`grep -rniE 'github|huggingface|/home|/root' website`.
