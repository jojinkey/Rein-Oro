import "./util/env.js";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import apiRouter from "./routes/index.js";
import { seedDatabase } from "./util/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

seedDatabase();

app.use(apiRouter);

const isProduction = process.env.NODE_ENV === "production";

// 1. Path to your static folders depending on environment
const frontendFolder = isProduction ? "../frontend/dist" : "../frontend/public";

// 2. Serve the subfolders accurately
app.use(
 "/images",
 express.static(path.join(__dirname, `${frontendFolder}/image`)),
);
app.use(
 "/frames",
 express.static(path.join(__dirname, `${frontendFolder}/frames`)),
);

// 3. Serve the fallback main production assets (only needed in production)
if (isProduction) {
 app.use(express.static(path.join(__dirname, "../frontend/dist")));
}

app.get("*", (req, res, next) => {
 if (
  req.path.startsWith("/api") ||
  req.path === "/sitemap.xml" ||
  req.path === "/robots.txt"
 ) {
  return next();
 }
 res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

export default app;
