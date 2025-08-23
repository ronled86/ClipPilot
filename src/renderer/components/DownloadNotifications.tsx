import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export interface DownloadJob {
  id: string
  title: string
  format: 'mp3' | 'mp4'
  actualFormat?: string // The actual format name like "AAC", "FLAC", "WebM", etc.
  status: 'preparing' | 'extracting' | 'downloading' | 'converting' | 'finalizing' | 'completed' | 'failed' | 'cancelled'
  progress?: number // Progress within the current stage (0-100)
  stageProgress?: number // Overall stage completion (0-100)
  outputPath?: string
  error?: string
  startTime: number
  message?: string // Detailed status message
}

interface DownloadNotificationsProps {
  downloads: DownloadJob[]
  onDismiss: (jobId: string) => void
  onCancel?: (jobId: string) => void
}

const getStatusMessage = (status: string, t: any) => {
  switch (status) {
    case 'preparing': return t('download_progress.preparing')
    case 'extracting': return t('download_progress.extracting')
    case 'downloading': return t('download_progress.downloading')
    case 'converting': return t('download_progress.converting')
    case 'finalizing': return t('download_progress.finalizing')
    default: return t('download_progress.preparing')
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'preparing': return '⚙️'
    case 'extracting': return '🔍'
    case 'downloading': return '⬇️'
    case 'converting': return '🔄'
    case 'finalizing': return '✨'
    case 'completed': return '✅'
    case 'failed': return '❌'
    case 'cancelled': return '🚫'
    default: return '📦'
  }
}

export default function DownloadNotifications({ downloads, onDismiss, onCancel }: DownloadNotificationsProps) {
  const { t } = useTranslation()
  
  if (downloads.length === 0) return null

  const ProgressBar = ({ progress }: { progress: number }) => {
    const barRef = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
      if (barRef.current) {
        barRef.current.style.width = `${progress}%`
      }
    }, [progress])

    return (
      <div className="w-full bg-gray-200 rounded-full h-1.5 relative overflow-hidden">
        <div 
          ref={barRef}
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 absolute left-0 top-0"
        />
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-w-sm z-50 space-y-2">
      {downloads.map(download => (
        <div
          key={download.id}
          className={`bg-white border rounded-lg shadow-lg p-4 transition-all duration-300 ${
            download.status === 'completed' ? 'border-green-200 bg-green-50' :
            download.status === 'failed' ? 'border-red-200 bg-red-50' :
            download.status === 'cancelled' ? 'border-gray-200 bg-gray-50' :
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
                  download.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {(download.actualFormat || download.format).toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(download.startTime).toLocaleTimeString()}
                </span>
              </div>
              
              <h4 className="text-sm font-medium text-gray-900 truncate" title={download.title}>
                {download.title}
              </h4>
              
              {(['preparing', 'extracting', 'downloading', 'converting', 'finalizing'].includes(download.status)) && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span className="flex items-center gap-1">
                      <span>{getStatusIcon(download.status)}</span>
                      <span>{download.message || getStatusMessage(download.status, t)}</span>
                    </span>
                    {download.progress !== undefined && <span>{Math.round(download.progress)}%</span>}
                  </div>
                  <ProgressBar progress={download.progress || 0} />
                  {onCancel && (
                    <button
                      onClick={() => onCancel(download.id)}
                      className="mt-2 w-full text-xs bg-red-100 hover:bg-red-200 text-red-700 py-1 px-2 rounded"
                    >
                      ❌ {t('download_progress.cancel_button')}
                    </button>
                  )}
                </div>
              )}
              
              {download.status === 'completed' && (
                <div className="mt-1">
                  <p className="text-xs text-green-600">✅ {t('download_progress.completed')}</p>
                  {download.outputPath && (
                    <p className="text-xs text-gray-500 truncate" title={download.outputPath}>
                      📁 {download.outputPath.split('\\').pop()}
                    </p>
                  )}
                </div>
              )}
              
              {download.status === 'failed' && (
                <div className="mt-1">
                  <p className="text-xs text-red-600">❌ {t('download_progress.failed')}</p>
                  {download.error && (
                    <p className="text-xs text-gray-500 truncate" title={download.error}>
                      {download.error}
                    </p>
                  )}
                </div>
              )}

              {download.status === 'cancelled' && (
                <div className="mt-1">
                  <p className="text-xs text-gray-600">🚫 {t('download_progress.cancelled')}</p>
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
                if (window.clippailot?.openFolder && download.outputPath) {
                  window.clippailot.openFolder(download.outputPath)
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
