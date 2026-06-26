import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { requireAuth } from "./auth.js";
import db from "../db.js";

export const certificatesRouter = Router();

const certificateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  issuer: z.string().min(1, "Issuer is required").max(200),
  issued: z.string().optional().default(""),
  credentialLink: z.string().optional().default(""),
  thumbnail: z.string().nullable().optional().default(null),
  description: z.string().optional().default(""),
  category: z.string().optional().default("Other"),
});

certificatesRouter.get("/", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    const countResult = await db.execute("SELECT COUNT(*) as total FROM certificates");
    const total = countResult.rows[0].total;
    const result = await db.execute(
      "SELECT * FROM certificates ORDER BY createdAt DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    res.json({
      certificates: result.rows,
      total,
      limit,
      offset,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

certificatesRouter.get("/:id", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM certificates WHERE id = ?", [
      req.params.id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Certificate not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

certificatesRouter.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = certificateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const data = parsed.data;
    const id = uuidv4();
    const now = new Date().toISOString();
    await db.execute(
      `INSERT INTO certificates (id, title, issuer, issued, credentialLink, thumbnail, description, category, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        data.issuer,
        data.issued,
        data.credentialLink,
        data.thumbnail,
        data.description,
        data.category,
        now,
      ]
    );
    const result = await db.execute("SELECT * FROM certificates WHERE id = ?", [id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

certificatesRouter.put("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await db.execute("SELECT * FROM certificates WHERE id = ?", [
      req.params.id,
    ]);
    if (existing.rows.length === 0)
      return res.status(404).json({ error: "Certificate not found" });

    const current = existing.rows[0];
    await db.execute(
      `UPDATE certificates SET title=?, issuer=?, issued=?, credentialLink=?, thumbnail=?, description=?, category=? WHERE id=?`,
      [
        req.body.title ?? current.title,
        req.body.issuer ?? current.issuer,
        req.body.issued ?? current.issued,
        req.body.credentialLink ?? current.credentialLink,
        req.body.thumbnail !== undefined ? req.body.thumbnail : current.thumbnail,
        req.body.description ?? current.description,
        req.body.category ?? current.category,
        req.params.id,
      ]
    );
    const result = await db.execute("SELECT * FROM certificates WHERE id = ?", [
      req.params.id,
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

certificatesRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    const result = await db.execute("DELETE FROM certificates WHERE id = ?", [
      req.params.id,
    ]);
    if (result.rowsAffected === 0)
      return res.status(404).json({ error: "Certificate not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
