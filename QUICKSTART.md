# Quick Start Guide

Get the Cesium KML Road Geometry Tool running in 5 minutes.

## Prerequisites

- Node.js 16+ and npm/pnpm
- Modern web browser with WebGL support
- KML file with point data (for testing)

## Installation & Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 3. Test with Sample KML

Use this sample KML file to test:

**Save as `test.kml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Test Road Points</name>
    <Placemark>
      <name>Point 1</name>
      <Point>
        <coordinates>78.5,20.2,0</coordinates>
      </Point>
    </Placemark>
    <Placemark>
      <name>Point 2</name>
      <Point>
        <coordinates>78.55,20.25,0</coordinates>
      </Point>
    </Placemark>
    <Placemark>
      <name>Point 3</name>
      <Point>
        <coordinates>78.6,20.3,0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>
```

### 4. Upload & Process

1. **Drag & drop** `test.kml` onto the upload area (or click to browse)
2. See blue points appear on the Cesium map
3. Adjust parameters if desired:
   - Rectangle Length: 10m (default)
   - Rectangle Width: 2m (default)
   - Strip Count: 3 (default)
4. Click **"Generate Road Geometry"** button
5. Watch for loading spinner
6. See red lines and yellow polygons appear
7. Click **"Download Processed KML"** to save results

## What You're Looking At

### Left Panel (Control Panel)
- File upload area (blue dotted box)
- Current filename display
- Parameter sliders/inputs
- Generate button (blue-purple gradient)
- Download button (green gradient)
- Error/success messages

### Right Panel (Cesium Viewer)
- 3D interactive globe
- Default view: India
- Blue points = uploaded placemarks
- Red lines = processed road geometries
- Yellow polygons = generated rectangles

## Keyboard Controls (Cesium)

- **Left mouse drag**: Rotate
- **Right mouse drag** or **Mouse wheel**: Zoom
- **Middle mouse drag**: Pan
- **Scroll wheel**: Zoom in/out

## Features Working Out of the Box

✅ KML file upload with drag-drop  
✅ Automatic placemark visualization  
✅ 3D globe with terrain  
✅ Parameter configuration  
✅ Mock API processing (generates synthetic geometries)  
✅ Results visualization  
✅ File download  

## Production Setup

### Connect to Real Backend

1. Update API endpoint in `src/components/ControlPanel.tsx`:
   ```typescript
   const res = await axios.post('https://your-api.com/process-kml', form, { 
     responseType: 'blob' 
   })
   ```

2. Ensure backend implements `/process-kml` endpoint
3. See `API_CONTRACT.md` for exact specifications

### Build for Production

```bash
npm run build
```

Outputs optimized app to `dist/` folder.

Deploy to:
- Vercel (recommended)
- Netlify  
- Traditional hosting
- Docker container

## Troubleshooting

### Map not showing?
- Check browser console (F12)
- Verify WebGL support: https://get.webgl.org/
- Try different browser
- Clear cache and reload

### KML not loading?
- Verify file is valid KML format
- Check file has `<Point>` elements with `<coordinates>`
- Ensure coordinates are in format: `lon,lat,elevation`

### API processing not working?
- Backend must be running and accessible
- Verify endpoint: POST `/process-kml`
- Check CORS headers from backend
- Monitor network tab in DevTools

## Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── App.tsx
│   │   ├── CesiumViewer.tsx       # 3D globe
│   │   ├── ControlPanel.tsx       # Controls
│   │   ├── KMLUploader.tsx        # Upload
│   │   ├── DownloadButton.tsx     # Download
│   │   └── MapLayers.tsx          # Utilities
│   ├── api/
│   │   └── mockKmlProcessor.ts    # Mock backend
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Next Steps

1. **Test with your own KML files**
   - Real road data
   - Different coordinate ranges
   - Larger datasets (50-500 points)

2. **Customize styling**
   - Change colors in `MapLayers.tsx`
   - Adjust layout in `App.tsx`
   - Modify button styles in components

3. **Connect real backend**
   - Implement `/process-kml` endpoint
   - Test with actual geometry processing
   - Deploy both frontend and backend

4. **Add features**
   - Measurement tools
   - Export formats (GeoJSON, ShapeFile)
   - Batch processing
   - Real-time collaboration

## Learn More

- **Full Architecture**: See `IMPLEMENTATION_GUIDE.md`
- **API Specification**: See `API_CONTRACT.md`
- **All Features**: See `README.md`
- **Project Status**: See `COMPLETION_SUMMARY.md`

## Support

Check browser console (F12) for detailed error messages.

Common console messages:
- "KML loaded successfully" ✅ Upload worked
- "Failed to load KML" ❌ Invalid KML file
- "Road geometry generated" ✅ API processing worked
- Network error ❌ Backend not responding

---

**Ready to go!** 🚀

Start with `npm install && npm run dev` and drag a KML file onto the app.

For detailed information, see the documentation files included in the project.
