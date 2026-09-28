# Media and episode curation

Moved here from `docs/website.md` in yousiki/pawa-paper when the page tooling left the LaTeX repository.

## Building the clips

`tools/build_website_media.py` composes every model and stream of one episode into one synchronized
H.264 clip. It needs the evaluation outputs on shanda (see its docstring) and writes
`media/videos/<group>/<episode>.mp4`. Posters are the frame at 1 s:

```sh
ffmpeg -ss 1 -i media/videos/<group>/<clip>.mp4 -frames:v 1 -c:v libwebp -quality 72 \
  apps/web/src/assets/posters/<group>/<clip>.webp
```

Then upload with `bun run media:upload` (bump the version prefix when a clip changes).

Figures 1 to 3 in `apps/web/src/assets/figures/` are `figures/teaser.pdf`, `collection-pipeline.pdf`
and `model-overview.pdf` of the paper rasterized with `pdftoppm -r 250` and resized to 2000 px wide.
Figures 4, 5 and 7 come from `figures/*-tight.pdf`.

## Episode curation

Episode selection: the seven two-player episodes were chosen by checking the ground truth by eye for windows in which the players appear in each other's POV (tw16, tw23, tw18, tw06 from the interaction tier; ez01, ez11, ez06 from the low-motion tier). Slot F was chosen by reviewing the generated PAWA videos of all remaining episodes; ez05 and cv06 were tried there first and dropped for poor visual quality. tw06 is also the paper's largest-regression case. The ablation uses tw16 and tw23, because the inference-time site ablation was only run on the interaction tier. Every episode shown in a paper figure also has a clip: tw16 (teaser, main comparison, appendix external and stage figures; the stage clip adds PAWA (Causal, 4-step)) and n04c11 (appendix four-player figure). If a paper figure changes episode, add its clip here too. 8/16 use the lower-median episode by PAWA (Distilled) POV LPIPS. Tables and figure captions are copied from `tables/` and `figures/*.tex`; section text follows `sections/`. When the paper changes, re-check every number and caption on the page against those files.

Episode curation (latest): every shown clip was checked by eye against the reference at 12 forecast times for obvious generation inconsistencies (close-range blobs, hallucinated faces, scene drift) and for co-players in view. Two-player: tw16, tw18, ez03, cv04 (cv04 is a development episode), plus ez05 as Episode E, added at the owner's request. Four: n04c11. Eight: n08c11. Sixteen: n16c07, the least-flawed of 12; no sixteen-player episode is fully free of dark or blurred views.

Experiments layout: each block is a paper figure (Figures 4, 5 and 7, exported from figures/*-tight.pdf) followed by its videos, the figure episode first. The re-entry clips come from the pawa-simple workspace and are hash-checked against docs/evidence/reentry-examples-20260925; the reference is decoded from input.npz. Paper tables sit in one collapsed block, labelled with their paper numbers (1, 5-6, 9).

## ICLR anonymous page

The double-blind version of the page (no authors, no external requests) is kept on the
`iclr-anonymous` branch of this repository, which is the former `pages` branch of the paper
repository. It is a plain static site (`index.html`, `static/`) and was used for the ICLR 2027
supplementary material. Do not deploy it.
