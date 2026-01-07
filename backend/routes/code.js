import express from 'express';
import {
  getSupportedExtensions,
  isValidExtension,
  extractCodeBlocks,
  processCodeFile,
  createCodeFileFromBlock,
  validateCodeFiles
} from '../services/codeService.js';

const router = express.Router();

/**
 * GET /api/code/extensions
 * Get list of supported file extensions
 */
router.get('/extensions', (req, res) => {
  try {
    const extensions = getSupportedExtensions();
    res.json({ extensions });
  } catch (error) {
    console.error('Error getting extensions:', error);
    res.status(500).json({ error: 'Failed to get extensions' });
  }
});

/**
 * POST /api/code/validate
 * Validate code file data
 */
router.post('/validate', async (req, res) => {
  try {
    const { files } = req.body;

    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ error: 'Files array is required' });
    }

    const result = validateCodeFiles(files);

    res.json(result);
  } catch (error) {
    console.error('Error validating files:', error);
    res.status(500).json({ error: 'Failed to validate files' });
  }
});

/**
 * POST /api/code/extract
 * Extract code blocks from conversation text
 */
router.post('/extract', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const codeBlocks = extractCodeBlocks(text);
    const codeFiles = codeBlocks.map((block, idx) => 
      createCodeFileFromBlock(block, idx)
    );

    res.json({
      codeFiles,
      count: codeFiles.length,
      totalSize: codeFiles.reduce((sum, file) => sum + file.size, 0)
    });
  } catch (error) {
    console.error('Error extracting code:', error);
    res.status(500).json({ error: 'Failed to extract code' });
  }
});

/**
 * POST /api/code/process
 * Process a single code file
 */
router.post('/process', async (req, res) => {
  try {
    const { content, name, extension } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!extension) {
      return res.status(400).json({ error: 'Extension is required' });
    }

    const processed = processCodeFile({ content, name, extension });

    res.json(processed);
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

export default router;
