import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { eventsRouter } from "./routes/events.js";
import { healthRouter } from "./routes/health.js";
import { heatmapRouter } from "./routes/heatmap.js";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
  })
);
app.use(express.json({ limit: "1mb" }));

app.use("/api", healthRouter);
app.use("/api", eventsRouter);
app.use("/api", heatmapRouter);

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
