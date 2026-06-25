import { Router } from "express";
import jwt from "jsonwebtoken";

function requireEnv(name) {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}. Check your .env file.`);
  }
  return val;
}

const JWT_SECRET = requireEnv("JWT_SECRET");
const ADMIN_USERNAME = requireEnv("ADMIN_USERNAME");
const ADMIN_PASSWORD = requireEnv("ADMIN_PASSWORD");

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "24h" });

  res.json({ token });
});

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
