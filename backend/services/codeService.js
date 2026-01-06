/**
 * Validate and process code files
 */

const SUPPORTED_EXTENSIONS = {
  'python': ['.py'],
  'javascript': ['.js', '.jsx', '.mjs'],
  'typescript': ['.ts', '.tsx'],
  'json': ['.json'],
  'markdown': ['.md'],
  'html': ['.html', '.htm'],
  'css': ['.css', '.scss', '.sass'],
  'java': ['.java'],
  'c': ['.c', '.h'],
  'cpp': ['.cpp', '.hpp', '.cc', '.cxx'],
  'csharp': ['.cs'],
  'go': ['.go'],
  'rust': ['.rs'],
  'php': ['.php'],
  'ruby': ['.rb'],
  'sql': ['.sql'],
  'yaml': ['.yaml', '.yml'],
  'xml': ['.xml'],
  'bash': ['.sh', '.bash'],
  'text': ['.txt']
};

/**
 * Get supported file extensions
 * @returns {Array} List of supported extensions
 */
export function getSupportedExtensions() {
  const allExtensions = [];
  Object.values(SUPPORTED_EXTENSIONS).forEach(exts => {
    allExtensions.push(...exts);
  });
  return [...new Set(allExtensions)];
}

/**
 * Validate file extension
 * @param {string} extension - File extension (with or without dot)
 * @returns {boolean} Whether extension is supported
 */
export function isValidExtension(extension) {
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  return getSupportedExtensions().includes(ext.toLowerCase());
}

/**
 * Get language from extension
 * @param {string} extension - File extension
 * @returns {string} Language name
 */
export function getLanguageFromExtension(extension) {
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  const normalized = ext.toLowerCase();
  
  for (const [language, extensions] of Object.entries(SUPPORTED_EXTENSIONS)) {
    if (extensions.includes(normalized)) {
      return language;
    }
  }
  return 'text';
}

/**
 * Extract code blocks from text
 * @param {string} text - Text containing code blocks
 * @returns {Array} Array of code block objects
 */
export function extractCodeBlocks(text) {
  const codeBlocks = [];
  
  // Match markdown code blocks with language
  const markdownRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  
  while ((match = markdownRegex.exec(text)) !== null) {
    const language = match[1] || 'text';
    const code = match[2].trim();
    
    if (code) {
      codeBlocks.push({
        language,
        code,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }
  }
  
  // Also detect indented code blocks
  const lines = text.split('\n');
  let currentBlock = null;
  let blockStart = 0;
  
  lines.forEach((line, idx) => {
    const isCodeLine = line.startsWith('    ') || line.startsWith('\t');
    
    if (isCodeLine) {
      if (!currentBlock) {
        currentBlock = [];
        blockStart = idx;
      }
      currentBlock.push(line.replace(/^    |\t/, ''));
    } else if (currentBlock && currentBlock.length > 0) {
      // End of code block
      codeBlocks.push({
        language: 'text',
        code: currentBlock.join('\n'),
        startIndex: blockStart,
        endIndex: idx,
        type: 'indented'
      });
      currentBlock = null;
    }
  });
  
  return codeBlocks;
}

/**
 * Process code file
 * @param {object} fileData - File data with content, name, and extension
 * @returns {object} Processed file data
 */
export function processCodeFile(fileData) {
  const { content, name, extension } = fileData;
  
  // Validate extension
  if (!isValidExtension(extension)) {
    throw new Error(`Unsupported file extension: ${extension}`);
  }
  
  // Determine file name
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  const fileName = name || `code${ext}`;
  
  // Get language
  const language = getLanguageFromExtension(ext);
  
  // Validate content
  if (!content || content.trim().length === 0) {
    throw new Error('File content cannot be empty');
  }
  
  return {
    fileName,
    content,
    extension: ext,
    language,
    size: Buffer.byteLength(content, 'utf8'),
    lines: content.split('\n').length
  };
}

/**
 * Create code file object from conversation text
 * @param {string} text - Conversation text
 * @param {number} index - Block index
 * @returns {object} Code file object
 */
export function createCodeFileFromBlock(block, index) {
  const language = block.language || 'text';
  const extension = SUPPORTED_EXTENSIONS[language]?.[0] || '.txt';
  const fileName = `extracted_code_${index + 1}${extension}`;
  
  return {
    fileName,
    content: block.code,
    extension,
    language,
    size: Buffer.byteLength(block.code, 'utf8'),
    lines: block.code.split('\n').length,
    extracted: true
  };
}

/**
 * Validate multiple code files
 * @param {Array} files - Array of file objects
 * @returns {object} Validation result
 */
export function validateCodeFiles(files) {
  const errors = [];
  const warnings = [];
  const validFiles = [];
  
  files.forEach((file, idx) => {
    try {
      const processed = processCodeFile(file);
      validFiles.push(processed);
    } catch (error) {
      errors.push({
        index: idx,
        fileName: file.name,
        error: error.message
      });
    }
  });
  
  return {
    valid: errors.length === 0,
    validFiles,
    errors,
    warnings,
    stats: {
      total: files.length,
      valid: validFiles.length,
      invalid: errors.length
    }
  };
}
