/**
 * Paper tables, copied from tables/*.tex on the arxiv branch.
 * A value wrapped in ** is the best and in __ the second best within its group.
 */
export interface TableRow {
  cells: string[];
  /** Leading cell that spans several rows, as for player counts. */
  group?: { label: string; span: number };
  ours?: boolean;
  /** Draws a separator above the row. */
  sep?: boolean;
}

export interface PaperTable {
  caption: string;
  head: string[];
  id: string;
  rows: TableRow[];
  tab: string;
  title: string;
}

const metrics = ["FVD ↓", "FID ↓", "LPIPS ↓", "PSNR ↑", "SSIM ↑"];

export const tables: PaperTable[] = [
  {
    caption:
      "Two-player interaction tier with 30 episodes and 239 forecast frames per player. Baselines support only POV input, and PAWA additionally receives the initial panoramas. Bold and underline mark the best and second best within each stream.",
    head: ["Model", "Stream", ...metrics],
    id: "two-player",
    rows: [
      {
        cells: [
          "Gamma-World (Bidirectional)",
          "POV",
          "267.1",
          "56.63",
          "0.567",
          "13.08",
          "0.478",
        ],
      },
      {
        cells: [
          "Gamma-World (Causal)",
          "POV",
          "306.7",
          "52.00",
          "0.606",
          "12.46",
          "0.451",
        ],
      },
      {
        cells: [
          "Gamma-World (Distilled)",
          "POV",
          "279.7",
          "58.36",
          "0.584",
          "11.83",
          "0.431",
        ],
      },
      {
        cells: ["Solaris", "POV", "614.9", "77.31", "0.634", "10.42", "0.447"],
      },
      {
        cells: [
          "MultiWorld",
          "POV",
          "771.2",
          "186.06",
          "0.667",
          "11.76",
          "0.395",
        ],
      },
      {
        cells: [
          "PAWA (Causal)",
          "POV",
          "**120.1**",
          "__30.80__",
          "**0.421**",
          "**16.86**",
          "**0.562**",
        ],
        ours: true,
      },
      {
        cells: [
          "PAWA (Distilled)",
          "POV",
          "__138.1__",
          "**28.40**",
          "__0.465__",
          "__15.38__",
          "__0.516__",
        ],
        ours: true,
      },
      {
        cells: [
          "PAWA (Causal)",
          "Panorama",
          "**88.0**",
          "**26.53**",
          "**0.223**",
          "**20.41**",
          "**0.643**",
        ],
        ours: true,
        sep: true,
      },
      {
        cells: [
          "PAWA (Distilled)",
          "Panorama",
          "__98.1__",
          "__28.26__",
          "__0.243__",
          "__19.77__",
          "__0.617__",
        ],
        ours: true,
      },
    ],
    tab: "Two players",
    title: "Table 1",
  },
  {
    caption:
      "12 episodes per population, all players, 239 forecast frames. Scenarios and pool sizes differ between populations, and comparisons are therefore made within each population. At eight players, Gamma-World runs with its simplex player encoding extended from four to eight codes on the same pool. The MAE column of the paper is omitted.",
    head: ["Players", "Model", "Stream", ...metrics],
    id: "populations",
    rows: [
      {
        cells: [
          "Gamma-World (Bidirectional)",
          "POV",
          "752.3",
          "142.95",
          "0.633",
          "13.34",
          "0.487",
        ],
        group: { label: "4", span: 7 },
      },
      {
        cells: [
          "Gamma-World (Causal)",
          "POV",
          "373.0",
          "57.02",
          "0.587",
          "13.06",
          "0.465",
        ],
      },
      {
        cells: [
          "Gamma-World (Distilled)",
          "POV",
          "323.6",
          "56.65",
          "0.577",
          "12.39",
          "0.440",
        ],
      },
      {
        cells: [
          "PAWA (Causal)",
          "POV",
          "138.0",
          "33.49",
          "0.427",
          "16.41",
          "0.550",
        ],
        ours: true,
      },
      {
        cells: [
          "PAWA (Distilled)",
          "POV",
          "167.3",
          "33.86",
          "0.481",
          "15.08",
          "0.506",
        ],
        ours: true,
      },
      {
        cells: [
          "PAWA (Causal)",
          "Panorama",
          "161.9",
          "32.79",
          "0.254",
          "19.08",
          "0.630",
        ],
        ours: true,
      },
      {
        cells: [
          "PAWA (Distilled)",
          "Panorama",
          "194.1",
          "32.94",
          "0.264",
          "18.67",
          "0.619",
        ],
        ours: true,
      },
      {
        cells: [
          "Gamma-World (Bidirectional)",
          "POV",
          "1707.7",
          "213.93",
          "0.681",
          "12.83",
          "0.497",
        ],
        group: { label: "8", span: 7 },
        sep: true,
      },
      {
        cells: [
          "Gamma-World (Causal)",
          "POV",
          "297.3",
          "48.84",
          "0.606",
          "12.21",
          "0.453",
        ],
      },
      {
        cells: [
          "Gamma-World (Distilled)",
          "POV",
          "267.1",
          "48.27",
          "0.586",
          "11.56",
          "0.432",
        ],
      },
      {
        cells: [
          "PAWA (Causal)",
          "POV",
          "111.5",
          "32.32",
          "0.458",
          "15.06",
          "0.536",
        ],
        ours: true,
      },
      {
        cells: [
          "PAWA (Distilled)",
          "POV",
          "141.3",
          "28.90",
          "0.517",
          "13.71",
          "0.494",
        ],
        ours: true,
      },
      {
        cells: [
          "PAWA (Causal)",
          "Panorama",
          "127.9",
          "27.42",
          "0.294",
          "17.31",
          "0.591",
        ],
        ours: true,
      },
      {
        cells: [
          "PAWA (Distilled)",
          "Panorama",
          "135.6",
          "29.52",
          "0.301",
          "16.72",
          "0.577",
        ],
        ours: true,
      },
      {
        cells: [
          "PAWA (Causal)",
          "POV",
          "92.2",
          "28.39",
          "0.467",
          "15.50",
          "0.554",
        ],
        group: { label: "16", span: 4 },
        ours: true,
        sep: true,
      },
      {
        cells: [
          "PAWA (Distilled)",
          "POV",
          "116.7",
          "23.96",
          "0.520",
          "14.15",
          "0.511",
        ],
        ours: true,
      },
      {
        cells: [
          "PAWA (Causal)",
          "Panorama",
          "93.6",
          "23.65",
          "0.333",
          "16.87",
          "0.570",
        ],
        ours: true,
      },
      {
        cells: [
          "PAWA (Distilled)",
          "Panorama",
          "92.5",
          "20.95",
          "0.333",
          "16.66",
          "0.567",
        ],
        ours: true,
      },
    ],
    tab: "4 to 16 players",
    title: "Tables 5 and 6",
  },
  {
    caption:
      "Inference-time removal of the seven cross-attention sites from PAWA (Distilled). Both configurations use the same final distilled checkpoint, 30 two-player interaction episodes, recorded noise, seed 1 and four-step sampler. No model is retrained.",
    head: ["Stream", "Cross-attention sites", ...metrics],
    id: "cross-attention",
    rows: [
      {
        cells: [
          "POV",
          "Enabled",
          "**138.1**",
          "**28.40**",
          "**0.4648**",
          "**15.382**",
          "**0.5157**",
        ],
        ours: true,
      },
      {
        cells: [
          "POV",
          "Disabled",
          "179.0",
          "37.71",
          "0.5096",
          "14.749",
          "0.5094",
        ],
      },
      {
        cells: [
          "Panorama",
          "Enabled",
          "**98.1**",
          "**28.26**",
          "**0.2425**",
          "**19.765**",
          "**0.6172**",
        ],
        ours: true,
        sep: true,
      },
      {
        cells: [
          "Panorama",
          "Disabled",
          "104.0",
          "28.42",
          "0.2444",
          "19.645",
          "0.6142",
        ],
      },
    ],
    tab: "Cross-attention",
    title: "Table 9",
  },
];
