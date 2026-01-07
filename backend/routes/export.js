import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createExportZip,
  cleanupTempFile,
  ensureTempDir,
  generateUniqueFilename
} from '../services/exportService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * POST /api/export/create
 * Create ZIP file with all exported content
 */
router.post('/create', async (req, res) => {
  try {
    const { summary, summaryFormat, graphHTML, graphData, codeFiles } = req.body;

    if (!summary && !graphHTML && !codeFiles?.length) {
      return res.status(400).json({ 
        error: 'At least one export item (summary, graph, or code files) is required' 
      });
    }

    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '..', 'temp');
    ensureTempDir(tempDir);

    // Generate unique filename
    const zipFilename = generateUniqueFilename('export', '.zip');
    const zipPath = path.join(tempDir, zipFilename);

    // Create export data object
    const exportData = {
      summary,
      summaryFormat: summaryFormat || 'md',
      graphHTML,
      graphData,
      codeFiles: codeFiles || []
    };

    // Create ZIP file
    await createExportZip(exportData, zipPath);

    // Return download URL
    res.json({
      success: true,
      downloadUrl: `/downloads/${zipFilename}`,
      filename: zipFilename,
      message: 'Export ZIP created successfully'
    });

    // Schedule cleanup after configurable time (default 10 minutes)
    const cleanupTimeout = parseInt(process.env.TEMP_FILE_CLEANUP_MINUTES) || 10;
    setTimeout(() => {
      cleanupTempFile(zipPath);
    }, cleanupTimeout * 60 * 1000);

  } catch (error) {
    console.error('Error creating export:', error);
    res.status(500).json({ error: 'Failed to create export' });
  }
});

/**
 * POST /api/export/preview
 * Preview what will be included in export
 */
router.post('/preview', async (req, res) => {
  try {
    const { summary, graphData, codeFiles } = req.body;

    const preview = {
      includesSummary: !!summary,
      summarySize: summary ? Buffer.byteLength(summary, 'utf8') : 0,
      includesGraph: !!graphData,
      graphNodeCount: graphData?.nodes?.length || 0,
      graphEdgeCount: graphData?.edges?.length || 0,
      codeFilesCount: codeFiles?.length || 0,
      totalCodeSize: codeFiles?.reduce((sum, file) => sum + (file.size || 0), 0) || 0,
      estimatedZipSize: 0
    };

    // Estimate ZIP size (rough calculation)
    preview.estimatedZipSize = Math.floor(
      (preview.summarySize + preview.totalCodeSize) * 0.3 // Assuming ~70% compression
    );

    res.json(preview);
  } catch (error) {
    console.error('Error creating preview:', error);
    res.status(500).json({ error: 'Failed to create preview' });
  }
});

export default router;
