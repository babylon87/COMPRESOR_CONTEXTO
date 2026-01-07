import nlp from 'compromise';
import { sanitizeText, DATE_PATTERNS } from '../utils/sanitize.js';

/**
 * Generate a summary from conversation text
 * @param {string} text - The conversation text to summarize
 * @param {object} options - Options for summary generation
 * @returns {object} Summary data
 */
export function generateSummary(text, options = {}) {
  const { format = 'txt', maxLength = 500 } = options;
  
  try {
    // Sanitize input
    const sanitizedText = sanitizeText(text);
    
    const doc = nlp(sanitizedText);
    
    // Extract key information
    const sentences = doc.sentences().out('array');
    const people = doc.people().out('array');
    const topics = doc.topics().out('array');
    const places = doc.places().out('array');
    
    // Extract dates using regex as compromise doesn't have .dates() in v14
    const dates = [...new Set((sanitizedText.match(DATE_PATTERNS) || []))];
    
    // Generate summary
    let summary = '';
    
    // Add header
    summary += '# Resumen de Conversación\n\n';
    
    // Add participants if found
    if (people.length > 0) {
      summary += `## Participantes:\n`;
      const uniquePeople = [...new Set(people)];
      uniquePeople.forEach(person => {
        summary += `- ${person}\n`;
      });
      summary += '\n';
    }
    
    // Add key topics
    if (topics.length > 0) {
      summary += `## Temas Principales:\n`;
      const uniqueTopics = [...new Set(topics)].slice(0, 10);
      uniqueTopics.forEach(topic => {
        summary += `- ${topic}\n`;
      });
      summary += '\n';
    }
    
    // Add temporal context
    if (dates.length > 0) {
      summary += `## Referencias Temporales:\n`;
      const uniqueDates = [...new Set(dates)].slice(0, 5);
      uniqueDates.forEach(date => {
        summary += `- ${date}\n`;
      });
      summary += '\n';
    }
    
    // Add location context
    if (places.length > 0) {
      summary += `## Lugares Mencionados:\n`;
      const uniquePlaces = [...new Set(places)].slice(0, 5);
      uniquePlaces.forEach(place => {
        summary += `- ${place}\n`;
      });
      summary += '\n';
    }
    
    // Add content summary
    summary += `## Resumen del Contenido:\n\n`;
    
    // Select most relevant sentences (first, last, and some middle ones)
    const numSentences = Math.min(sentences.length, 10);
    const selectedIndices = new Set();
    
    if (sentences.length > 0) {
      selectedIndices.add(0); // First sentence
      if (sentences.length > 1) {
        selectedIndices.add(sentences.length - 1); // Last sentence
      }
      
      // Add some middle sentences
      const step = Math.floor(sentences.length / numSentences);
      for (let i = step; i < sentences.length - 1; i += step) {
        selectedIndices.add(i);
        if (selectedIndices.size >= numSentences) break;
      }
    }
    
    const selectedSentences = Array.from(selectedIndices)
      .sort((a, b) => a - b)
      .map(i => sentences[i]);
    
    summary += selectedSentences.join(' ');
    
    // Add statistics
    summary += '\n\n## Estadísticas:\n';
    summary += `- Total de palabras: ${doc.wordCount()}\n`;
    summary += `- Total de oraciones: ${sentences.length}\n`;
    summary += `- Temas identificados: ${[...new Set(topics)].length}\n`;
    
    return {
      summary,
      format,
      stats: {
        wordCount: doc.wordCount(),
        sentenceCount: sentences.length,
        peopleCount: [...new Set(people)].length,
        topicsCount: [...new Set(topics)].length,
        datesCount: [...new Set(dates)].length,
        placesCount: [...new Set(places)].length
      },
      metadata: {
        people: [...new Set(people)],
        topics: [...new Set(topics)],
        dates: [...new Set(dates)],
        places: [...new Set(places)]
      }
    };
  } catch (error) {
    throw new Error(`Error generating summary: ${error.message}`);
  }
}

/**
 * Format summary text based on format type
 * @param {string} summary - The summary text
 * @param {string} format - Format type (txt or md)
 * @returns {string} Formatted summary
 */
export function formatSummary(summary, format) {
  if (format === 'txt') {
    // Convert markdown to plain text
    return summary
      .replace(/^#+\s+/gm, '')  // Remove markdown headers
      .replace(/\*\*/g, '')     // Remove bold
      .replace(/\*/g, '')       // Remove italic
      .replace(/`/g, '');       // Remove code
  }
  return summary; // Return as markdown
}
