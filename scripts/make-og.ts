/**
 * Renders the 1200x630 social preview into apps/web/public/og.jpg from the hero poster.
 *   bun run scripts/make-og.ts
 */
import sharp from "sharp";

const web = new URL("../apps/web/", import.meta.url).pathname;
const W = 1200;
const H = 630;

const background = await sharp(
  `${web}src/assets/posters/data/n128-observer.webp`
)
  .resize(W, H, { fit: "cover" })
  .modulate({ brightness: 0.55, saturation: 0.9 })
  .blur(1.2)
  .toBuffer();

const overlay = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="t" x1="0" x2="1">
      <stop offset="0" stop-color="#5fe0c0"/><stop offset="0.5" stop-color="#bfe9ff"/><stop offset="1" stop-color="#9fb0ff"/>
    </linearGradient>
    <radialGradient id="v" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0" stop-color="#06080c" stop-opacity="0.2"/><stop offset="1" stop-color="#06080c" stop-opacity="0.9"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#v)"/>
  <text x="600" y="300" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial" font-weight="700" font-size="190" letter-spacing="-9" fill="url(#t)">PAWA</text>
  <text x="600" y="385" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#ffffff" fill-opacity="0.95">Panoramic Action-conditioned World Modeling</text>
  <text x="600" y="437" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#ffffff" fill-opacity="0.95">for Multiple Agents</text>
  <text x="600" y="540" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial" font-size="24" fill="#ffffff" fill-opacity="0.6">pawa.siki.moe</text>
</svg>`;

await sharp(background)
  .composite([{ input: Buffer.from(overlay) }])
  .jpeg({ mozjpeg: true, quality: 86 })
  .toFile(`${web}public/og.jpg`);
console.log("wrote public/og.jpg");
