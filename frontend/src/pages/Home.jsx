import { useState } from 'react';
import EntradaTexto from '../components/EntradaTexto';
import VistaResumen from '../components/VistaResumen';
import VisualizadorGrafo from '../components/VisualizadorGrafo';
import GestorCodigo from '../components/GestorCodigo';
import PanelExportacion from '../components/PanelExportacion';
import { summaryService, graphService, codeService, exportService } from '../services/api';

export default function Home() {
  const [conversationText, setConversationText] = useState('');
  const [summary, setSummary] = useState(null);
  const [summaryFormat, setSummaryFormat] = useState('md');
  const [summaryStats, setSummaryStats] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [graphHTML, setGraphHTML] = useState(null);
  const [graphStats, setGraphStats] = useState(null);
  const [codeFiles, setCodeFiles] = useState([]);
  
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [loadingCode, setLoadingCode] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  const [activeTab, setActiveTab] = useState('input');

  const handleTextChange = (text) => {
    setConversationText(text);
  };

  const handleGenerateSummary = async () => {
    if (!conversationText.trim()) {
      alert('Por favor ingresa texto para procesar');
      return;
    }

    setLoadingSummary(true);
    try {
      const result = await summaryService.generate(conversationText, summaryFormat);
      setSummary(result.summary);
      setSummaryStats(result.stats);
      setActiveTab('summary');
    } catch (error) {
      console.error('Error generando resumen:', error);
      alert('Error al generar el resumen. Por favor intenta de nuevo.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleGenerateGraph = async () => {
    if (!conversationText.trim()) {
      alert('Por favor ingresa texto para procesar');
      return;
    }

    setLoadingGraph(true);
    try {
      const result = await graphService.complete(conversationText);
      setGraphData(result.graphData);
      setGraphHTML(result.html);
      setGraphStats(result.stats);
      setActiveTab('graph');
    } catch (error) {
      console.error('Error generando grafo:', error);
      alert('Error al generar el grafo. Por favor intenta de nuevo.');
    } finally {
      setLoadingGraph(false);
    }
  };

  const handleExtractCode = async () => {
    if (!conversationText.trim()) {
      alert('Por favor ingresa texto para procesar');
      return;
    }

    setLoadingCode(true);
    try {
      const result = await codeService.extract(conversationText);
      setCodeFiles(result.codeFiles || []);
      setActiveTab('code');
      
      if (result.count === 0) {
        alert('No se encontraron bloques de código en el texto');
      }
    } catch (error) {
      console.error('Error extrayendo código:', error);
      alert('Error al extraer código. Por favor intenta de nuevo.');
    } finally {
      setLoadingCode(false);
    }
  };

  const handleProcessAll = async () => {
    if (!conversationText.trim()) {
      alert('Por favor ingresa texto para procesar');
      return;
    }

    // Procesar todo en paralelo
    await Promise.all([
      handleGenerateSummary(),
      handleGenerateGraph(),
      handleExtractCode(),
    ]);
  };

  const handleExport = async (exportData) => {
    setLoadingExport(true);
    try {
      const result = await exportService.create(exportData);
      
      // Descargar el archivo
      const downloadUrl = `http://localhost:3001${result.downloadUrl}`;
      window.open(downloadUrl, '_blank');
      
      alert('¡Exportación completada! El archivo se está descargando.');
    } catch (error) {
      console.error('Error exportando:', error);
      alert('Error al crear la exportación. Por favor intenta de nuevo.');
    } finally {
      setLoadingExport(false);
    }
  };

  const tabs = [
    { id: 'input', label: '📝 Entrada', icon: '📝' },
    { id: 'summary', label: '📄 Resumen', icon: '📄', badge: summary ? '✓' : null },
    { id: 'graph', label: '🕸️ Grafo', icon: '🕸️', badge: graphData ? '✓' : null },
    { id: 'code', label: '💻 Código', icon: '💻', badge: codeFiles.length > 0 ? codeFiles.length : null },
    { id: 'export', label: '📦 Exportar', icon: '📦' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🗜️ Compresor de Contexto
          </h1>
          <p className="text-gray-600 mt-1">
            Analiza, resume y comprime conversaciones completas
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors relative ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.badge && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="space-y-6">
            <EntradaTexto 
              onTextChange={handleTextChange}
              initialText={conversationText}
            />

            {conversationText.trim() && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">⚡ Acciones Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <button
                    onClick={handleGenerateSummary}
                    disabled={loadingSummary}
                    className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium"
                  >
                    {loadingSummary ? '⏳ Procesando...' : '📄 Generar Resumen'}
                  </button>
                  <button
                    onClick={handleGenerateGraph}
                    disabled={loadingGraph}
                    className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 font-medium"
                  >
                    {loadingGraph ? '⏳ Procesando...' : '🕸️ Generar Grafo'}
                  </button>
                  <button
                    onClick={handleExtractCode}
                    disabled={loadingCode}
                    className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 font-medium"
                  >
                    {loadingCode ? '⏳ Procesando...' : '💻 Extraer Código'}
                  </button>
                  <button
                    onClick={handleProcessAll}
                    disabled={loadingSummary || loadingGraph || loadingCode}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all disabled:opacity-50 font-medium"
                  >
                    {loadingSummary || loadingGraph || loadingCode ? '⏳ Procesando...' : '🚀 Procesar Todo'}
                  </button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    💡 <strong>Consejo:</strong> Usa "Procesar Todo" para generar resumen, grafo y extraer código simultáneamente.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Resumen</h2>
                <p className="text-gray-600">Vista previa y descarga del resumen generado</p>
              </div>
              <select
                value={summaryFormat}
                onChange={(e) => setSummaryFormat(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="md">Markdown (.md)</option>
                <option value="txt">Texto Plano (.txt)</option>
              </select>
            </div>
            <VistaResumen 
              summary={summary}
              format={summaryFormat}
              stats={summaryStats}
              loading={loadingSummary}
            />
          </div>
        )}

        {/* Graph Tab */}
        {activeTab === 'graph' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Grafo de Conceptos</h2>
              <p className="text-gray-600">Visualización de relaciones y conceptos clave</p>
            </div>
            <VisualizadorGrafo 
              graphData={graphData}
              loading={loadingGraph}
            />
            {graphStats && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold mb-2">Estadísticas del Grafo</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Nodos:</span>
                    <strong className="ml-2 text-blue-600">{graphStats.nodeCount}</strong>
                  </div>
                  <div>
                    <span className="text-gray-600">Conexiones:</span>
                    <strong className="ml-2 text-blue-600">{graphStats.edgeCount}</strong>
                  </div>
                  <div>
                    <span className="text-gray-600">Personas:</span>
                    <strong className="ml-2 text-blue-600">{graphStats.personCount}</strong>
                  </div>
                  <div>
                    <span className="text-gray-600">Temas:</span>
                    <strong className="ml-2 text-blue-600">{graphStats.topicCount}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Code Tab */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Archivos de Código</h2>
              <p className="text-gray-600">Gestiona y edita archivos de código extraídos o agregados</p>
            </div>
            <GestorCodigo 
              codeFiles={codeFiles}
              onCodeFilesChange={setCodeFiles}
            />
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Exportar Resultados</h2>
              <p className="text-gray-600">Descarga todos los resultados en un archivo ZIP</p>
            </div>
            <PanelExportacion
              summary={summary}
              summaryFormat={summaryFormat}
              graphData={graphData}
              graphHTML={graphHTML}
              codeFiles={codeFiles}
              onExport={handleExport}
              loading={loadingExport}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>🗜️ Compresor de Contexto - Plataforma para análisis de conversaciones</p>
          <p className="mt-1">Genera resúmenes, grafos de conceptos y extrae código automáticamente</p>
        </div>
      </footer>
    </div>
  );
}
