/**
 * Uploads the clips in media/videos to the R2 bucket behind media.pawa.siki.moe.
 *
 * The clips come from static/videos on the `pages` branch (built by scripts/build_website_media.py
 * on `main`). Objects are immutable under their version prefix, so bump `mediaBase` in
 * apps/web/src/data/site.ts and VERSION here together whenever a clip changes.
 *
 *   bun run media:upload            upload every clip
 *   bun run media:upload --dry-run  list what would be uploaded
 */
import { Glob, spawn } from "bun";

const BUCKET = "pawa-media";
const VERSION = "v1";
const ROOT = new URL("../media/", import.meta.url).pathname;
const CACHE_CONTROL = "public, max-age=31536000, immutable";
const dryRun = process.argv.includes("--dry-run");

const files = [...new Glob("videos/**/*.mp4").scanSync(ROOT)].sort();
if (files.length === 0) {
  throw new Error(`No clips found under ${ROOT}videos`);
}

for (const file of files) {
  const key = `${BUCKET}/${VERSION}/${file}`;
  console.log(`${dryRun ? "would upload" : "uploading"} ${key}`);
  if (dryRun) {
    continue;
  }
  const proc = spawn(
    [
      "bunx",
      "wrangler",
      "r2",
      "object",
      "put",
      key,
      "--remote",
      `--file=${ROOT}${file}`,
      "--content-type=video/mp4",
      `--cache-control=${CACHE_CONTROL}`,
    ],
    {
      cwd: new URL("../apps/web/", import.meta.url).pathname,
      stderr: "inherit",
      stdout: "ignore",
    }
  );
  // Sequential on purpose: one wrangler process at a time keeps the output readable.
  // biome-ignore lint/performance/noAwaitInLoops: uploads run one after another
  if ((await proc.exited) !== 0) {
    throw new Error(`Upload failed for ${file}`);
  }
}
console.log(`${files.length} clips ${dryRun ? "listed" : "uploaded"}.`);
