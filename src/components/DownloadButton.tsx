import React from 'react'

interface DownloadButtonProps {
  data: Blob | null
  disabled?: boolean
}

export default function DownloadButton({ data, disabled }: DownloadButtonProps) {
  const handleDownload = () => {
    if (!data) return
    const url = window.URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = `processed-${new Date().getTime()}.kml`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleDownload}
      disabled={disabled || !data}
      className="w-full py-2 rounded-md bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Download Processed KML
    </button>
  )
}
