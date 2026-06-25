import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "./auth.js";
import db from "../db.js";

export const certificatesRouter = Router();

certificatesRouter.get("/", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM certificates ORDER BY createdAt DESC");
    res.json(result.rows);
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
    const id = uuidv4();
    const now = new Date().toISOString();
    await db.execute(
      `INSERT INTO certificates (id, title, issuer, issued, credentialLink, thumbnail, description, category, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        req.body.title || "",
        req.body.issuer || "",
        req.body.issued || "",
        req.body.credentialLink || "",
        req.body.thumbnail || null,
        req.body.description || "",
        req.body.category || "Other",
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
