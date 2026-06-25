import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { requireAuth } from "./auth.js";
import db from "../db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cv${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const cvRouter = Router();

cvRouter.get("/", async (req, res) => {
  try {
    const result = await db.execute("SELECT url, filename, updatedAt FROM cv ORDER BY id DESC LIMIT 1");
    if (result.rows.length === 0) {
      return res.json({ url: "/Ibrahim-CV.pdf" });
    }
    res.json(result.rows[0]);
  } catch {
    res.json({ url: "/Ibrahim-CV.pdf" });
  }
});

cvRouter.post("/upload", requireAuth, (req, res) => {
  upload.single("cv")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const cvData = {
        url: `/uploads/cv${path.extname(req.file.originalname)}`,
        filename: req.file.originalname,
        updatedAt: new Date().toISOString(),
      };

      const existing = await db.execute("SELECT id FROM cv LIMIT 1");
      if (existing.rows.length > 0) {
        await db.execute("UPDATE cv SET url=?, filename=?, updatedAt=? WHERE id=?", [
          cvData.url,
          cvData.filename,
          cvData.updatedAt,
          existing.rows[0].id,
        ]);
      } else {
        await db.execute("INSERT INTO cv (url, filename, updatedAt) VALUES (?, ?, ?)", [
          cvData.url,
          cvData.filename,
          cvData.updatedAt,
        ]);
      }

      res.json(cvData);
    } catch (dbErr) {
      res.status(500).json({ error: dbErr.message });
    }
  });
});

cvRouter.post("/url", requireAuth, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const cvData = {
      url,
      filename: "external",
      updatedAt: new Date().toISOString(),
    };

    const existing = await db.execute("SELECT id FROM cv LIMIT 1");
    if (existing.rows.length > 0) {
      await db.execute("UPDATE cv SET url=?, filename=?, updatedAt=? WHERE id=?", [
        cvData.url,
        cvData.filename,
        cvData.updatedAt,
        existing.rows[0].id,
      ]);
    } else {
      await db.execute("INSERT INTO cv (url, filename, updatedAt) VALUES (?, ?, ?)", [
        cvData.url,
        cvData.filename,
        cvData.updatedAt,
      ]);
    }

    res.json(cvData);
  } catch (dbErr) {
    res.status(500).json({ error: dbErr.message });
  }
});
