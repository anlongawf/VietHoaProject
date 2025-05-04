import express from 'express';
import dotenv from 'dotenv';
import fileRoutes from './routes/fileRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import chalk from 'chalk';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/translated', express.static(path.join(__dirname, 'translated'), {
  setHeaders: (res, path) => {
    res.set('Content-Disposition', `attachment; filename="${path.split('/').pop()}"`);
    res.set('Content-Type', 'application/octet-stream');
  },
}));

// Log CORS errors
app.use((err, req, res, next) => {
  if (err.name === 'CorsError') {
    console.error(chalk.red(`CORS error: ${err.message}`));
    res.status(403).json({ error: 'CORS error', details: err.message });
  } else {
    next(err);
  }
});

// Bỏ qua favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Routes
app.use('/api/files', fileRoutes); // /api/files/translate, /api/files/upload
app.use('/api', fileRoutes); // /api/translate

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error(chalk.red('Server error:', err.message));
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Khởi động server
app.listen(port, () => {
  console.group(chalk.cyan('Server initialization'));
  console.log(chalk.green(`Server running at http://localhost:${port}`));
  console.groupEnd();
});