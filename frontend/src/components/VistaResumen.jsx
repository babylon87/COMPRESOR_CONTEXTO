import { useState, useEffect } from 'react';

export default function VistaResumen({ summary, format, stats, loading }) {
  const [viewFormat, setViewFormat] = useState('preview');

  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const formatText = (text) => {
    if (!text) return '';
    
    if (viewFormat === 'raw') {
      return text;
    }
    
    // Para vista previa, convertir markdown a HTML simple
    return text
      .split('\n')
      .map(line => {
        if (line.startsWith('# ')) {
          return `<h1 class="text-2xl font-bold mt-4 mb-2">${escapeHtml(line.substring(2))}</h1>`;
        } else if (line.startsWith('## ')) {
          return `<h2 class="text-xl font-bold mt-3 mb-2">${escapeHtml(line.substring(3))}</h2>`;
        } else if (line.startsWith('### ')) {
          return `<h3 class="text-lg font-bold mt-2 mb-1">${escapeHtml(line.substring(4))}</h3>`;
        } else if (line.startsWith('- ')) {
          return `<li class="ml-4">${escapeHtml(line.substring(2))}</li>`;
        } else if (line.trim() === '') {
          return '<br/>';
        }
        return `<p class="mb-2">${escapeHtml(line)}</p>`;
      })
      .join('');
  };

  const handleDownload = () => {
    const extension = format === 'md' ? '.md' : '.txt';
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumen${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      alert('Resumen copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Generando resumen...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg">No hay resumen generado aún</p>
            <p className="text-sm mt-2">El resumen aparecerá aquí una vez procesado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          📄 Resumen Generado
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewFormat(viewFormat === 'preview' ? 'raw' : 'preview')}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
          >
            {viewFormat === 'preview' ? '📝 Ver Raw' : '👁️ Vista Previa'}
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            📋 Copiar
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
          >
            💾 Descargar
          </button>
        </div>
      </div>

      {stats && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Palabras:</span>
              <strong className="ml-2 text-blue-600">{stats.wordCount}</strong>
            </div>
            <div>
              <span className="text-gray-600">Oraciones:</span>
              <strong className="ml-2 text-blue-600">{stats.sentenceCount}</strong>
            </div>
            <div>
              <span className="text-gray-600">Temas:</span>
              <strong className="ml-2 text-blue-600">{stats.topicsCount}</strong>
            </div>
            <div>
              <span className="text-gray-600">Personas:</span>
              <strong className="ml-2 text-blue-600">{stats.peopleCount}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="border border-gray-200 rounded-md p-4 max-h-96 overflow-y-auto">
        {viewFormat === 'preview' ? (
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: formatText(summary) }}
          />
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
            {summary}
          </pre>
        )}
      </div>
    </div>
  );
}
