// backend/src/index.ts
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI as string;

// If you later serve behind a proxy (Vercel/Render/Nginx), this helps with correct protocol/IP,
// and is required for some cookie settings. No effect in local dev.
app.set("trust proxy", 1);

/* ------------------------- CORS (local + deploys) ------------------------- */
// Build allowlist from env plus sensible defaults
const envList = (process.env.FRONTEND_URLS ?? process.env.CLIENT_URL ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins: (string | RegExp)[] = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...envList,
  /\.vercel\.app$/, // Vercel preview URLs
];

const corsOptions: CorsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // allow Postman/cURL (no Origin)
    const ok = allowedOrigins.some((o) =>
      typeof o === "string" ? o === origin : o.test(origin)
    );
    return ok ? cb(null, true) : cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Must be before routes
app.use(cors(corsOptions));
// Handle preflight
app.options("*", cors(corsOptions));
/* ------------------------------------------------------------------------ */

// Body & cookies
app.use(express.json());
app.use(cookieParser());

// Env checks (fail fast in dev)
if (!MONGO_URI) {
  console.error("MONGO_URI is missing in .env");
  process.exit(1);
}

// DB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected."))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Start
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
