import nlp from 'compromise';

/**
 * Sanitize text to prevent XSS attacks
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  
  // Remove potential HTML/script tags
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, ''); // Remove event handlers
}

/**
 * Extract concepts and relationships from text to create a graph
 * @param {string} text - The conversation text to analyze
 * @returns {object} Graph data in Cytoscape format
 */
export function generateGraphData(text) {
  try {
    // Sanitize input
    const sanitizedText = sanitizeText(text);
    
    const doc = nlp(sanitizedText);
    
    // Extract entities
    const people = doc.people().out('array');
    const topics = doc.topics().out('array');
    const verbs = doc.verbs().out('array');
    const nouns = doc.nouns().out('array');
    
    // Create nodes
    const nodes = new Map();
    const edges = [];
    
    // Add people as nodes
    [...new Set(people)].forEach(person => {
      if (!nodes.has(person.toLowerCase())) {
        nodes.set(person.toLowerCase(), {
          id: `person_${nodes.size}`,
          label: person,
          type: 'person',
          group: 'person'
        });
      }
    });
    
    // Add topics as nodes
    [...new Set(topics)].slice(0, 15).forEach(topic => {
      const key = topic.toLowerCase();
      if (!nodes.has(key) && topic.length > 2) {
        nodes.set(key, {
          id: `topic_${nodes.size}`,
          label: topic,
          type: 'topic',
          group: 'topic'
        });
      }
    });
    
    // Add important nouns as concept nodes
    const nounFreq = {};
    nouns.forEach(noun => {
      const normalized = noun.toLowerCase().trim();
      if (normalized.length > 3 && !nodes.has(normalized)) {
        nounFreq[normalized] = (nounFreq[normalized] || 0) + 1;
      }
    });
    
    // Add most frequent nouns as nodes
    Object.entries(nounFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([noun, freq]) => {
        if (!nodes.has(noun)) {
          nodes.set(noun, {
            id: `concept_${nodes.size}`,
            label: noun,
            type: 'concept',
            group: 'concept',
            frequency: freq
          });
        }
      });
    
    // Create relationships between nodes
    const sentences = doc.sentences().out('array');
    
    // Analyze each sentence for relationships
    sentences.forEach((sentence, idx) => {
      const sentDoc = nlp(sentence);
      const sentPeople = sentDoc.people().out('array');
      const sentTopics = sentDoc.topics().out('array');
      const sentNouns = sentDoc.nouns().out('array');
      const sentVerbs = sentDoc.verbs().out('array');
      
      // Connect people mentioned in same sentence
      for (let i = 0; i < sentPeople.length; i++) {
        for (let j = i + 1; j < sentPeople.length; j++) {
          const source = nodes.get(sentPeople[i].toLowerCase());
          const target = nodes.get(sentPeople[j].toLowerCase());
          if (source && target) {
            edges.push({
              source: source.id,
              target: target.id,
              label: 'interacts',
              type: 'interaction'
            });
          }
        }
      }
      
      // Connect people with topics
      sentPeople.forEach(person => {
        sentTopics.forEach(topic => {
          const personNode = nodes.get(person.toLowerCase());
          const topicNode = nodes.get(topic.toLowerCase());
          if (personNode && topicNode) {
            const verb = sentVerbs[0] || 'discusses';
            edges.push({
              source: personNode.id,
              target: topicNode.id,
              label: verb,
              type: 'discusses'
            });
          }
        });
      });
      
      // Connect topics with related concepts
      sentTopics.forEach(topic => {
        sentNouns.forEach(noun => {
          const topicNode = nodes.get(topic.toLowerCase());
          const nounNode = nodes.get(noun.toLowerCase());
          if (topicNode && nounNode && topicNode.id !== nounNode.id) {
            edges.push({
              source: topicNode.id,
              target: nounNode.id,
              label: 'relates to',
              type: 'relation'
            });
          }
        });
      });
    });
    
    // Convert nodes map to array
    const nodeArray = Array.from(nodes.values());
    
    // Remove duplicate edges
    const uniqueEdges = [];
    const edgeSet = new Set();
    
    edges.forEach(edge => {
      const key = `${edge.source}-${edge.target}`;
      const reverseKey = `${edge.target}-${edge.source}`;
      
      if (!edgeSet.has(key) && !edgeSet.has(reverseKey)) {
        edgeSet.add(key);
        uniqueEdges.push(edge);
      }
    });
    
    // Format for Cytoscape.js
    const cytoscapeData = {
      nodes: nodeArray.map(node => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          group: node.group,
          frequency: node.frequency || 1
        }
      })),
      edges: uniqueEdges.map((edge, idx) => ({
        data: {
          id: `edge_${idx}`,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          type: edge.type
        }
      }))
    };
    
    return {
      graphData: cytoscapeData,
      stats: {
        nodeCount: nodeArray.length,
        edgeCount: uniqueEdges.length,
        personCount: nodeArray.filter(n => n.type === 'person').length,
        topicCount: nodeArray.filter(n => n.type === 'topic').length,
        conceptCount: nodeArray.filter(n => n.type === 'concept').length
      }
    };
  } catch (error) {
    throw new Error(`Error generating graph: ${error.message}`);
  }
}

/**
 * Generate HTML file for interactive graph visualization
 * @param {object} graphData - Cytoscape formatted graph data
 * @returns {string} HTML content
 */
export function generateGraphHTML(graphData) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grafo de Conceptos</title>
  <script src="https://unpkg.com/cytoscape@3.23.0/dist/cytoscape.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background: #1a1a1a;
    }
    #cy {
      width: 100%;
      height: 100vh;
      background: #1a1a1a;
    }
    .info {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(255, 255, 255, 0.9);
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      max-width: 300px;
      z-index: 1000;
    }
    .info h3 {
      margin: 0 0 10px 0;
      color: #333;
    }
    .info p {
      margin: 5px 0;
      color: #666;
      font-size: 14px;
    }
    .legend {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: rgba(255, 255, 255, 0.9);
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
    }
    .legend-item {
      display: flex;
      align-items: center;
      margin: 5px 0;
    }
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      margin-right: 10px;
    }
  </style>
</head>
<body>
  <div class="info">
    <h3>Grafo de Conceptos</h3>
    <p>Haz clic en los nodos para más información</p>
    <p>Arrastra para mover el grafo</p>
    <p>Usa la rueda del ratón para zoom</p>
  </div>
  
  <div class="legend">
    <div class="legend-item">
      <div class="legend-color" style="background: #ff6b6b;"></div>
      <span>Personas</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background: #4ecdc4;"></div>
      <span>Temas</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background: #95e1d3;"></div>
      <span>Conceptos</span>
    </div>
  </div>
  
  <div id="cy"></div>
  
  <script>
    const graphData = ${JSON.stringify(graphData)};
    
    const cy = cytoscape({
      container: document.getElementById('cy'),
      elements: {
        nodes: graphData.nodes,
        edges: graphData.edges
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
            'height': 'mapData(frequency, 1, 10, 30, 60)'
          }
        },
        {
          selector: 'node[group="person"]',
          style: {
            'background-color': '#ff6b6b'
          }
        },
        {
          selector: 'node[group="topic"]',
          style: {
            'background-color': '#4ecdc4'
          }
        },
        {
          selector: 'node[group="concept"]',
          style: {
            'background-color': '#95e1d3'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#555',
            'target-arrow-color': '#555',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px',
            'text-rotation': 'autorotate',
            'text-margin-y': -10,
            'color': '#fff',
            'text-outline-color': '#000',
            'text-outline-width': 1
          }
        }
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
        minTemp: 1.0
      },
      minZoom: 0.5,
      maxZoom: 3
    });
    
    // Add click event to nodes
    cy.on('tap', 'node', function(evt){
      const node = evt.target;
      console.log('Clicked node:', node.data());
      node.style('background-color', '#ffe66d');
      setTimeout(() => {
        if (node.data('group') === 'person') {
          node.style('background-color', '#ff6b6b');
        } else if (node.data('group') === 'topic') {
          node.style('background-color', '#4ecdc4');
        } else {
          node.style('background-color', '#95e1d3');
        }
      }, 1000);
    });
  </script>
</body>
</html>`;
}
