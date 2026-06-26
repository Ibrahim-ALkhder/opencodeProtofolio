import { Router } from "express";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { requireAuth } from "./auth.js";
import db from "../db.js";

export const projectsRouter = Router();

const SCREENSHOT_TYPES = ["desktop", "tablet", "mobile"];

const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  shortDescription: z.string().max(500).optional().default(""),
  description: z.string().optional().default(""),
  variant: z.string().optional().default("dashboard"),
  isFeatured: z.boolean().optional().default(false),
  problem: z.string().optional().default(""),
  solution: z.string().optional().default(""),
  features: z.array(z.string()).optional().default([]),
  techStack: z.array(z.string()).optional().default([]),
  challenges: z.array(z.string()).optional().default([]),
  results: z.string().optional().default(""),
  timeline: z.string().optional().default(""),
  liveUrl: z.string().optional().default(""),
  githubUrl: z.string().optional().default(""),
  screenshots: z.object({
    desktop: z.string().nullable().optional(),
    tablet: z.string().nullable().optional(),
    mobile: z.string().nullable().optional(),
  }).optional().default({ desktop: null, tablet: null, mobile: null }),
});

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
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    const countResult = await db.execute("SELECT COUNT(*) as total FROM projects");
    const total = countResult.rows[0].total;
    const result = await db.execute(
      "SELECT * FROM projects ORDER BY createdAt DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    res.json({
      projects: result.rows.map(parseProject),
      total,
      limit,
      offset,
    });
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
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const data = parsed.data;
    const slug = generateSlug(data.title);
    const id = uuidv4();
    const now = new Date().toISOString();
    await db.execute(
      `INSERT INTO projects (id, title, slug, shortDescription, description, button, variant, isFeatured, problem, solution, features, techStack, challenges, results, timeline, liveUrl, githubUrl, screenshots, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        slug,
        data.shortDescription,
        data.description,
        "View Project",
        data.variant,
        data.isFeatured ? 1 : 0,
        data.problem,
        data.solution,
        JSON.stringify(data.features),
        JSON.stringify(data.techStack),
        JSON.stringify(data.challenges),
        data.results,
        data.timeline,
        data.liveUrl,
        data.githubUrl,
        JSON.stringify(data.screenshots),
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

projectsRouter.put("/:id/screenshots/:type", requireAuth, express.json({ limit: "10mb" }), async (req, res) => {
  try {
    const existing = await db.execute("SELECT * FROM projects WHERE id = ?", [
      req.params.id,
    ]);
    if (existing.rows.length === 0)
      return res.status(404).json({ error: "Project not found" });

    const { type } = req.params;
    if (!SCREENSHOT_TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid screenshot type. Must be one of: " + SCREENSHOT_TYPES.join(", ") });
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
