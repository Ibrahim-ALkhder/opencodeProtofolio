import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initDb, default as db } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");

async function migrate() {
  await initDb();

  // Migrate projects
  const projectsFile = path.join(dataDir, "projects.json");
  if (fs.existsSync(projectsFile)) {
    const projects = JSON.parse(fs.readFileSync(projectsFile, "utf-8"));
    if (Array.isArray(projects) && projects.length > 0) {
      const existing = await db.execute("SELECT COUNT(*) as count FROM projects");
      if (existing.rows[0].count === 0) {
        for (const p of projects) {
          await db.execute(
            `INSERT OR IGNORE INTO projects (id, title, slug, shortDescription, description, button, variant, isFeatured, problem, solution, features, techStack, challenges, results, timeline, liveUrl, githubUrl, screenshots, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              p.id,
              p.title || "",
              p.slug || "",
              p.shortDescription || "",
              p.description || "",
              p.button || "View Project",
              p.variant || "dashboard",
              p.isFeatured ? 1 : 0,
              p.problem || "",
              p.solution || "",
              JSON.stringify(p.features || []),
              JSON.stringify(p.techStack || []),
              JSON.stringify(p.challenges || []),
              p.results || "",
              p.timeline || "",
              p.liveUrl || "",
              p.githubUrl || "",
              JSON.stringify(p.screenshots || { desktop: null, tablet: null, mobile: null }),
              p.createdAt || new Date().toISOString(),
            ]
          );
        }
        console.log(`Migrated ${projects.length} projects`);
      } else {
        console.log("Projects table already has data, skipping");
      }
    }
  }

  // Migrate certificates
  const certsFile = path.join(dataDir, "certificates.json");
  if (fs.existsSync(certsFile)) {
    const certs = JSON.parse(fs.readFileSync(certsFile, "utf-8"));
    if (Array.isArray(certs) && certs.length > 0) {
      const existing = await db.execute("SELECT COUNT(*) as count FROM certificates");
      if (existing.rows[0].count === 0) {
        for (const c of certs) {
          await db.execute(
            `INSERT OR IGNORE INTO certificates (id, title, issuer, issued, credentialLink, thumbnail, description, category, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              c.id,
              c.title || "",
              c.issuer || "",
              c.issued || "",
              c.credentialLink || "",
              c.thumbnail || null,
              c.description || "",
              c.category || "Other",
              c.createdAt || new Date().toISOString(),
            ]
          );
        }
        console.log(`Migrated ${certs.length} certificates`);
      } else {
        console.log("Certificates table already has data, skipping");
      }
    }
  }

  console.log("Migration complete");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
