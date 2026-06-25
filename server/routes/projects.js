import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "./auth.js";
import db from "../db.js";

export const projectsRouter = Router();

function parseProject(row) {
  return {
    ...row,
    isFeatured: Boolean(row.isFeatured),
    features: JSON.parse(row.features || "[]"),
    techStack: JSON.parse(row.techStack || "[]"),
    challenges: JSON.parse(row.challenges || "[]"),
    screenshots: JSON.parse(row.screenshots || "{}"),
  };
}

function generateSlug(title) {
  let slug = title
    ?.toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .replace(/-+/g, "-");
  return slug || "project-" + Date.now();
}

projectsRouter.get("/", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM projects ORDER BY createdAt DESC");
    res.json(result.rows.map(parseProject));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

projectsRouter.get("/:id", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM projects WHERE id = ?", [
      req.params.id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Project not found" });
    res.json(parseProject(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

projectsRouter.post("/", requireAuth, async (req, res) => {
  try {
    const slug = req.body.slug || generateSlug(req.body.title);
    const id = uuidv4();
    const now = new Date().toISOString();
    await db.execute(
      `INSERT INTO projects (id, title, slug, shortDescription, description, button, variant, isFeatured, problem, solution, features, techStack, challenges, results, timeline, liveUrl, githubUrl, screenshots, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        req.body.title || "",
        slug,
        req.body.shortDescription || "",
        req.body.description || "",
        "View Project",
        req.body.variant || "dashboard",
        req.body.isFeatured ? 1 : 0,
        req.body.problem || "",
        req.body.solution || "",
        JSON.stringify(req.body.features || []),
        JSON.stringify(req.body.techStack || []),
        JSON.stringify(req.body.challenges || []),
        req.body.results || "",
        req.body.timeline || "",
        req.body.liveUrl || "",
        req.body.githubUrl || "",
        JSON.stringify(req.body.screenshots || { desktop: null, tablet: null, mobile: null }),
        now,
      ]
    );
    const result = await db.execute("SELECT * FROM projects WHERE id = ?", [id]);
    res.status(201).json(parseProject(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

projectsRouter.put("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await db.execute("SELECT * FROM projects WHERE id = ?", [
      req.params.id,
    ]);
    if (existing.rows.length === 0)
      return res.status(404).json({ error: "Project not found" });

    const current = existing.rows[0];
    await db.execute(
      `UPDATE projects SET title=?, slug=?, shortDescription=?, description=?, variant=?, isFeatured=?, problem=?, solution=?, features=?, techStack=?, challenges=?, results=?, timeline=?, liveUrl=?, githubUrl=?, screenshots=? WHERE id=?`,
      [
        req.body.title ?? current.title,
        req.body.slug ?? current.slug,
        req.body.shortDescription ?? current.shortDescription,
        req.body.description ?? current.description,
        req.body.variant ?? current.variant,
        req.body.isFeatured !== undefined ? (req.body.isFeatured ? 1 : 0) : current.isFeatured,
        req.body.problem ?? current.problem,
        req.body.solution ?? current.solution,
        JSON.stringify(req.body.features ?? JSON.parse(current.features || "[]")),
        JSON.stringify(req.body.techStack ?? JSON.parse(current.techStack || "[]")),
        JSON.stringify(req.body.challenges ?? JSON.parse(current.challenges || "[]")),
        req.body.results ?? current.results,
        req.body.timeline ?? current.timeline,
        req.body.liveUrl ?? current.liveUrl,
        req.body.githubUrl ?? current.githubUrl,
        JSON.stringify(req.body.screenshots ?? JSON.parse(current.screenshots || "{}")),
        req.params.id,
      ]
    );
    const result = await db.execute("SELECT * FROM projects WHERE id = ?", [
      req.params.id,
    ]);
    res.json(parseProject(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

projectsRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    const result = await db.execute("DELETE FROM projects WHERE id = ?", [
      req.params.id,
    ]);
    if (result.rowsAffected === 0)
      return res.status(404).json({ error: "Project not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

projectsRouter.put("/:id/screenshots/:type", requireAuth, async (req, res) => {
  try {
    const existing = await db.execute("SELECT * FROM projects WHERE id = ?", [
      req.params.id,
    ]);
    if (existing.rows.length === 0)
      return res.status(404).json({ error: "Project not found" });

    const { type } = req.params;
    if (!["desktop", "tablet", "mobile"].includes(type)) {
      return res.status(400).json({ error: "Invalid screenshot type" });
    }

    const currentScreenshots = JSON.parse(existing.rows[0].screenshots || "{}");
    currentScreenshots[type] = req.body.image;

    await db.execute("UPDATE projects SET screenshots = ? WHERE id = ?", [
      JSON.stringify(currentScreenshots),
      req.params.id,
    ]);

    const result = await db.execute("SELECT * FROM projects WHERE id = ?", [
      req.params.id,
    ]);
    res.json(parseProject(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
