import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { projectsRouter } from "./routes/projects.js";
import { certificatesRouter } from "./routes/certificates.js";
import { cvRouter } from "./routes/cv.js";
import { authRouter } from "./routes/auth.js";
import { initDb } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : ["http://localhost:5173"];

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(morgan("short"));
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later." },
});
app.use("/api/auth/login", authLimiter);

app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/certificates", certificatesRouter);
app.use("/api/cv", cvRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const distPath = path.join(__dirname, "..", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const uploadSubdirs = ["properties", "certificates"];
["data", "uploads", ...uploadSubdirs.map((d) => `uploads/${d}`)].forEach((dir) => {
  const p = path.join(__dirname, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

initDb()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database initialization failed:", err);
    process.exit(1);
  });
