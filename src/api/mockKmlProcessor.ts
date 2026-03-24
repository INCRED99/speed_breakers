/**
 * Mock KML Processor for development
 * Replace with actual backend endpoint in production
 */

export async function mockProcessKML(
  file: File,
  rectLength: number,
  rectWidth: number,
  stripCount: number
): Promise<Blob> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Parse the uploaded KML to extract coordinates
  const kmlText = await file.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(kmlText, 'application/xml')

  // Extract placemarks
  const placemarks = doc.getElementsByTagName('Placemark')
  const coordinates: Array<{ name: string; lat: number; lon: number }> = []

  Array.from(placemarks).forEach((placemark) => {
    const pointEl = placemark.getElementsByTagName('Point')[0]
    if (pointEl) {
      const coordEl = pointEl.getElementsByTagName('coordinates')[0]
      if (coordEl) {
        const [lon, lat] = coordEl.textContent?.split(',') || []
        const nameEl = placemark.getElementsByTagName('name')[0]
        const name = nameEl?.textContent || 'Point'

        if (lon && lat) {
          coordinates.push({
            name,
            lat: parseFloat(lat),
            lon: parseFloat(lon)
          })
        }
      }
    }
  })

  // Generate KML output with processed geometries
  const processedKML = generateProcessedKML(coordinates, rectLength, rectWidth, stripCount)

  return new Blob([processedKML], { type: 'application/vnd.google-earth.kml+xml' })
}

function generateProcessedKML(
  points: Array<{ name: string; lat: number; lon: number }>,
  rectLength: number,
  rectWidth: number,
  stripCount: number
): string {
  const lines: string[] = []
  const polygons: string[] = []

  // Generate lines connecting points
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]

    // Create a line
    const lineCoords = `${p1.lon},${p1.lat},0 ${p2.lon},${p2.lat},0`
    lines.push(`
      <Placemark>
        <name>Road Line ${i + 1}</name>
        <LineString>
          <coordinates>${lineCoords}</coordinates>
        </LineString>
      </Placemark>
    `)

    // Generate parallel strips
    for (let strip = 0; strip < stripCount; strip++) {
      const offset = (strip - stripCount / 2) * (rectWidth / stripCount)
      
      // Simple offset (in real implementation, use proper geo calculations)
      const latOffset = offset / 111000 // 1 degree ≈ 111km
      
      const rect1Lat = p1.lat + latOffset
      const rect2Lat = p1.lat + latOffset + rectLength / 111000
      const rect3Lat = p2.lat + latOffset + rectLength / 111000
      const rect4Lat = p2.lat + latOffset

      const polyCoords = `
        ${p1.lon},${rect1Lat},0
        ${p1.lon},${rect2Lat},0
        ${p2.lon},${rect3Lat},0
        ${p2.lon},${rect4Lat},0
        ${p1.lon},${rect1Lat},0
      `

      polygons.push(`
        <Placemark>
          <name>Speed Breaker ${i + 1}-${strip + 1}</name>
          <Polygon>
            <outerBoundaryIs>
              <LinearRing>
                <coordinates>${polyCoords}</coordinates>
              </LinearRing>
            </outerBoundaryIs>
          </Polygon>
        </Placemark>
      `)
    }
  }

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Processed Road Geometry</name>
    <description>Generated from KML processor</description>
    
    <Style id="lineStyle">
      <LineStyle>
        <color>ff0000ff</color>
        <width>3</width>
      </LineStyle>
    </Style>
    
    <Style id="polygonStyle">
      <PolyStyle>
        <color>4c00ffff</color>
        <fill>1</fill>
        <outline>1</outline>
      </PolyStyle>
      <LineStyle>
        <color>ffff8800</color>
        <width>2</width>
      </LineStyle>
    </Style>

    <Folder>
      <name>Road Lines</name>
      ${lines.join('\n')}
    </Folder>

    <Folder>
      <name>Speed Breakers</name>
      ${polygons.join('\n')}
    </Folder>
  </Document>
</kml>`

  return kml
}
