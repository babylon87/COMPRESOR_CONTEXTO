import nlp from 'compromise';

/**
 * Generate a summary from conversation text
 * @param {string} text - The conversation text to summarize
 * @param {object} options - Options for summary generation
 * @returns {object} Summary data
 */
export function generateSummary(text, options = {}) {
  const { format = 'txt', maxLength = 500 } = options;

  try {
    const doc = nlp(text || '');

    // Sentences (fallback a separación simple si la librería no las devuelve)
    const sentences = (doc && typeof doc.sentences === 'function')
      ? (doc.sentences().out && doc.sentences().out('array') || [])
      : ((text || '').match(/[^.!?]+[.!?]*/g) || []).map(s => s.trim()).filter(Boolean);

    // Helper seguro para extraer arrays desde métodos de compromise
    const safeExtract = (accessor) => {
      try {
        if (!accessor) return [];
        const obj = accessor();
        if (!obj) return [];
        if (typeof obj.out === 'function') {
          const out = obj.out('array');
          return Array.isArray(out) ? out : [];
        }
        // Si el objeto ya es un array/valor simple
        if (Array.isArray(obj)) return obj;
        return [];
      } catch (e) {
        return [];
      }
    };

    const people = safeExtract(() => doc.people ? doc.people() : null);
    const topics = safeExtract(() => doc.topics ? doc.topics() : null);
    const dates = safeExtract(() => doc.dates ? doc.dates() : null);
    const places = safeExtract(() => doc.places ? doc.places() : null);

    // Word count calculado manualmente para no depender de doc.wordCount()
    const wordCount = (text || '')
      .split(/\s+/)
      .filter(Boolean)
      .length;

    // Generar summary
    let summary = '';
    summary += '# Resumen de Conversación\n\n';

    if (people.length > 0) {
      summary += '## Participantes:\n';
      [...new Set(people)].forEach(p => { summary += `- ${p}\n`; });
      summary += '\n';
    }

    if (topics.length > 0) {
      summary += '## Temas Principales:\n';
      [...new Set(topics)].slice(0, 10).forEach(t => { summary += `- ${t}\n`; });
      summary += '\n';
    }

    if (dates.length > 0) {
      summary += '## Referencias Temporales:\n';
      [...new Set(dates)].slice(0, 5).forEach(d => { summary += `- ${d}\n`; });
      summary += '\n';
    }

    if (places.length > 0) {
      summary += '## Lugares Mencionados:\n';
      [...new Set(places)].slice(0, 5).forEach(pl => { summary += `- ${pl}\n`; });
      summary += '\n';
    }

    summary += '## Resumen del Contenido:\n\n';

    // Selección de oraciones de forma segura
    let selectedSentences = [];
    if (!sentences || sentences.length === 0) {
      selectedSentences = [(text || '').substring(0, maxLength)];
    } else {
      const numSentences = Math.min(sentences.length, 10);
      const indices = new Set();
      indices.add(0);
      if (sentences.length > 1) indices.add(sentences.length - 1);
      const step = Math.max(1, Math.floor(sentences.length / numSentences));
      for (let i = step; i < sentences.length - 1 && indices.size < numSentences; i += step) {
        indices.add(i);
      }
      selectedSentences = Array.from(indices).sort((a, b) => a - b).map(i => sentences[i]).filter(Boolean);
    }

    summary += selectedSentences.join(' ');

    // Estadísticas
    summary += '\n\n## Estadísticas:\n';
    summary += `- Total de palabras: ${wordCount}\n`;
    summary += `- Total de oraciones: ${sentences.length || 0}\n`;
    summary += `- Temas identificados: ${[...new Set(topics)].length}\n`;

    return {
      summary,
      format,
      stats: {
        wordCount,
        sentenceCount: sentences.length || 0,
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
    throw new Error(`Error generating summary: ${error && error.message ? error.message : String(error)}`);
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
    return summary
      .replace(/^#+\s+/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '');
  }
  return summary;
}
