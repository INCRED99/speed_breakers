import React, { useState } from 'react'
import KMLUploader from './KMLUploader'
import DownloadButton from './DownloadButton'
import { CesiumViewerHandle } from './CesiumViewer'
import { mockProcessKML } from '../api/mockKmlProcessor'

type Props = {
  viewerRef: React.RefObject<CesiumViewerHandle>
}

export default function ControlPanel({ viewerRef }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [processedData, setProcessedData] = useState<Blob | null>(null)

  const [rectLength, setRectLength] = useState(10)
  const [rectWidth, setRectWidth] = useState(2)
  const [stripCount, setStripCount] = useState(3)

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile)
    setFileName(selectedFile.name)
    setError(null)
    setSuccess(null)
    setProcessedData(null)

    // Load KML into viewer
    setLoading(true)
    try {
      if (viewerRef.current?.loadKML) {
        await viewerRef.current.loadKML(selectedFile)
        setSuccess('KML loaded successfully')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load KML')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!file) return
    
    setProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const blob = await mockProcessKML(file, rectLength, rectWidth, stripCount)
      setProcessedData(blob)
      setSuccess('Road geometry generated successfully')

      // Demo: Add sample geometries to map
      if (viewerRef.current?.addGeometries) {
        viewerRef.current.addGeometries({
          lines: [],
          polygons: [],
          points: []
        })
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to process KML')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Road Geometry</h1>
        <p className="text-sm text-gray-600 mt-1">KML Processing Tool</p>
      </div>

      {/* Upload Section */}
      <div className="space-y-4">
        <KMLUploader 
          onFile={handleFileSelect} 
          fileName={fileName}
          loading={loading}
        />
      </div>

      {/* Parameters Section */}
      {file && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700">Processing Parameters</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rectangle Length (m)
            </label>
            <input
              type="number"
              value={rectLength}
              onChange={(e) => setRectLength(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={1}
              max={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rectangle Width (m)
            </label>
            <input
              type="number"
              value={rectWidth}
              onChange={(e) => setRectWidth(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={0.5}
              max={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strip Count
            </label>
            <input
              type="number"
              value={stripCount}
              onChange={(e) => setStripCount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={1}
              max={20}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 border border-green-400 rounded-md">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleGenerate}
          disabled={!file || loading || processing}
          className="w-full py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Generate Road Geometry'
          )}
        </button>

        <DownloadButton 
          data={processedData}
          disabled={!processedData}
        />
      </div>
    </div>
  )
}
