import React, { useRef } from 'react'
import CesiumViewer, { CesiumViewerHandle } from './components/CesiumViewer'
import ControlPanel from './components/ControlPanel'

export default function App() {
  const viewerRef = useRef<CesiumViewerHandle>(null)

  return (
    <div className="h-screen flex bg-gray-900">
      {/* Control Panel */}
      <div className="w-96 overflow-hidden flex flex-col bg-gray-50">
        <div className="flex-1 overflow-y-auto p-4">
          <ControlPanel viewerRef={viewerRef} />
        </div>
      </div>

      {/* Cesium Viewer */}
      <div className="flex-1">
        <CesiumViewer ref={viewerRef} />
      </div>
    </div>
  )
}
