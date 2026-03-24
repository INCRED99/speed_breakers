import React, { useRef } from 'react'

type Props = {
  onFile: (file: File) => void
  fileName?: string | null
  loading?: boolean
}

export default function KMLUploader({ onFile, fileName, loading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const f = e.dataTransfer.files[0]
    if (f && f.name.endsWith('.kml')) {
      onFile(f)
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && f.name.endsWith('.kml')) {
      onFile(f)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">Upload KML File</label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center px-6 py-8 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
      >
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-blue-500 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-6-12l-6-6m0 0l-6 6m6-6v18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {fileName ? (
            <p className="text-sm text-green-700 font-medium">{fileName}</p>
          ) : (
            <>
              <p className="text-sm text-gray-600">Drag and drop your KML file here</p>
              <p className="text-xs text-gray-500 mt-1">or click to browse</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".kml"
          onChange={handleFile}
          disabled={loading}
          className="hidden"
        />
      </div>
    </div>
  )
}
