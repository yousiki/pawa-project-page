export interface Author {
  affiliations: readonly number[];
  marks?: readonly ("*" | "†" | "‡")[];
  name: string;
}

export const site = {
  affiliations: [
    "Alaya Lab",
    "Peking University",
    "Institute of Science Tokyo",
  ],
  /** Set once the paper is announced, e.g. "2610.01234". */
  arxivId: "2610.20240" as string | null,
  authors: [
    { affiliations: [1, 2], marks: ["*"], name: "Siqi Yang" },
    { affiliations: [2], marks: ["*"], name: "Yimu Wang" },
    { affiliations: [1, 2, 3], name: "Ziqi Cai" },
    { affiliations: [2], name: "Chengxuan Zhu" },
    { affiliations: [2], name: "Shuchen Weng" },
    { affiliations: [3], name: "Erwin Wu" },
    { affiliations: [2], name: "Zhaofei Yu" },
    { affiliations: [1], marks: ["‡"], name: "Kaipeng Zhang" },
    { affiliations: [2], marks: ["†"], name: "Boxin Shi" },
  ] satisfies Author[],
  /** Public repositories. */
  code: "https://github.com/yousiki/pawa-pipeline" as string | null,
  dataset: "https://huggingface.co/datasets/YOUSIKI/pawa-dataset" as
    | string
    | null,
  description:
    "PAWA is a dataset and framework for action-conditioned panoramic multiplayer world modeling in Minecraft. A dual-tower model jointly predicts every player's POV and world-stabilized panoramic video.",
  /** Videos live in R2 behind this domain; bump the version prefix when a clip changes. */
  mediaBase: "https://media.pawa.siki.moe/v1",
  name: "PAWA",
  notes: [
    ["*", "Equal contribution"],
    ["†", "Corresponding author"],
    ["‡", "Project leader"],
  ],
  subtitle: "Panoramic Action-conditioned World Modeling for Multiple Agents",
  tagline:
    "Jointly forecasting every player's first-person and panoramic video in a shared Minecraft world.",
  title:
    "PAWA: Panoramic Action-conditioned World Modeling for Multiple Agents",
  url: "https://pawa.siki.moe",
  year: 2026,
} as const;

export const arxivUrl = site.arxivId
  ? `https://arxiv.org/abs/${site.arxivId}`
  : null;
export const pdfUrl = site.arxivId
  ? `https://arxiv.org/pdf/${site.arxivId}`
  : null;

const bibAuthors = site.authors
  .map(({ name }) => {
    const parts = name.split(" ");
    const last = parts.pop();
    return `${last}, ${parts.join(" ")}`;
  })
  .join(" and ");

export const bibtex = `@article{yang${site.year}pawa,
  title   = {{PAWA}: Panoramic Action-conditioned World Modeling for Multiple Agents},
  author  = {${bibAuthors}},
  journal = {arXiv preprint${site.arxivId ? ` arXiv:${site.arxivId}` : ""}},
  year    = {${site.year}},
  url     = {${site.url}}
}`;
