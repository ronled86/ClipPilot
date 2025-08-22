import React from 'react'

export interface DownloadJob {
  id: string
  title: string
  format: 'mp3' | 'mp4'
  actualFormat?: string // The actual format name like "AAC", "FLAC", "WebM", etc.
  status: 'downloading' | 'completed' | 'failed'
  progress?: number
  outputPath?: string
  error?: string
  startTime: number
}

interface DownloadNotificationsProps {
  downloads: DownloadJob[]
  onDismiss: (jobId: string) => void
}

export default function DownloadNotifications({ downloads, onDismiss }: DownloadNotificationsProps) {
  if (downloads.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 w-80 max-w-sm z-50 space-y-2">
      {downloads.map(download => (
        <div
          key={download.id}
          className={`bg-white border rounded-lg shadow-lg p-4 transition-all duration-300 ${
            download.status === 'completed' ? 'border-green-200 bg-green-50' :
            download.status === 'failed' ? 'border-red-200 bg-red-50' :
            'border-blue-200 bg-blue-50'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {download.format === 'mp3' ? '🎵' : '🎥'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  download.status === 'completed' ? 'bg-green-100 text-green-700' :
                  download.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {(download.actualFormat || download.format).toUpperCase()}
                </span>
              </div>
              
              <h4 className="text-sm font-medium text-gray-900 truncate" title={download.title}>
                {download.title}
              </h4>
              
              {download.status === 'downloading' && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Downloading...</span>
                    {download.progress && <span>{Math.round(download.progress)}%</span>}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${download.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}
              
              {download.status === 'completed' && (
                <div className="mt-1">
                  <p className="text-xs text-green-600">✅ Download completed!</p>
                  {download.outputPath && (
                    <p className="text-xs text-gray-500 truncate" title={download.outputPath}>
                      📁 {download.outputPath.split('\\').pop()}
                    </p>
                  )}
                </div>
              )}
              
              {download.status === 'failed' && (
                <div className="mt-1">
                  <p className="text-xs text-red-600">❌ Download failed</p>
                  {download.error && (
                    <p className="text-xs text-gray-500 truncate" title={download.error}>
                      {download.error}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <button
              onClick={() => onDismiss(download.id)}
              className="text-gray-400 hover:text-gray-600 text-sm p-1"
              title="Dismiss"
            >
              ×
            </button>
          </div>
          
          {download.status === 'completed' && download.outputPath && (
            <button
              onClick={() => {
                // Open file location (we'll implement this)
                if (window.clippilot?.openFolder && download.outputPath) {
                  window.clippilot.openFolder(download.outputPath)
                }
              }}
              className="mt-2 w-full text-xs bg-green-100 hover:bg-green-200 text-green-700 py-1 px-2 rounded"
            >
              📂 Open Folder
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
