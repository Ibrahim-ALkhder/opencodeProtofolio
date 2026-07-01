import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "uploads");
const SUBDIRS = ["properties", "certificates"];

SUBDIRS.forEach((dir) => {
  const p = path.join(UPLOADS_DIR, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

export async function saveImage(buffer, subdir, name) {
  const filename = `${name}-${Date.now()}.webp`;
  const filepath = path.join(UPLOADS_DIR, subdir, filename);

  await sharp(buffer)
    .resize(1200, undefined, { withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(filepath);

  return `/uploads/${subdir}/${filename}`;
}
