// 把 public/images/gallery/ 第一層的 png/jpg 轉成 webp（原圖 + 給展牆用的 .thumb.webp 縮圖），
// 並把 content/artworks*.json 的路徑一起改掉。可重複執行：已經是 webp 的檔案會跳過。
// 子資料夾（boxing_melee、pollute、RPS）是 p5 sketch 執行時自己載入的素材，不處理。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public/images/gallery");
const FULL_MAX_WIDTH = 1600;
const THUMB_WIDTH = 640;

let before = 0;
let after = 0;
const converted = [];

for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
  if (!entry.isFile() || !/\.(png|jpe?g)$/i.test(entry.name)) continue;
  const src = path.join(dir, entry.name);
  const base = entry.name.replace(/\.[^.]+$/, "");
  const full = path.join(dir, `${base}.webp`);
  const thumb = path.join(dir, `${base}.thumb.webp`);

  const input = sharp(src);
  await input.clone().resize({ width: FULL_MAX_WIDTH, withoutEnlargement: true }).webp({ quality: 82 }).toFile(full);
  await input.clone().resize({ width: THUMB_WIDTH, withoutEnlargement: true }).webp({ quality: 78 }).toFile(thumb);

  before += fs.statSync(src).size;
  after += fs.statSync(full).size;
  converted.push(entry.name);
  fs.unlinkSync(src);
}

for (const file of ["artworks.json", "artworks.en.json"]) {
  const p = path.join(root, "content", file);
  const raw = fs.readFileSync(p, "utf-8");
  const next = raw.replace(/(\/images\/gallery\/[^"/]+)\.(png|jpe?g)"/gi, '$1.webp"');
  if (next !== raw) fs.writeFileSync(p, next, "utf-8");
}

console.log(`converted ${converted.length} files: ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB (full size only)`);
