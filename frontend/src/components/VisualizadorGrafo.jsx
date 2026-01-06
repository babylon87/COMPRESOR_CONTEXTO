import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';

export default function VisualizadorGrafo({ graphData, loading }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!graphData || !containerRef.current) return;

    // Limpiar grafo anterior
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    // Crear nuevo grafo
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: {
        nodes: graphData.nodes || [],
        edges: graphData.edges || [],
      },
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': '#666',
            'color': '#fff',
            'text-outline-color': '#000',
            'text-outline-width': 2,
            'font-size': '12px',
            'width': 'mapData(frequency, 1, 10, 30, 60)',
            'height': 'mapData(frequency, 1, 10, 30, 60)',
          },
        },
        {
          selector: 'node[group="person"]',
          style: {
            'background-color': '#ff6b6b',
          },
        },
        {
          selector: 'node[group="topic"]',
          style: {
            'background-color': '#4ecdc4',
          },
        },
        {
          selector: 'node[group="concept"]',
          style: {
            'background-color': '#95e1d3',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#999',
            'target-arrow-color': '#999',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px',
            'text-rotation': 'autorotate',
            'text-margin-y': -10,
            'color': '#666',
          },
        },
      ],
      layout: {
        name: 'cose',
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
      },
      minZoom: 0.5,
      maxZoom: 3,
    });

    // Agregar evento de clic
    cyRef.current.on('tap', 'node', function(evt) {
      const node = evt.target;
      const originalColor = node.data('group') === 'person' ? '#ff6b6b' 
        : node.data('group') === 'topic' ? '#4ecdc4' 
        : '#95e1d3';
      
      node.style('background-color', '#ffe66d');
      setTimeout(() => {
        node.style('background-color', originalColor);
      }, 1000);
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [graphData]);

  const handleDownloadHTML = () => {
    if (!graphData) return;

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grafo de Conceptos</title>
  <script src="https://unpkg.com/cytoscape@3.23.0/dist/cytoscape.min.js"></script>
  <style>
    body { margin: 0; padding: 0; background: #f5f5f5; font-family: Arial, sans-serif; }
    #cy { width: 100%; height: 100vh; }
    .legend { position: absolute; bottom: 20px; left: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .legend-item { display: flex; align-items: center; margin: 5px 0; }
    .legend-color { width: 20px; height: 20px; border-radius: 50%; margin-right: 10px; }
  </style>
</head>
<body>
  <div id="cy"></div>
  <div class="legend">
    <div class="legend-item"><div class="legend-color" style="background: #ff6b6b;"></div><span>Personas</span></div>
    <div class="legend-item"><div class="legend-color" style="background: #4ecdc4;"></div><span>Temas</span></div>
    <div class="legend-item"><div class="legend-color" style="background: #95e1d3;"></div><span>Conceptos</span></div>
  </div>
  <script>
    const graphData = ${JSON.stringify(graphData)};
    cytoscape({
      container: document.getElementById('cy'),
      elements: graphData,
      style: ${JSON.stringify(cyRef.current?.style().json() || [])},
      layout: { name: 'cose', idealEdgeLength: 100, nodeOverlap: 20 }
    });
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grafo.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.fit();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Generando grafo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!graphData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">No hay grafo generado aún</p>
            <p className="text-sm mt-2">El grafo de conceptos aparecerá aquí</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          🕸️ Grafo de Conceptos
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
          >
            🔄 Restablecer
          </button>
          <button
            onClick={handleDownloadHTML}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
          >
            💾 Descargar HTML
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-md overflow-hidden">
        <div ref={containerRef} className="w-full h-96 bg-gray-50"></div>
      </div>

      <div className="mt-4 p-3 bg-green-50 rounded-md">
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-400"></div>
            <span>Personas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-teal-400"></div>
            <span>Temas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-300"></div>
            <span>Conceptos</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          💡 Haz clic en los nodos para resaltarlos • Arrastra para mover • Rueda del ratón para zoom
        </p>
      </div>
    </div>
  );
}
