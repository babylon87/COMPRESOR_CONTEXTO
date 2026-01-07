import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import summaryRouter from './routes/summary.js';
import graphRouter from './routes/graph.js';
import codeRouter from './routes/code.js';
import exportRouter from './routes/export.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration constants
const MAX_TEXT_LENGTH = parseInt(process.env.MAX_TEXT_LENGTH) || 10000000; // 10 million characters

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Input validation middleware
const validateTextInput = (req, res, next) => {
  const { text } = req.body;
  
  if (text && typeof text === 'string') {
    if (text.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({ 
        error: 'Text input too large', 
        message: `Maximum text length is ${MAX_TEXT_LENGTH} characters` 
      });
    }
  }
  
  next();
};

// Middleware
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for temporary downloads
app.use('/downloads', express.static(path.join(__dirname, 'temp')));

// Routes
app.use('/api/summary', validateTextInput, summaryRouter);
app.use('/api/graph', validateTextInput, graphRouter);
app.use('/api/code', validateTextInput, codeRouter);
app.use('/api/export', exportRouter);

// Health check
app.get('/api/health', (req, res) => {
  const tempDirExists = fs.existsSync(tempDir);
  let tempDirWritable = false;
  
  if (tempDirExists) {
    try {
      fs.accessSync(tempDir, fs.constants.W_OK);
      tempDirWritable = true;
    } catch (err) {
      tempDirWritable = false;
    }
  }
  
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    tempDirectory: {
      exists: tempDirExists,
      writable: tempDirWritable,
      path: tempDir
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: isDevelopment ? err.message : 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
