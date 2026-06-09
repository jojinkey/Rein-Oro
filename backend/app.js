import './util/env.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/index.js';
import { seedDatabase } from './util/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

seedDatabase();

app.use(apiRouter);

app.use('/images', express.static(path.join(__dirname, '../frontend/images')));
app.use('/frames', express.static(path.join(__dirname, '../frontend/frames')));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/sitemap.xml' || req.path === '/robots.txt') {
    return next();
  }
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

export default app;
