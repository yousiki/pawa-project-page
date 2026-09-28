import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import { site } from "./site";

/** A clip in R2, addressed by its path under `videos/` without the extension. */
export interface Clip {
  height: number;
  path: string;
  width: number;
}

export interface Episode extends Clip {
  label: string;
}

const posters = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/posters/**/*.webp",
  {
    eager: true,
  }
);

export const clipUrl = (clip: Clip): string =>
  `${site.mediaBase}/videos/${clip.path}.mp4`;

export function clipPoster(clip: Clip): ImageMetadata {
  const poster = posters[`../assets/posters/${clip.path}.webp`];
  if (!poster) {
    throw new Error(`Missing poster for ${clip.path}`);
  }
  return poster.default;
}

const episodes = (dir: string, width: number, height: number, first: string) =>
  [
    { id: "tw16-v7_covis_shared_column", label: first },
    { id: "tw18-duet_screen_peek", label: "Episode B" },
    { id: "ez03-stereo_parallel_rail", label: "Episode C" },
    { id: "cv04-circuit_bearing_ladder", label: "Episode D" },
    { id: "ez05-occl_wade_sightline", label: "Episode E" },
  ].map(({ label, id }) => ({ height, label, path: `${dir}/${id}`, width }));

export const clips = {
  depth: { height: 360, path: "data/n64-depth", width: 1360 },
  heroObserver: { height: 448, path: "data/n128-observer", width: 960 },
  observer64: { height: 448, path: "data/n64-observer", width: 960 },
  observer128: { height: 448, path: "data/n128-observer", width: 960 },
  povPano: { height: 360, path: "data/n64-pov-pano", width: 1360 },
  stages: {
    height: 1080,
    path: "stages/tw16-v7_covis_shared_column",
    width: 1690,
  },
} satisfies Record<string, Clip>;

export const rollouts: Episode[] = episodes("pawa", 1920, 608, "Episode A");

export const comparison: Episode[] = episodes(
  "compare",
  1920,
  1072,
  "A · Figure 4"
);

export const reentry: Episode[] = [
  {
    height: 818,
    label: "(a) Walks around behind",
    path: "reentry/walk_behind-s23-r0",
    width: 1920,
  },
  {
    height: 818,
    label: "(b) Steps out to the side",
    path: "reentry/side_pass-s37-r1",
    width: 1920,
  },
];

export const population: Episode[] = [
  {
    height: 770,
    label: "4 players · Figure 7",
    path: "population/n04c11-v7_ground_revisit",
    width: 1920,
  },
  {
    height: 608,
    label: "8 players",
    path: "population/n08c11-split_and_reunite",
    width: 1920,
  },
  {
    height: 1080,
    label: "16 players",
    path: "population/n16c07-phase_shifted_ring_patrol",
    width: 1782,
  },
];

export const ablation: Episode[] = episodes(
  "ablation",
  1920,
  402,
  "Episode A"
).slice(0, 2);

/** The hero poster, shared by the hero and the preload hint in the page head. */
export const heroPoster = () =>
  getImage({
    format: "webp",
    quality: 60,
    src: clipPoster(clips.heroObserver),
    width: clips.heroObserver.width,
  });
