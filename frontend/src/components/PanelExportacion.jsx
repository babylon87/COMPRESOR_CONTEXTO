import { useState } from 'react';

export default function PanelExportacion({ 
  summary, 
  summaryFormat,
  graphData, 
  graphHTML,
  codeFiles, 
  onExport,
  loading 
}) {
  const [selectedItems, setSelectedItems] = useState({
    summary: true,
    graph: true,
    code: true,
  });

  const [exportFormat, setExportFormat] = useState('zip');

  const handleToggleItem = (item) => {
    setSelectedItems(prev => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleExport = async () => {
    const itemsToExport = {};
    
    if (selectedItems.summary && summary) {
      itemsToExport.summary = summary;
      itemsToExport.summaryFormat = summaryFormat || 'md';
    }
    
    if (selectedItems.graph && graphData) {
      itemsToExport.graphData = graphData;
      itemsToExport.graphHTML = graphHTML;
    }
    
    if (selectedItems.code && codeFiles && codeFiles.length > 0) {
      itemsToExport.codeFiles = codeFiles;
    }

    if (Object.keys(itemsToExport).length === 0) {
      alert('Selecciona al menos un elemento para exportar');
      return;
    }

    onExport(itemsToExport);
  };

  const hasContent = summary || graphData || (codeFiles && codeFiles.length > 0);

  const getEstimatedSize = () => {
    let size = 0;
    if (selectedItems.summary && summary) {
      size += new Blob([summary]).size;
    }
    if (selectedItems.graph && graphHTML) {
      size += new Blob([graphHTML]).size;
    }
    if (selectedItems.code && codeFiles) {
      size += codeFiles.reduce((sum, file) => sum + (file.size || 0), 0);
    }
    
    // Estimar compresión ZIP (aproximadamente 30% del tamaño original)
    const zipSize = Math.floor(size * 0.3);
    
    if (zipSize < 1024) return `${zipSize} B`;
    if (zipSize < 1024 * 1024) return `${(zipSize / 1024).toFixed(2)} KB`;
    return `${(zipSize / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        📦 Exportación
      </h2>

      {!hasContent ? (
        <div className="text-center py-8 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No hay contenido para exportar</p>
          <p className="text-sm mt-1">Procesa una conversación primero</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Seleccionar elementos:</h3>
            
            {summary && (
              <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedItems.summary}
                  onChange={() => handleToggleItem('summary')}
                  className="w-4 h-4 text-blue-600 mr-3"
                />
                <div className="flex-1">
                  <span className="font-medium">📄 Resumen</span>
                  <p className="text-sm text-gray-600">
                    Archivo de resumen en formato {summaryFormat === 'md' ? 'Markdown (.md)' : 'Texto (.txt)'}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {(new Blob([summary]).size / 1024).toFixed(2)} KB
                </span>
              </label>
            )}

            {graphData && (
              <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedItems.graph}
                  onChange={() => handleToggleItem('graph')}
                  className="w-4 h-4 text-blue-600 mr-3"
                />
                <div className="flex-1">
                  <span className="font-medium">🕸️ Grafo</span>
                  <p className="text-sm text-gray-600">
                    Visualización interactiva HTML y datos JSON
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {graphData.nodes?.length || 0} nodos, {graphData.edges?.length || 0} conexiones
                  </p>
                </div>
              </label>
            )}

            {codeFiles && codeFiles.length > 0 && (
              <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedItems.code}
                  onChange={() => handleToggleItem('code')}
                  className="w-4 h-4 text-blue-600 mr-3"
                />
                <div className="flex-1">
                  <span className="font-medium">💻 Archivos de Código</span>
                  <p className="text-sm text-gray-600">
                    {codeFiles.length} archivo(s) de código
                  </p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {codeFiles.slice(0, 5).map((file, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {file.fileName}
                      </span>
                    ))}
                    {codeFiles.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{codeFiles.length - 5} más
                      </span>
                    )}
                  </div>
                </div>
              </label>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">
                  Tamaño estimado del ZIP:
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {getEstimatedSize()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Elementos seleccionados:
                </p>
                <p className="text-lg font-bold text-green-600">
                  {Object.values(selectedItems).filter(Boolean).length} / 3
                </p>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={loading || !Object.values(selectedItems).some(Boolean)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando ZIP...
                </span>
              ) : (
                '⬇️ Descargar ZIP'
              )}
            </button>

            <p className="text-xs text-center text-gray-500 mt-2">
              El archivo ZIP se descargará automáticamente
            </p>
          </div>
        </>
      )}
    </div>
  );
}
