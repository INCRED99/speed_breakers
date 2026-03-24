import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

export interface CesiumViewerHandle {
  viewer: Cesium.Viewer | null
  loadKML: (file: File) => Promise<void>
  addGeometries: (geometries: any) => void
  clearEntities: () => void
  zoomToExtent: () => void
}

export const CesiumViewer = forwardRef<CesiumViewerHandle>((_, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewerRef = useRef<Cesium.Viewer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const kmlDataSourceRef = useRef<Cesium.KmlDataSource | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let destroyed = false

    const init = () => {
      try {
        if (destroyed) return

        viewerRef.current = new Cesium.Viewer(containerRef.current as HTMLElement, {
          terrainProvider: new Cesium.EllipsoidTerrainProvider(),
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          homeButton: true,
          geocoder: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          scene3DOnly: true
        })

        // Use OpenStreetMap tiles (no Ion token required)
        viewerRef.current.imageryLayers.removeAll()
        viewerRef.current.imageryLayers.addImageryProvider(
          new Cesium.OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' })
        )

        // Focus camera on India
        viewerRef.current.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(78.9629, 20.5937, 3000000)
        })
      } catch (e: any) {
        console.error('Cesium initialization error:', e)
        setError(String(e?.message ?? e))
      }
    }

    init()

    return () => {
      destroyed = true
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy()
        } catch (e) {
          console.error('Error destroying viewer:', e)
        }
      }
    }
  }, [])

  useImperativeHandle(ref, () => ({
    viewer: viewerRef.current,
    loadKML: async (file: File) => {
      if (!viewerRef.current) throw new Error('Viewer not initialized')

      try {
        const text = await file.text()
        
        // Remove old KML data source if exists
        if (kmlDataSourceRef.current) {
          viewerRef.current.dataSources.remove(kmlDataSourceRef.current)
        }

        // Parse and load KML
        const dataSource = await Cesium.KmlDataSource.load(text, {
          camera: viewerRef.current.camera,
          canvas: viewerRef.current.canvas
        })

        viewerRef.current.dataSources.add(dataSource)
        kmlDataSourceRef.current = dataSource

        // Style the loaded entities
        dataSource.entities.values.forEach((entity) => {
          if (entity.point) {
            entity.point.pixelSize = new Cesium.ConstantProperty(8)
            entity.point.color = new Cesium.ConstantProperty(Cesium.Color.BLUE)
            entity.point.outlineColor = new Cesium.ConstantProperty(Cesium.Color.WHITE)
            entity.point.outlineWidth = new Cesium.ConstantProperty(2)
          }
        })

        // Zoom to extent
        await viewerRef.current.zoomTo(dataSource)
      } catch (e: any) {
        throw new Error(`Failed to load KML: ${e.message}`)
      }
    },
    addGeometries: (geometries: any) => {
      if (!viewerRef.current) return

      const { lines = [], polygons = [], points = [] } = geometries

      // Add lines (red)
      lines.forEach((line: any) => {
        viewerRef.current!.entities.add({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(line),
            width: 3,
            material: Cesium.Color.RED,
            clampToGround: true
          }
        })
      })

      // Add polygons (yellow transparent)
      polygons.forEach((polygon: any) => {
        viewerRef.current!.entities.add({
          polygon: {
            hierarchy: new Cesium.PolygonHierarchy(
              Cesium.Cartesian3.fromDegreesArray(polygon)
            ),
            material: Cesium.Color.YELLOW.withAlpha(0.5),
            outline: true,
            outlineColor: Cesium.Color.ORANGE
          }
        })
      })

      // Add points (green)
      points.forEach((point: any) => {
        viewerRef.current!.entities.add({
          position: Cesium.Cartesian3.fromDegrees(point[0], point[1]),
          point: {
            pixelSize: 6,
            color: Cesium.Color.LIME,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1
          }
        })
      })
    },
    clearEntities: () => {
      if (!viewerRef.current) return
      // Keep KML data source entities, remove only manually added geometries
      const entitiesToRemove = viewerRef.current.entities.values.filter(
        (e) => e.polyline || e.polygon || (e.point && !kmlDataSourceRef.current?.entities.contains(e))
      )
      entitiesToRemove.forEach((e) => viewerRef.current!.entities.remove(e))
    },
    zoomToExtent: () => {
      if (!viewerRef.current || !kmlDataSourceRef.current) return
      viewerRef.current.zoomTo(kmlDataSourceRef.current)
    }
  }))

  return (
    <div style={{ height: '100vh', position: 'relative' }} className="w-full">
      <div ref={containerRef} className="w-full h-full" />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 p-4">
          <div className="max-w-xl text-center">
            <h3 className="text-xl font-semibold text-red-600">Cesium failed to initialize</h3>
            <pre className="mt-2 text-sm text-gray-800 bg-gray-100 p-2 rounded">{error}</pre>
            <p className="mt-2 text-sm text-gray-600">Check browser console for details.</p>
          </div>
        </div>
      )}
    </div>
  )
})

CesiumViewer.displayName = 'CesiumViewer'
export default CesiumViewer
