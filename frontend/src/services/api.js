import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Servicios de Resumen
export const summaryService = {
  generate: async (text, format = 'md') => {
    const response = await api.post('/summary/generate', { text, format });
    return response.data;
  },
  preview: async (text) => {
    const response = await api.post('/summary/preview', { text });
    return response.data;
  },
};

// Servicios de Grafo
export const graphService = {
  generate: async (text) => {
    const response = await api.post('/graph/generate', { text });
    return response.data;
  },
  generateHTML: async (graphData) => {
    const response = await api.post('/graph/html', { graphData });
    return response.data;
  },
  complete: async (text) => {
    const response = await api.post('/graph/complete', { text });
    return response.data;
  },
};

// Servicios de Código
export const codeService = {
  getExtensions: async () => {
    const response = await api.get('/code/extensions');
    return response.data;
  },
  validate: async (files) => {
    const response = await api.post('/code/validate', { files });
    return response.data;
  },
  extract: async (text) => {
    const response = await api.post('/code/extract', { text });
    return response.data;
  },
  process: async (content, name, extension) => {
    const response = await api.post('/code/process', { content, name, extension });
    return response.data;
  },
};

// Servicios de Exportación
export const exportService = {
  create: async (exportData) => {
    const response = await api.post('/export/create', exportData);
    return response.data;
  },
  preview: async (exportData) => {
    const response = await api.post('/export/preview', exportData);
    return response.data;
  },
};

export default api;
