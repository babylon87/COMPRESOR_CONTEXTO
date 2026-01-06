import express from 'express';
import { generateSummary, formatSummary } from '../services/summaryService.js';

const router = express.Router();

/**
 * POST /api/summary/generate
 * Generate summary from conversation text
 */
router.post('/generate', async (req, res) => {
  try {
    const { text, format = 'md', maxLength = 500 } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = generateSummary(text, { format, maxLength });
    const formattedSummary = formatSummary(result.summary, format);

    res.json({
      summary: formattedSummary,
      format,
      stats: result.stats,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/summary/preview
 * Preview summary without full processing
 */
router.post('/preview', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Generate quick preview (first 500 words)
    const words = text.split(/\s+/).slice(0, 500).join(' ');
    const result = generateSummary(words, { format: 'md' });

    res.json({
      preview: result.summary.substring(0, 1000) + '...',
      stats: result.stats
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
