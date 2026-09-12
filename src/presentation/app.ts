import express from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import { env } from "@/config/env";
import { errorMiddleware } from "./http/middleware/error";
import { logger } from "@/config/logger";

import authRoutes from "./http/routes/auth.routes";
import portalAuthRoutes from "./http/routes/portal.auth.routes";
import dsaRoutes from "./http/routes/dsa.routes";
const app = express();

//security
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

// Passport (session: false — we use JWT, not sessions)
app.use(passport.initialize());

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
app.use("/api/v1/portal/auth", portalAuthRoutes);
app.use("/api/v1", dsaRoutes);

//  404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
});

//  Global Error Handler
app.use(errorMiddleware);

export default app;
