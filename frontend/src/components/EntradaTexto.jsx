import { useState } from 'react';

export default function EntradaTexto({ onTextChange, initialText = '' }) {
  const [text, setText] = useState(initialText);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    // Calcular estadísticas
    const words = newText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(newText.length);
    
    // Notificar al componente padre
    if (onTextChange) {
      onTextChange(newText);
    }
  };

  const handleClear = () => {
    setText('');
    setWordCount(0);
    setCharCount(0);
    if (onTextChange) {
      onTextChange('');
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      const words = clipboardText.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharCount(clipboardText.length);
      if (onTextChange) {
        onTextChange(clipboardText);
      }
    } catch (err) {
      console.error('Error al pegar desde el portapapeles:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          📝 Entrada de Conversación
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePaste}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            📋 Pegar
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
          >
            🗑️ Limpiar
          </button>
        </div>
      </div>

      <textarea
        value={text}
        onChange={handleTextChange}
        className="w-full h-64 p-4 border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        placeholder="Pega aquí tu conversación completa... 

Puedes incluir:
- Texto plano de conversaciones
- Código entre comillas invertidas ```
- Múltiples mensajes
- Cualquier formato de chat

El sistema automáticamente:
✓ Generará un resumen
✓ Creará un grafo de conceptos
✓ Extraerá bloques de código"
      />

      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div className="flex gap-4">
          <span>📊 Palabras: <strong>{wordCount}</strong></span>
          <span>📄 Caracteres: <strong>{charCount}</strong></span>
        </div>
        {text.length > 0 && (
          <span className="text-green-600 font-semibold">
            ✓ Listo para procesar
          </span>
        )}
      </div>
    </div>
  );
}
