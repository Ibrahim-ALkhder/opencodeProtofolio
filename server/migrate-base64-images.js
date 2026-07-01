import "dotenv/config";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { initDb, default as db } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "uploads", "properties");
const CERTS_DIR = path.join(__dirname, "uploads", "certificates");

function parseDataUri(uri) {
  if (!uri || typeof uri !== "string") return null;
  const match = uri.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) return null;
  return { ext: match[1], data: match[2] };
}

async function migrateBase64ToFile(base64Uri, targetDir, name) {
  const parsed = parseDataUri(base64Uri);
  if (!parsed) return null;

  const buffer = Buffer.from(parsed.data, "base64");
  const hash = crypto.createHash("md5").update(base64Uri).digest("hex").slice(0, 8);
  const filename = `${name}-${hash}.webp`;
  const filepath = path.join(targetDir, filename);

  if (!fs.existsSync(filepath)) {
    await sharp(buffer)
      .resize(1200, undefined, { withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(filepath);
    console.log(`  Converted: ${filename}`);
  } else {
    console.log(`  Exists: ${filename}`);
  }

  return `/uploads/properties/${filename}`;
}

async function migrateCertificateBase64(base64Uri, targetDir, name) {
  const parsed = parseDataUri(base64Uri);
  if (!parsed) return null;

  const buffer = Buffer.from(parsed.data, "base64");
  const hash = crypto.createHash("md5").update(base64Uri).digest("hex").slice(0, 8);
  const filename = `${name}-${hash}.webp`;
  const filepath = path.join(targetDir, filename);

  if (!fs.existsSync(filepath)) {
    await sharp(buffer)
      .resize(1200, undefined, { withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(filepath);
    console.log(`  Converted: ${filename}`);
  } else {
    console.log(`  Exists: ${filename}`);
  }

  return `/uploads/certificates/${filename}`;
}

async function migrate() {
  await initDb();

  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(CERTS_DIR)) fs.mkdirSync(CERTS_DIR, { recursive: true });

  // Migrate project screenshots
  console.log("\n=== Migrating project screenshots ===");
  const projects = await db.execute("SELECT id, screenshots FROM projects");
  let projectCount = 0;
  for (const row of projects.rows) {
    const screenshots = JSON.parse(row.screenshots || "{}");
    let changed = false;
    for (const type of ["desktop", "tablet", "mobile"]) {
      if (screenshots[type] && parseDataUri(screenshots[type])) {
        const newUrl = await migrateBase64ToFile(screenshots[type], UPLOADS_DIR, `project-${row.id}-${type}`);
        if (newUrl) {
          screenshots[type] = newUrl;
          changed = true;
        }
      }
    }
    if (changed) {
      await db.execute("UPDATE projects SET screenshots = ? WHERE id = ?", [
        JSON.stringify(screenshots),
        row.id,
      ]);
      projectCount++;
      console.log(`  Updated project: ${row.id}`);
    }
  }
  console.log(`  Projects migrated: ${projectCount}`);

  // Migrate certificate thumbnails
  console.log("\n=== Migrating certificate thumbnails ===");
  const certs = await db.execute("SELECT id, thumbnail FROM certificates WHERE thumbnail IS NOT NULL");
  let certCount = 0;
  for (const row of certs.rows) {
    if (row.thumbnail && parseDataUri(row.thumbnail)) {
      const newUrl = await migrateCertificateBase64(row.thumbnail, CERTS_DIR, `cert-${row.id}`);
      if (newUrl) {
        await db.execute("UPDATE certificates SET thumbnail = ? WHERE id = ?", [
          newUrl,
          row.id,
        ]);
        certCount++;
        console.log(`  Updated certificate: ${row.id}`);
      }
    }
  }
  console.log(`  Certificates migrated: ${certCount}`);

  console.log("\nMigration complete.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
