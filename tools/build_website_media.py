"""Build the synchronized videos of the project page (media/videos/ here, and static/videos/ on the
`iclr-anonymous` branch).

Every model and stream of one episode is composed into a single clip, so the same forecast
instant is always shown side by side and no manual synchronization is needed. Tiles keep each
model's native field of view and aspect ratio (scaled, padded, never cropped); players are
folded into a near-square grid. All clips are 240 frames at 20 Hz (frame zero is the shared
condition), H.264 without audio or container metadata.

python3 tools/build_website_media.py --out media/videos \
    --gwp-local <gamma-world-pano/local> --external <dir with solaris/, multiworld/, n08/, n16/ copies> \
    --collector <regional-camera delivery dir> --showcase <archived showcase delivery dir>

`--external` holds the paper-source copies of the aligned Solaris rerun, the official
MultiWorld AR50 run and the full-horizon 8/16-player cohorts; their SHA-256 must match
docs/evidence in the yousiki/pawa-paper repository (checked for the Solaris/MultiWorld files through qualitative provenance).
Requires ffmpeg/ffprobe with libx264 and drawtext.
"""

import argparse, json, math, subprocess
from pathlib import Path

ap = argparse.ArgumentParser()
for a in ("--gwp-local", "--external", "--collector", "--showcase"):
    ap.add_argument(a, type=Path, required=True)
ap.add_argument("--out", type=Path, required=True)
args = ap.parse_args()
L, X, OUT = args.gwp_local, args.external, args.out
FONT = "/usr/share/fonts/liberation-sans-fonts/LiberationSans-Bold.ttf"
BAND, GAP, FRAMES, BOX = 34, 12, 240, (1920, 1080)

# Two-player episodes whose PAWA forecasts show no obvious inconsistency and keep the players in
# each other's view (checked by eye on 12 forecast times against the recorded reference).
HARD = [
    "tw16-v7_covis_shared_column",
    "tw18-duet_screen_peek",
    "ez03-stereo_parallel_rail",
    "cv04-circuit_bearing_ladder",
    "ez05-occl_wade_sightline",
]


def tier(case):
    """Two-player episodes live in the two interaction-tier batches and the low-motion tier."""
    for d in ("twelve-second-20260922", "twelve-second-20260922-b2", "twelve-second-20260922-easy"):
        if (L / d / "truth" / case).is_dir():
            return L / d
    raise FileNotFoundError(case)


def dims(path):
    w, h = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v",
            "-show_entries",
            "stream=width,height",
            "-of",
            "csv=p=0",
            str(path),
        ],
        text=True,
    ).split(",")
    return int(w), int(h)


def even(x):
    return int(round(x / 2)) * 2


def compose(name, tiles, cols, tile_w=640):
    """tiles: [(label, [(video, players), ...])]; streams stack vertically inside a tile."""
    inputs, graph, heights, n = [], [], [], 0
    for t, (label, streams) in enumerate(tiles):
        parts = []
        for s, (path, players) in enumerate(streams):
            w, h = dims(path)
            gc = {1: 1, 2: 2, 4: 2, 8: 4, 16: 4}[players]  # grid columns: 4 -> 2x2, 8 -> 4x2, 16 -> 4x4
            rows, pw = math.ceil(players / gc), w // players
            out_h = even(tile_w * rows * h / (gc * pw))
            src = f"[{n}:v]trim=end_frame={FRAMES},setpts=PTS-STARTPTS,fps=20"
            inputs += ["-i", str(path)]
            n += 1
            tag = f"t{t}s{s}"
            if rows == 1:
                graph.append(f"{src},scale={tile_w}:{out_h}[{tag}]")
            else:
                graph.append(f"{src},split={rows}" + "".join(f"[{tag}r{r}]" for r in range(rows)))
                graph += [f"[{tag}r{r}]crop={gc * pw}:{h}:{r * gc * pw}:0[{tag}c{r}]" for r in range(rows)]
                graph.append(
                    "".join(f"[{tag}c{r}]" for r in range(rows))
                    + f"vstack={rows},scale={tile_w}:{out_h}[{tag}]"
                )
            parts.append((tag, out_h))
        heights.append(sum(h for _, h in parts))
        joined = "".join(f"[{p}]" for p, _ in parts)
        graph.append(
            f"{joined}vstack={len(parts)}[t{t}raw]" if len(parts) > 1 else f"[{parts[0][0]}]null[t{t}raw]"
        )
    band = round(BAND * tile_w / 640)  # label band and font scale with the tile width
    tile_h = max(heights) + band
    for t, (label, _) in enumerate(tiles):
        text = label.replace(":", r"\:").replace("'", r"\'")
        graph.append(
            f"[t{t}raw]pad={tile_w + GAP}:{tile_h + GAP}:0:{band}:color=white,"
            f"drawtext=fontfile={FONT}:text='{text}':x={band // 3}:y={band // 4}:fontsize={band * 6 // 10}:fontcolor=0x1b2433[t{t}]"
        )
    rows = math.ceil(len(tiles) / cols)
    layout = "|".join(f"{(i % cols) * (tile_w + GAP)}_{(i // cols) * (tile_h + GAP)}" for i in range(len(tiles)))
    W, H = cols * (tile_w + GAP) - GAP, rows * (tile_h + GAP) - GAP
    k = min(1, BOX[0] / W, BOX[1] / H)
    graph.append(
        "".join(f"[t{t}]" for t in range(len(tiles)))
        + f"xstack=inputs={len(tiles)}:layout={layout}:fill=white,crop={W}:{H}:0:0,scale={even(W * k)}:{even(H * k)}[v]"
        if len(tiles) > 1
        else f"[t0]crop={W}:{H}:0:0,scale={even(W * k)}:{even(H * k)}[v]"
    )
    encode(name, inputs, ";".join(graph), crf=28)


def encode(name, inputs, graph, crf):
    out = OUT / f"{name}.mp4"
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-y",
            *inputs,
            "-filter_complex",
            graph,
            "-map",
            "[v]",
            "-an",
            "-map_metadata",
            "-1",
            "-fflags",
            "+bitexact",
            "-flags:v",
            "+bitexact",
            "-c:v",
            "libx264",
            "-preset",
            "slow",
            "-crf",
            str(crf),
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(out),
        ],
        check=True,
    )
    print(out.relative_to(OUT.parent.parent.parent), f"{out.stat().st_size / 2**20:.1f} MiB")


def gen(root, model, case, stream):
    return root / "results" / model / case / f"{stream}_gen.mp4"


def truth(root, case, stream):
    return root / "truth" / case / f"{stream}_gt.mp4"


# 1. External comparison on seven two-player episodes (POV; the reference closes the grid).
for case in HARD:
    r = tier(case)
    compose(
        f"compare/{case}",
        [
            (
                "Gamma-World (Bidirectional)",
                [(r / "results/gamma_bidirectional" / case / "generated.mp4", 2)],
            ),
            ("Gamma-World (Causal)", [(r / "results/gamma_causal" / case / "generated.mp4", 2)]),
            ("Gamma-World (Distilled)", [(r / "results/gamma_causal_few_step" / case / "generated.mp4", 2)]),
            ("Solaris", [(X / "solaris" / case / "generated.mp4", 2)]),
            ("MultiWorld", [(X / "multiworld" / case / "generated.mp4", 2)]),
            ("PAWA (Causal)", [(gen(r, "gwp_s3_9000", case, "pov"), 2)]),
            ("PAWA (Distilled)", [(gen(r, "gwp_s4_10000", case, "pov"), 2)]),
            (
                "Panorama: PAWA Distilled (top) / Reference",
                [(gen(r, "gwp_s4_10000", case, "pano"), 2), (truth(r, case, "pano"), 2)],
            ),
            ("Reference", [(truth(r, case, "pov"), 2)]),
        ],
        cols=3,
    )

# 2. Teaser: Gamma-World (Distilled) next to PAWA (Distilled), both four-step; Gamma-World has no
# panoramic output.
for case in HARD:
    r = tier(case)
    compose(
        f"pawa/{case}",
        [
            ("Gamma-World (Distilled), POV only", [(r / "results/gamma_causal_few_step" / case / "generated.mp4", 2)]),
            (
                "PAWA (Distilled), POV + panorama",
                [(gen(r, "gwp_s4_10000", case, "pov"), 2), (gen(r, "gwp_s4_10000", case, "pano"), 2)],
            ),
        ],
        cols=2,
        tile_w=960,
    )

# 3. Populations of 4, 8 and 16 players: the paper's four-player figure case, and the lower-median
# episode of PAWA Distilled POV LPIPS for 8 and 16.
four, c4 = L / "twelve-second-20260922-n04", "n04c11-v7_ground_revisit"
compose(
    f"population/{c4}",
    [
        ("Gamma-World (Distilled)", [(four / "results/gamma_causal_few_step" / c4 / "generated.mp4", 4)]),
        (
            "PAWA (Distilled)",
            [(gen(four, "gwp_s4_10000", c4, "pov"), 4), (gen(four, "gwp_s4_10000", c4, "pano"), 4)],
        ),
        ("Reference", [(truth(four, c4, "pov"), 4), (truth(four, c4, "pano"), 4)]),
    ],
    cols=3,
)
for pop, case, players in (
    ("n08", "n08c11-split_and_reunite", 8),
    ("n16", "n16c07-phase_shifted_ring_patrol", 16),
):
    d = X / pop / case
    compose(
        f"population/{case}",
        [
            ("PAWA (Distilled)", [(d / "pov_gen.mp4", players), (d / "pano_gen.mp4", players)]),
            ("Reference", [(d / "pov_gt.mp4", players), (d / "pano_gt.mp4", players)]),
        ],
        cols=2,
        tile_w=960,
    )

# 4. Inference-time removal of the seven cross-attention sites (same checkpoint, noise and seed).
for case in ("tw16-v7_covis_shared_column", "tw18-duet_screen_peek"):
    r = tier(case)
    compose(
        f"ablation/{case}",
        [
            (label, [(p("pov"), 2), (p("pano"), 2)])
            for label, p in [
                ("PAWA (Distilled)", lambda s: gen(r, "gwp_s4_10000", case, s)),
                ("Cross-attention sites disabled", lambda s: gen(r, "gwp_s4_10000_nosites", case, s)),
                ("Reference", lambda s: truth(r, case, s)),
            ]
        ],
        cols=3,
    )

# 4a. The two re-entry examples of the paper's re-entry figure (hash-checked against its provenance;
# the reference is decoded from the evaluation input.npz). Same models and order as the figure.
for case in ("walk_behind-s23-r0", "side_pass-s37-r1"):
    d = X / "reentry" / case
    compose(
        f"reentry/{case}",
        [
            ("Solaris", [(d / "solaris.mp4", 2)]),
            ("Gamma-World (Distilled)", [(d / "gamma_distilled.mp4", 2)]),
            ("Gamma-World (Causal)", [(d / "gamma_causal.mp4", 2)]),
            ("PAWA (Distilled)", [(d / "pov_gen.mp4", 2), (d / "pano_gen.mp4", 2)]),
            ("Reference", [(d / "pov_gt.mp4", 2), (d / "pano_gt.mp4", 2)]),
        ],
        cols=3,
    )

# 4b. PAWA configurations on the paper's showcase episode (appendix stage figure).
case = "tw16-v7_covis_shared_column"
r = tier(case)
compose(f"stages/{case}", [
    (label, [(p("pov"), 2), (p("pano"), 2)]) for label, p in [
        ("PAWA (Causal, 4-step)", lambda s: gen(r, "gwp_s4_initial", case, s)),
        ("PAWA (Causal)", lambda s: gen(r, "gwp_s3_9000", case, s)),
        ("PAWA (Distilled)", lambda s: gen(r, "gwp_s4_10000", case, s)),
        ("Reference", lambda s: truth(r, case, s))]
], cols=2, tile_w=960)

# 5. Collector recordings (not model outputs): first 20 s, HUD already cropped in observer clips.
C, S = args.collector, args.showcase


def clip(name, sources, height=None, seconds=20):
    inputs, graph = [], []
    for i, path in enumerate(sources):
        inputs += ["-t", str(seconds), "-i", str(path)]
        graph.append(f"[{i}:v]fps=20,scale=" + (f"-2:{height}" if height else "960:-2") + f"[s{i}]")
    graph.append(
        "".join(f"[s{i}]" for i in range(len(sources)))
        + (f"hstack={len(sources)}[v]" if len(sources) > 1 else "null[v]")
    )
    encode(name, inputs, ";".join(graph), crf=30)


clip("data/n64-observer", [C / "n64/observer.mp4"])
clip("data/n128-observer", [C / "n128/observer.mp4"])
clip("data/n64-pov-pano", [C / "n64/p63-default.mp4", C / "n64/p63-equirectangular.mp4"], height=360)
clip(
    "data/n64-depth",
    [S / "n64/default-relative-depth.mp4", S / "n64/equirect-relative-depth.mp4"],
    height=360,
)

sizes = {str(p.relative_to(OUT)): p.stat().st_size for p in sorted(OUT.rglob("*.mp4"))}
print(json.dumps({"files": len(sizes), "MiB": round(sum(sizes.values()) / 2**20, 1)}))
