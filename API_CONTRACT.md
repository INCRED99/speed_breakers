# API Contract - KML Processing Endpoint

## Overview

This document defines the contract for the backend API that processes KML files for road geometry generation.

## Endpoint Specification

### POST /process-kml

Accepts a KML file containing road points/placemarks and generates processed geometries (lines and polygons).

## Request

### Method
```
POST /process-kml
```

### Content-Type
```
multipart/form-data
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File (KML) | Yes | KML file containing placemarks with coordinates |
| `rectLength` | number | Yes | Rectangle/geometry length in meters (range: 1-100) |
| `rectWidth` | number | Yes | Rectangle/geometry width in meters (range: 0.5-50) |
| `stripCount` | number | Yes | Number of parallel strips to generate (range: 1-20) |

### Example Request (cURL)

```bash
curl -X POST http://localhost:3000/process-kml \
  -F "file=@road-points.kml" \
  -F "rectLength=10" \
  -F "rectWidth=2" \
  -F "stripCount=3"
```

### Example Request (JavaScript/Fetch)

```javascript
const formData = new FormData()
formData.append('file', kmlFile)
formData.append('rectLength', '10')
formData.append('rectWidth', '2')
formData.append('stripCount', '3')

const response = await fetch('/process-kml', {
  method: 'POST',
  body: formData
})

const blob = await response.blob()
```

### Example Request (Axios - as used in app)

```javascript
const form = new FormData()
form.append('file', file)
form.append('rectLength', String(rectLength))
form.append('rectWidth', String(rectWidth))
form.append('stripCount', String(stripCount))

const res = await axios.post('/process-kml', form, { responseType: 'blob' })
```

## Response

### Success Response (200 OK)

**Content-Type**: `application/vnd.google-earth.kml+xml`

**Body**: KML file (blob) containing:
1. **Original placemarks** - Preserved from input
2. **Generated lines** - Road-aligned polylines
3. **Generated polygons** - Rectangle geometries (speed breakers/markings)
4. **Snapped points** - Geometry reference points

### Expected KML Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Processed Road Geometry</name>
    
    <!-- Style definitions -->
    <Style id="lineStyle">
      <LineStyle>
        <color>ff0000ff</color>  <!-- ABGR: Blue for lines -->
        <width>3</width>
      </LineStyle>
    </Style>
    
    <Style id="polygonStyle">
      <PolyStyle>
        <color>4c00ffff</color>  <!-- Semi-transparent yellow -->
      </PolyStyle>
      <LineStyle>
        <color>ffff8800</color>  <!-- Orange outline -->
        <width>2</width>
      </LineStyle>
    </Style>
    
    <!-- Original placemarks -->
    <Folder>
      <name>Original Points</name>
      <Placemark>
        <name>Point 1</name>
        <Point>
          <coordinates>78.5,20.2,0</coordinates>
        </Point>
      </Placemark>
    </Folder>
    
    <!-- Generated lines -->
    <Folder>
      <name>Road Lines</name>
      <Placemark>
        <name>Road Line 1</name>
        <styleUrl>#lineStyle</styleUrl>
        <LineString>
          <coordinates>78.5,20.2,0 78.6,20.3,0</coordinates>
        </LineString>
      </Placemark>
    </Folder>
    
    <!-- Generated polygons -->
    <Folder>
      <name>Speed Breakers</name>
      <Placemark>
        <name>Speed Breaker 1</name>
        <styleUrl>#polygonStyle</styleUrl>
        <Polygon>
          <outerBoundaryIs>
            <LinearRing>
              <coordinates>
                78.5,20.2,0
                78.5,20.21,0
                78.6,20.31,0
                78.6,20.3,0
                78.5,20.2,0
              </coordinates>
            </LinearRing>
          </outerBoundaryIs>
        </Polygon>
      </Placemark>
    </Folder>
  </Document>
</kml>
```

### Error Response (400 Bad Request)

```json
{
  "error": "Invalid KML file",
  "message": "File must be valid KML with Point placemarks",
  "code": "INVALID_KML"
}
```

### Error Response (422 Unprocessable Entity)

```json
{
  "error": "Processing failed",
  "message": "Insufficient points in KML (minimum 2 required)",
  "code": "INSUFFICIENT_DATA"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "error": "Server error",
  "message": "Unexpected error during processing",
  "code": "INTERNAL_ERROR"
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success - KML blob returned |
| 400 | Bad request - Invalid file or parameters |
| 422 | Unprocessable entity - Validation failed |
| 500 | Internal server error |

## CORS Requirements

The endpoint must include proper CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

Or specific origin:
```
Access-Control-Allow-Origin: https://yourdomain.com
```

## Validation Rules

### File Validation
- Must be valid XML
- Must contain KML document
- Must have at least 2 placemarks with coordinates
- Coordinates must be in WGS84 format (lon, lat)

### Parameter Validation
- `rectLength`: 1 ≤ value ≤ 100 (meters)
- `rectWidth`: 0.5 ≤ value ≤ 50 (meters)
- `stripCount`: 1 ≤ value ≤ 20 (integer)

## Processing Algorithm

The backend should:

1. **Parse Input KML**
   - Extract all placemarks
   - Verify each has valid coordinates
   - Store in array with position index

2. **Generate Lines**
   - Connect consecutive points with polylines
   - Apply road-snapping algorithm (implementation-specific)
   - Return as KML LineString elements

3. **Generate Rectangles**
   - For each line segment, create `stripCount` parallel rectangles
   - Each rectangle: `rectLength × rectWidth`
   - Offset perpendicular to line direction
   - Return as KML Polygon elements

4. **Create Output KML**
   - Preserve original placemarks
   - Add generated lines with appropriate styles
   - Add generated polygons with appropriate styles
   - Return as KML blob

## Performance Expectations

| Input Size | Expected Response Time |
|------------|------------------------|
| 10 points | < 500ms |
| 100 points | < 2s |
| 500 points | < 10s |

## Color Conventions (ABGR Format in KML)

- Red lines: `ff0000ff` (BGR: 0000ff)
- Yellow polygons: `4c00ffff` (BGR: ffff00 with opacity)
- Orange outline: `ffff8800` (BGR: 0088ff)
- Blue points: `ffff0000` (BGR: 0000ff)

## Example Backend Implementation (Node.js Express)

```javascript
const express = require('express')
const multer = require('multer')
const app = express()

const upload = multer({ storage: multer.memoryStorage() })

app.post('/process-kml', upload.single('file'), async (req, res) => {
  try {
    const { rectLength, rectWidth, stripCount } = req.body
    const kmlBuffer = req.file.buffer

    // Parse KML
    const parser = new DOMParser()
    const doc = parser.parseFromString(kmlBuffer.toString(), 'application/xml')

    // Extract points
    const points = []
    const placemarks = doc.getElementsByTagName('Placemark')
    
    for (let pm of placemarks) {
      const point = pm.getElementsByTagName('Point')[0]
      if (point) {
        const coords = point.getElementsByTagName('coordinates')[0]
        if (coords) {
          const [lon, lat] = coords.textContent.split(',')
          points.push({ lon: parseFloat(lon), lat: parseFloat(lat) })
        }
      }
    }

    if (points.length < 2) {
      return res.status(422).json({
        error: 'Processing failed',
        message: 'Insufficient points (minimum 2 required)',
        code: 'INSUFFICIENT_DATA'
      })
    }

    // Generate geometries...
    const processedKML = generateProcessedKML(points, rectLength, rectWidth, stripCount)

    // Return KML blob
    res.setHeader('Content-Type', 'application/vnd.google-earth.kml+xml')
    res.setHeader('Content-Disposition', 'attachment; filename="processed.kml"')
    res.send(processedKML)

  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
      code: 'INTERNAL_ERROR'
    })
  }
})

app.listen(3000, () => console.log('Server running on port 3000'))
```

## Testing the Endpoint

### Using Postman

1. Create new POST request to `http://localhost:3000/process-kml`
2. Select "Body" → "form-data"
3. Add:
   - Key: `file`, Type: File, Value: (select KML file)
   - Key: `rectLength`, Type: text, Value: `10`
   - Key: `rectWidth`, Type: text, Value: `2`
   - Key: `stripCount`, Type: text, Value: `3`
4. Click "Send"
5. Should receive KML blob in response

### Using command line with sample file

```bash
# Create sample KML
cat > test.kml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark>
      <Point><coordinates>78.5,20.2,0</coordinates></Point>
    </Placemark>
    <Placemark>
      <Point><coordinates>78.6,20.3,0</coordinates></Point>
    </Placemark>
  </Document>
</kml>
EOF

# Test endpoint
curl -X POST http://localhost:3000/process-kml \
  -F "file=@test.kml" \
  -F "rectLength=10" \
  -F "rectWidth=2" \
  -F "stripCount=3" \
  --output processed.kml

# Verify output
file processed.kml
```

## Notes

- The frontend app expects the exact response as a blob - no JSON wrapping
- Content-Type MUST be `application/vnd.google-earth.kml+xml`
- Processing should be synchronous (wait for completion, don't queue)
- No file size limits specified - recommend: 5MB max for reasonable performance
- No timeout specified - recommend: 30s timeout for safety

---

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: Ready for Implementation
