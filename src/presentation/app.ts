import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "@/config/env";
import { errorMiddleware } from "./http/middleware/error";
import { logger } from "@/config/logger";

import authRoutes from "./http/routes/auth.routes";

const app = express();

//securitiy
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//body parsing

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

//request logging

app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

//health check

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1/auth", authRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
});

// ─── Global Error Handler (MUST be last) ──────────────────────────────────────
app.use(errorMiddleware);

export default app;
