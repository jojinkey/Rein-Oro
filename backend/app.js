import "./util/env.js";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import apiRouter from "./routes/index.js";
import { seedDatabase } from "./util/database.js";
import {
 notFoundHandler,
 globalErrorHandler,
} from "./controller/errorController.js";

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
 const indexPath = path.join(__dirname, "../frontend/dist", "index.html");
 res.sendFile(indexPath, (err) => {
  if (err) {
   res
    .status(404)
    .send(
     "Frontend static assets not found. Please ensure the frontend has been built successfully.",
    );
  }
 });
});

app.get("/api", (req, res) => {
 res.status(200).json({ message: "Welcome to Rein Oro API" });
});

// 4. Fallback for unmatched API routes (always JSON)
app.all("/api/*", notFoundHandler);

// 5. Global Error Handling Middleware (always JSON)
app.use(globalErrorHandler);

export default app;
