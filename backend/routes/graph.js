import express from 'express';
import { generateGraphData, generateGraphHTML } from '../services/graphService.js';

const router = express.Router();

/**
 * POST /api/graph/generate
 * Generate graph data from conversation text
 */
router.post('/generate', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = generateGraphData(text);

    res.json({
      graphData: result.graphData,
      stats: result.stats
    });
  } catch (error) {
    console.error('Error generating graph:', error);
    res.status(500).json({ error: 'Failed to generate graph' });
  }
});

/**
 * POST /api/graph/html
 * Generate interactive HTML for graph visualization
 */
router.post('/html', async (req, res) => {
  try {
    const { graphData } = req.body;

    if (!graphData) {
      return res.status(400).json({ error: 'Graph data is required' });
    }

    const html = generateGraphHTML(graphData);

    res.json({ html });
  } catch (error) {
    console.error('Error generating graph HTML:', error);
    res.status(500).json({ error: 'Failed to generate graph HTML' });
  }
});

/**
 * POST /api/graph/complete
 * Generate both graph data and HTML
 */
router.post('/complete', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = generateGraphData(text);
    const html = generateGraphHTML(result.graphData);

    res.json({
      graphData: result.graphData,
      html,
      stats: result.stats
    });
  } catch (error) {
    console.error('Error generating complete graph:', error);
    res.status(500).json({ error: 'Failed to generate complete graph' });
  }
});

export default router;
