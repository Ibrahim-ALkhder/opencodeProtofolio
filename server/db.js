import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || `file:${path.join(dataDir, "portfolio.db")}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      slug TEXT NOT NULL DEFAULT '',
      shortDescription TEXT DEFAULT '',
      description TEXT DEFAULT '',
      button TEXT DEFAULT 'View Project',
      variant TEXT DEFAULT 'dashboard',
      isFeatured INTEGER DEFAULT 0,
      problem TEXT DEFAULT '',
      solution TEXT DEFAULT '',
      features TEXT DEFAULT '[]',
      techStack TEXT DEFAULT '[]',
      challenges TEXT DEFAULT '[]',
      results TEXT DEFAULT '',
      timeline TEXT DEFAULT '',
      liveUrl TEXT DEFAULT '',
      githubUrl TEXT DEFAULT '',
      screenshots TEXT DEFAULT '{}',
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      issuer TEXT NOT NULL DEFAULT '',
      issued TEXT DEFAULT '',
      credentialLink TEXT DEFAULT '',
      thumbnail TEXT DEFAULT '',
      description TEXT DEFAULT '',
      category TEXT DEFAULT 'Other',
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS cv (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT DEFAULT '',
      filename TEXT DEFAULT '',
      updatedAt TEXT DEFAULT (datetime('now'))
    )
  `);

  const cvRows = await db.execute("SELECT COUNT(*) as count FROM cv");
  if (cvRows.rows[0].count === 0) {
    await db.execute("INSERT INTO cv (url, filename) VALUES (?, ?)", [
      "/Ibrahim-CV.pdf",
      "Ibrahim-CV.pdf",
    ]);
  }

  await db.execute("CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug)");
  await db.execute("CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(createdAt)");
  await db.execute("CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(isFeatured)");
  await db.execute("CREATE INDEX IF NOT EXISTS idx_certificates_category ON certificates(category)");
  await db.execute("CREATE INDEX IF NOT EXISTS idx_certificates_created ON certificates(createdAt)");
}

export default db;
