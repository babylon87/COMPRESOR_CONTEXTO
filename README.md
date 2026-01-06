# 🗜️ COMPRESOR DE CONTEXTO

Plataforma multiplataforma desarrollada para web y móvil que permite a los usuarios cargar conversaciones completas y generar resúmenes, grafos de conceptos y extraer archivos de código.

## 🌟 Características Principales

### 1. **Resúmenes Inteligentes**
- Generación automática de resúmenes manteniendo el contexto completo
- Extracción de participantes, temas, fechas y lugares
- Exportación en múltiples formatos (.txt o .md)
- Estadísticas detalladas del contenido

### 2. **Grafos de Conceptos**
- Detección automática de conceptos clave y relaciones
- Visualización interactiva con Cytoscape.js
- Exportación como imagen (.png) o archivo HTML interactivo
- Identificación de personas, temas y conceptos

### 3. **Gestión de Código**
- Extracción automática de bloques de código desde conversaciones
- Editor integrado para modificar archivos
- Soporte para múltiples lenguajes (.py, .js, .json, .md, etc.)
- Validación de extensiones y formatos

### 4. **Compresión y Exportación**
- Generación de archivos .ZIP con todos los elementos
- Selección personalizada de qué exportar
- Estimación del tamaño del archivo
- Descarga automática del paquete completo

## 🚀 Tecnologías Utilizadas

### Backend
- **Node.js** con **Express.js**
- **compromise.js** - Procesamiento de lenguaje natural para resúmenes
- **Cytoscape.js** - Generación de datos para grafos
- **archiver** - Compresión ZIP
- **cors** - Manejo de CORS para API

### Frontend
- **React.js** con **Vite**
- **TailwindCSS** - Estilos y diseño responsivo
- **Cytoscape.js** - Visualización de grafos
- **axios** - Cliente HTTP
- Diseño 100% responsivo y mobile-friendly

## 📦 Instalación

### Prerequisitos
- Node.js v16 o superior
- npm o yarn

### Backend

```bash
cd backend
npm install
npm start
```

El servidor se ejecutará en `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

## 🎯 Uso de la Aplicación

### Flujo Principal

1. **Entrada de Texto**
   - Pega tu conversación completa en el área de texto
   - Utiliza el botón "Pegar" para importar desde el portapapeles
   - Visualiza estadísticas de palabras y caracteres en tiempo real

2. **Procesamiento**
   - **Generar Resumen**: Crea un resumen inteligente con estadísticas
   - **Generar Grafo**: Visualiza conceptos y relaciones
   - **Extraer Código**: Detecta y extrae bloques de código
   - **Procesar Todo**: Ejecuta todas las acciones simultáneamente

3. **Revisión**
   - Navega entre pestañas para ver cada resultado
   - Edita archivos de código según necesites
   - Previsualiza resúmenes y grafos

4. **Exportación**
   - Selecciona qué elementos incluir en el ZIP
   - Visualiza el tamaño estimado
   - Descarga el paquete completo

## 📁 Estructura del Proyecto

```
COMPRESOR_CONTEXTO/
├── backend/
│   ├── index.js              # Servidor principal
│   ├── routes/               # Rutas de la API
│   │   ├── summary.js        # Endpoints de resúmenes
│   │   ├── graph.js          # Endpoints de grafos
│   │   ├── code.js           # Endpoints de código
│   │   └── export.js         # Endpoints de exportación
│   ├── services/             # Lógica de negocio
│   │   ├── summaryService.js # Generación de resúmenes
│   │   ├── graphService.js   # Generación de grafos
│   │   ├── codeService.js    # Procesamiento de código
│   │   └── exportService.js  # Creación de ZIPs
│   ├── temp/                 # Archivos temporales
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   │   ├── EntradaTexto.jsx
│   │   │   ├── VistaResumen.jsx
│   │   │   ├── VisualizadorGrafo.jsx
│   │   │   ├── GestorCodigo.jsx
│   │   │   └── PanelExportacion.jsx
│   │   ├── pages/
│   │   │   └── Home.jsx      # Página principal
│   │   ├── services/
│   │   │   └── api.js        # Cliente API
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Resúmenes
- `POST /api/summary/generate` - Generar resumen
- `POST /api/summary/preview` - Vista previa rápida

### Grafos
- `POST /api/graph/generate` - Generar datos del grafo
- `POST /api/graph/html` - Generar HTML interactivo
- `POST /api/graph/complete` - Generar grafo completo

### Código
- `GET /api/code/extensions` - Listar extensiones soportadas
- `POST /api/code/validate` - Validar archivos
- `POST /api/code/extract` - Extraer código de texto
- `POST /api/code/process` - Procesar archivo individual

### Exportación
- `POST /api/export/create` - Crear archivo ZIP
- `POST /api/export/preview` - Previsualizar exportación

## 🎨 Características de la Interfaz

### Diseño Responsivo
- Adaptable a móviles, tablets y escritorio
- Sistema de pestañas para navegación fluida
- Indicadores visuales de progreso
- Feedback inmediato al usuario

### Experiencia de Usuario
- Copiar/pegar rápido desde portapapeles
- Descarga directa de archivos individuales
- Vista previa antes de exportar
- Estadísticas en tiempo real

### Accesibilidad
- Interfaz en español
- Iconos descriptivos
- Mensajes de error claros
- Tooltips informativos

## 🔧 Configuración

### Variables de Entorno

**Backend** (opcional)
```env
PORT=3001
```

**Frontend** (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

## 📝 Formatos Soportados

### Código
- Python (.py)
- JavaScript (.js, .jsx, .mjs)
- TypeScript (.ts, .tsx)
- JSON (.json)
- Markdown (.md)
- HTML (.html, .htm)
- CSS (.css, .scss, .sass)
- Java (.java)
- C/C++ (.c, .cpp, .h, .hpp)
- C# (.cs)
- Go (.go)
- Rust (.rs)
- PHP (.php)
- Ruby (.rb)
- SQL (.sql)
- YAML (.yaml, .yml)
- XML (.xml)
- Bash (.sh, .bash)
- Texto (.txt)

## 🚦 Scripts Disponibles

### Backend
```bash
npm start          # Inicia el servidor
npm run dev        # Modo desarrollo con hot-reload
```

### Frontend
```bash
npm run dev        # Inicia servidor de desarrollo
npm run build      # Construye para producción
npm run preview    # Previsualiza build de producción
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 👥 Autor

Desarrollado como plataforma de compresión de contexto para conversaciones.

## 🐛 Reporte de Bugs

Si encuentras algún bug o tienes sugerencias, por favor abre un issue en el repositorio.

## 🎯 Roadmap

- [ ] Soporte para más idiomas
- [ ] Exportación a PDF
- [ ] Integración con APIs de IA
- [ ] Temas personalizables
- [ ] Modo oscuro
- [ ] Compartir grafos en línea
- [ ] Historial de conversaciones procesadas
- [ ] Comparación entre conversaciones

## 💡 Ejemplos de Uso

### Caso 1: Reunión de Trabajo
Pega el transcript de una reunión de trabajo y obtén:
- Resumen con puntos clave y decisiones
- Grafo mostrando relaciones entre proyectos y personas
- Código compartido durante la reunión

### Caso 2: Chat Técnico
Importa una conversación técnica y extrae:
- Resumen de problemas y soluciones
- Visualización de conceptos técnicos relacionados
- Todos los snippets de código compartidos

### Caso 3: Documentación de Proyecto
Procesa documentación extensa para:
- Resumen ejecutivo
- Mapa conceptual del proyecto
- Ejemplos de código organizados

## 🔒 Seguridad

- Todo el procesamiento se realiza localmente
- No se almacenan conversaciones en el servidor
- Los archivos temporales se eliminan automáticamente
- Sin dependencias de APIs externas para procesamiento básico

## ⚡ Rendimiento

- Procesamiento paralelo de resúmenes, grafos y código
- Compresión optimizada de archivos ZIP
- Carga diferida de componentes
- Caché de resultados en cliente

---

**¡Gracias por usar Compresor de Contexto!** 🎉

