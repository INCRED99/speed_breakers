import * as Cesium from 'cesium'

export interface GeometryData {
  lines: number[][]
  polygons: number[][]
  points: Array<{ lon: number; lat: number }>
}

export const MapLayersManager = {
  addLines: (viewer: Cesium.Viewer, coordinates: number[][], color = Cesium.Color.RED, width = 3) => {
    const positions = Cesium.Cartesian3.fromDegreesArray(coordinates.flat())
    viewer.entities.add({
      polyline: {
        positions,
        width,
        material: color,
        clampToGround: true
      }
    })
  },

  addPolygon: (viewer: Cesium.Viewer, coordinates: number[][], color = Cesium.Color.YELLOW, opacity = 0.5) => {
    const positions = Cesium.Cartesian3.fromDegreesArray(coordinates.flat())
    viewer.entities.add({
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(positions),
        material: color.withAlpha(opacity),
        outline: true,
        outlineColor: Cesium.Color.ORANGE
      }
    })
  },

  addPoint: (viewer: Cesium.Viewer, lon: number, lat: number, color = Cesium.Color.LIME) => {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat),
      point: {
        pixelSize: 6,
        color,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1
      }
    })
  },

  clearGeneratedEntities: (viewer: Cesium.Viewer) => {
    const entitiesToRemove: Cesium.Entity[] = []
    viewer.entities.values.forEach((entity) => {
      if (entity.polyline || entity.polygon) {
        entitiesToRemove.push(entity)
      }
    })
    entitiesToRemove.forEach((entity) => viewer.entities.remove(entity))
  }
}

export default MapLayersManager
