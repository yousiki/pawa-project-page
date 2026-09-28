import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  // A single long page: inlining the CSS removes the only render-blocking request.
  build: { format: "file", inlineStylesheets: "always" },
  compressHTML: true,
  devToolbar: { enabled: false },
  fonts: [
    {
      cssVariable: "--font-inter",
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
      name: "Inter",
      provider: fontProviders.fontsource(),
      styles: ["normal"],
      subsets: ["latin"],
      weights: ["300 800"],
    },
    {
      cssVariable: "--font-instrument",
      fallbacks: ["ui-serif", "Georgia", "serif"],
      name: "Instrument Serif",
      provider: fontProviders.fontsource(),
      styles: ["normal", "italic"],
      subsets: ["latin"],
      weights: [400],
    },
    {
      cssVariable: "--font-jetbrains",
      fallbacks: ["ui-monospace", "monospace"],
      name: "JetBrains Mono",
      provider: fontProviders.fontsource(),
      styles: ["normal"],
      subsets: ["latin"],
      weights: [400],
    },
  ],
  image: { layout: "constrained" },
  output: "static",
  site: "https://pawa.siki.moe",
  vite: { plugins: [tailwindcss()] },
});
