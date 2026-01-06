import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import summaryRouter from './routes/summary.js';
import graphRouter from './routes/graph.js';
import codeRouter from './routes/code.js';
import exportRouter from './routes/export.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for temporary downloads
app.use('/downloads', express.static(path.join(__dirname, 'temp')));

// Routes
app.use('/api/summary', summaryRouter);
app.use('/api/graph', graphRouter);
app.use('/api/code', codeRouter);
app.use('/api/export', exportRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
