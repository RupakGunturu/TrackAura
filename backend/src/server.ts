import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { analyticsRouter } from "./routes/analytics.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { eventsRouter } from "./routes/events.js";
import { healthRouter } from "./routes/health.js";
import { heatmapRouter } from "./routes/heatmap.js";
import { projectsRouter } from "./routes/projects.js";
import { sessionReplayRouter } from "./routes/sessionReplay.js";

const app = express();

const allowedOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools and same-origin requests with no Origin header.
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
app.use(express.json({ limit: "1mb" }));

// Root health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    status: "ok",
    message: "TrackAura Backend Running",
    port: env.PORT,
    endpoints: [
      "/api/health",
      "/api/events",
      "/api/analytics/realtime",
      "/api/analytics/funnels",
      "/api/analytics/retention",
      "/api/analytics/performance",
      "/api/analytics/overview",
      "/api/analytics/sessions",
      "/api/heatmap",
      "/api/projects"
    ]
  });
});

app.use("/api", healthRouter);
app.use("/api", eventsRouter);
app.use("/api", heatmapRouter);
app.use("/api", analyticsRouter);
app.use("/api", projectsRouter);
app.use("/api", sessionReplayRouter);

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`Backend running on http://localhost:${env.PORT}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${env.PORT} is already in use.`);
    console.error("Stop the existing process or change PORT in backend/.env, then restart.");
    process.exit(1);
  }

  console.error("Failed to start backend server", error);
  process.exit(1);
});
