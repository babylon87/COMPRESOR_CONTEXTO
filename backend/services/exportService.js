import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create a ZIP file with exported content
 * @param {object} exportData - Data to export
 * @param {string} outputPath - Path to save ZIP file
 * @returns {Promise<string>} Path to created ZIP file
 */
export async function createExportZip(exportData, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      // Create output stream
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      // Listen for completion
      output.on('close', () => {
        resolve(outputPath);
      });

      // Handle errors
      archive.on('error', (err) => {
        reject(err);
      });

      // Pipe archive to output file
      archive.pipe(output);

      // Add summary file if provided
      if (exportData.summary) {
        const summaryExt = exportData.summaryFormat === 'md' ? '.md' : '.txt';
        const summaryName = `resumen${summaryExt}`;
        archive.append(exportData.summary, { name: summaryName });
      }

      // Add graph HTML if provided
      if (exportData.graphHTML) {
        archive.append(exportData.graphHTML, { name: 'grafo.html' });
      }

      // Add graph JSON data
      if (exportData.graphData) {
        archive.append(
          JSON.stringify(exportData.graphData, null, 2),
          { name: 'grafo_data.json' }
        );
      }

      // Add code files if provided
      if (exportData.codeFiles && exportData.codeFiles.length > 0) {
        exportData.codeFiles.forEach((file, idx) => {
          const fileName = file.fileName || `code_${idx + 1}${file.extension}`;
          archive.append(file.content, { name: `codigo/${fileName}` });
        });
      }

      // Add metadata file
      const metadata = {
        generatedAt: new Date().toISOString(),
        includesSummary: !!exportData.summary,
        includesGraph: !!exportData.graphHTML,
        codeFilesCount: exportData.codeFiles?.length || 0,
        exportFormat: exportData.format || 'complete'
      };
      archive.append(
        JSON.stringify(metadata, null, 2),
        { name: 'metadata.json' }
      );

      // Finalize the archive
      archive.finalize();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Clean up temporary files
 * @param {string} filePath - Path to file to delete
 * @returns {boolean} True if cleanup was successful
 */
export function cleanupTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up temp file: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
    return false;
  }
}

/**
 * Ensure temp directory exists
 * @param {string} tempDir - Path to temp directory
 */
export function ensureTempDir(tempDir) {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
}

/**
 * Generate unique filename
 * @param {string} prefix - Filename prefix
 * @param {string} extension - File extension
 * @returns {string} Unique filename
 */
export function generateUniqueFilename(prefix = 'export', extension = '.zip') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}${extension}`;
}
