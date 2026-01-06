import { useState, useEffect } from 'react';

export default function GestorCodigo({ codeFiles, onCodeFilesChange }) {
  const [files, setFiles] = useState(codeFiles || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newFile, setNewFile] = useState({
    fileName: '',
    content: '',
    extension: '.py',
  });

  const extensiones = [
    '.py', '.js', '.jsx', '.ts', '.tsx', '.json', '.md', 
    '.html', '.css', '.java', '.c', '.cpp', '.cs', '.go', 
    '.rs', '.php', '.rb', '.sql', '.yaml', '.xml', '.sh', '.txt'
  ];

  useEffect(() => {
    setFiles(codeFiles || []);
  }, [codeFiles]);

  const handleAddFile = () => {
    if (!newFile.fileName || !newFile.content) {
      alert('Por favor completa el nombre del archivo y el contenido');
      return;
    }

    const file = {
      fileName: newFile.fileName.endsWith(newFile.extension) 
        ? newFile.fileName 
        : `${newFile.fileName}${newFile.extension}`,
      content: newFile.content,
      extension: newFile.extension,
      size: new Blob([newFile.content]).size,
      lines: newFile.content.split('\n').length,
    };

    const updatedFiles = [...files, file];
    setFiles(updatedFiles);
    onCodeFilesChange(updatedFiles);

    setNewFile({ fileName: '', content: '', extension: '.py' });
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onCodeFilesChange(updatedFiles);
  };

  const handleEditFile = (index) => {
    setEditingIndex(index);
  };

  const handleSaveEdit = (index, updatedContent) => {
    const updatedFiles = [...files];
    updatedFiles[index] = {
      ...updatedFiles[index],
      content: updatedContent,
      size: new Blob([updatedContent]).size,
      lines: updatedContent.split('\n').length,
    };
    setFiles(updatedFiles);
    onCodeFilesChange(updatedFiles);
    setEditingIndex(null);
  };

  const handleDownloadFile = (file) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        💻 Gestión de Archivos de Código
      </h2>

      {/* Formulario para agregar nuevo archivo */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Agregar Nuevo Archivo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input
            type="text"
            placeholder="nombre_archivo"
            value={newFile.fileName}
            onChange={(e) => setNewFile({ ...newFile, fileName: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newFile.extension}
            onChange={(e) => setNewFile({ ...newFile, extension: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {extensiones.map(ext => (
              <option key={ext} value={ext}>{ext}</option>
            ))}
          </select>
          <button
            onClick={handleAddFile}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            ➕ Agregar
          </button>
        </div>
        <textarea
          placeholder="// Escribe o pega el código aquí..."
          value={newFile.content}
          onChange={(e) => setNewFile({ ...newFile, content: e.target.value })}
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
      </div>

      {/* Lista de archivos */}
      {files.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <p>No hay archivos de código agregados</p>
          <p className="text-sm mt-1">Los archivos aparecerán aquí una vez agregados o extraídos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <span className="text-blue-600">📄</span>
                    {file.fileName}
                    {file.extracted && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Extraído
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(file.size)} • {file.lines} líneas • {file.language || file.extension}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditFile(index)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDownloadFile(file)}
                    className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    💾
                  </button>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {editingIndex === index ? (
                <div>
                  <textarea
                    defaultValue={file.content}
                    className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm mb-2"
                    onBlur={(e) => handleSaveEdit(index, e.target.value)}
                  />
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    Cerrar Editor
                  </button>
                </div>
              ) : (
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto max-h-32 overflow-y-auto font-mono border border-gray-200">
                  {file.content}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm">
          <p className="font-semibold text-blue-800">
            Total: {files.length} archivo(s) • {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
          </p>
        </div>
      )}
    </div>
  );
}
