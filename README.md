# Cesium KML Road Geometry Tool

A modern, production-ready web application for visualizing and processing KML files related to road infrastructure using CesiumJS.

## Features

- **3D Globe Visualization**: Interactive Cesium globe with terrain and full zoom/pan/rotate controls
- **KML Upload**: Drag-and-drop file upload with immediate visualization
- **Placemark Display**: Blue points for uploaded KML placemarks with outlines
- **Geometry Processing**: Send data to backend API for road-aligned line and polygon generation
- **Results Visualization**: 
  - Red lines for road-aligned geometries
  - Yellow transparent polygons for rectangles/markings
  - Green points for snapped positions
- **Download Output**: Export processed KML files
- **Parameters Control**: Customize rectangle length, width, and strip count

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **3D Engine**: CesiumJS 1.115+
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React hooks
- **HTTP Client**: Axios

## Getting Started

### Installation

```bash
npm install
# or
pnpm install
```

### Development

```bash
npm run dev
```

The app will start on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Application Structure

```
src/
├── components/
│   ├── CesiumViewer.tsx       # Main 3D globe component
│   ├── ControlPanel.tsx        # Left panel with controls
│   ├── KMLUploader.tsx         # Drag-drop KML upload
│   ├── DownloadButton.tsx      # Download processed KML
│   └── MapLayers.tsx           # Geometry visualization utilities
├── App.tsx                     # Main app component
├── main.tsx                    # Entry point
└── index.css                   # Global styles
```

## How to Use

1. **Upload KML**: Drag and drop a KML file or click to browse
   - The placemarks will appear as blue points on the map
   
2. **Configure Parameters**:
   - Rectangle Length: Width of the generated geometries (meters)
   - Rectangle Width: Height of the generated geometries (meters)
   - Strip Count: Number of parallel strips to generate

3. **Generate Geometry**: Click "Generate Road Geometry" button
   - The API will process the file with provided parameters
   - Results display as red lines and yellow polygons

4. **Download Results**: Click "Download Processed KML" to save the output

## Backend API Integration

The app expects a backend endpoint at `/process-kml`:

```
POST /process-kml
Content-Type: multipart/form-data

{
  file: File,           // KML file
  rectLength: number,   // Rectangle length
  rectWidth: number,    // Rectangle width
  stripCount: number    // Strip count
}

Response: KML file (blob)
```

## Features Implemented

✅ Full-screen Cesium viewer with terrain
✅ KML file drag-and-drop upload
✅ Placemark visualization as blue points
✅ Parameter inputs for road geometry
✅ API integration for processing
✅ Results visualization (lines, polygons)
✅ File download functionality
✅ Loading states and error handling
✅ Responsive design
✅ TypeScript type safety

## Configuration

### Cesium Camera Default

The app defaults to focusing on India. To change:

Edit `src/components/CesiumViewer.tsx`:
```typescript
viewerRef.current.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(lon, lat, altitude)
})
```

### Geometry Colors

Edit `src/components/MapLayers.tsx` to customize visualization colors:
- Lines: `Cesium.Color.RED` 
- Polygons: `Cesium.Color.YELLOW`
- Points: `Cesium.Color.LIME`

## Performance Considerations

- Efficiently handles 100-500 placemarks
- Cesium viewer not re-rendered on state changes
- KML entities preserved separately from generated geometries
- Proper cleanup on component unmount

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires WebGL support for Cesium.

## License

Private project - Road infrastructure GIS tool
