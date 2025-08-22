import React, { useState, useEffect } from 'react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: DownloadSettings) => void
  currentSettings: DownloadSettings
}

export interface DownloadSettings {
  downloadFolder: string
  defaultFormat: 'mp3' | 'mp4'
  defaultQuality: string
  audioFormat: string
  audioBitrate: string
  videoFormat: string
  videoQuality: string
  videoCodec: string
  // API Settings
  youtubeApiKey?: string
  enableEnhancedSearch?: boolean
}

export default function SettingsModal({ isOpen, onClose, onSave, currentSettings }: SettingsModalProps) {
  const [settings, setSettings] = useState<DownloadSettings>(currentSettings)

  useEffect(() => {
    setSettings(currentSettings)
  }, [currentSettings])

  const handleSave = () => {
    onSave(settings)
    onClose()
  }

  const handleSelectFolder = async () => {
    // Check if we're in browser mode
    if (!window.clippilot) {
      // Browser mode - show a helpful message
      alert('🌐 Browser Mode: Folder selection is only available in the desktop app. Downloads would typically go to your default Downloads folder.')
      return
    }
    
    try {
      const result = await window.clippilot.selectFolder()
      if (result.success && result.path) {
        setSettings(prev => ({ ...prev, downloadFolder: result.path }))
      }
    } catch (error) {
      console.error('Failed to select folder:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-[900px] max-w-[95vw] max-h-[95vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold">Download Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
          {/* Download Folder - Top Section */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              📁 Download Folder
            </label>
            {!window.clippilot && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                🌐 <strong>Browser Mode:</strong> Folder selection requires the desktop app. Downloads would use your browser's default download location.
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={window.clippilot ? settings.downloadFolder : 'Browser default downloads folder'}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                placeholder="Choose download folder..."
              />
              <button
                onClick={handleSelectFolder}
                className={`px-4 py-2 rounded-md transition-colors ${
                  window.clippilot 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed hover:bg-gray-300'
                }`}
                title={window.clippilot ? 'Browse for folder' : 'Only available in desktop app'}
              >
                Browse
              </button>
            </div>
          </div>

          {/* Audio and Video Settings - Side by Side */}
          <div className="grid grid-cols-2 gap-6">
            {/* Audio Settings */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🎵 Audio Download Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio Format
                  </label>
                  <select
                    value={settings.audioFormat}
                    onChange={(e) => setSettings(prev => ({ ...prev, audioFormat: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="mp3">MP3 (Most Compatible)</option>
                    <option value="aac">AAC (High Quality, Small Size)</option>
                    <option value="flac">FLAC (Lossless, Large Size)</option>
                    <option value="wav">WAV (Uncompressed, Huge Size)</option>
                    <option value="ogg">OGG (Open Source)</option>
                    <option value="m4a">M4A (Apple Devices)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio Bitrate
                  </label>
                  <select
                    value={settings.audioBitrate}
                    onChange={(e) => setSettings(prev => ({ ...prev, audioBitrate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="96k">96 kbps (Low Quality, Small File)</option>
                    <option value="128k">128 kbps (Standard Quality)</option>
                    <option value="192k">192 kbps (High Quality) ⭐</option>
                    <option value="256k">256 kbps (Very High Quality)</option>
                    <option value="320k">320 kbps (Maximum Quality)</option>
                    <option value="best">Best Available</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Video Settings */}
            <div className="border rounded-lg p-4 bg-green-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🎥 Video Download Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Format
                  </label>
                  <select
                    value={settings.videoFormat}
                    onChange={(e) => setSettings(prev => ({ ...prev, videoFormat: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="mp4">MP4 (Most Compatible) ⭐</option>
                    <option value="webm">WebM (Modern, Smaller)</option>
                    <option value="mkv">MKV (High Quality)</option>
                    <option value="avi">AVI (Classic)</option>
                    <option value="mov">MOV (Apple QuickTime)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Quality
                  </label>
                  <select
                    value={settings.videoQuality}
                    onChange={(e) => setSettings(prev => ({ ...prev, videoQuality: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="360p">360p (Mobile, Small File)</option>
                    <option value="480p">480p (SD, Moderate File)</option>
                    <option value="720p">720p (HD, Good Quality) ⭐</option>
                    <option value="1080p">1080p (Full HD, High Quality)</option>
                    <option value="1440p">1440p (2K, Very High Quality)</option>
                    <option value="2160p">2160p (4K, Maximum Quality)</option>
                    <option value="best">Best Available</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Codec
                  </label>
                  <select
                    value={settings.videoCodec}
                    onChange={(e) => setSettings(prev => ({ ...prev, videoCodec: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="h264">H.264 (Most Compatible) ⭐</option>
                    <option value="h265">H.265 (Smaller Files)</option>
                    <option value="vp9">VP9 (Google, WebM)</option>
                    <option value="av1">AV1 (Next-Gen, New)</option>
                    <option value="best">Best Available</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* API Settings Section */}
          <div className="border rounded-lg p-4 bg-purple-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔑 API Configuration (Optional)</h3>
            
            <div className="space-y-4">
              {!window.clippilot && (
                <div className="bg-orange-100 border border-orange-300 rounded-md p-3 text-sm">
                  <p className="font-medium text-orange-800 mb-2">🌐 Browser Mode:</p>
                  <p className="text-orange-700 text-xs">API configuration works in browser mode but actual downloads require the desktop app.</p>
                </div>
              )}
              <div className="bg-blue-100 border border-blue-300 rounded-md p-3 text-sm">
                <p className="font-medium text-blue-800 mb-2">ℹ️ How it works:</p>
                <ul className="text-blue-700 space-y-1 text-xs list-disc list-inside">
                  <li><strong>Without API Key:</strong> Basic YouTube search works perfectly (free)</li>
                  <li><strong>With API Key:</strong> Enhanced search results and better performance</li>
                  <li><strong>Privacy:</strong> API key is stored locally on your computer only</li>
                </ul>
              </div>

              <div>
                <label className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    checked={settings.enableEnhancedSearch || false}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      enableEnhancedSearch: e.target.checked 
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Enable Enhanced Search (Optional)
                  </span>
                </label>
              </div>

              {settings.enableEnhancedSearch && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube Data API v3 Key
                    </label>
                    <input
                      type="password"
                      value={settings.youtubeApiKey || ''}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        youtubeApiKey: e.target.value 
                      }))}
                      placeholder="AIzaSyD..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="bg-yellow-100 border border-yellow-300 rounded-md p-3 text-xs">
                    <p className="font-medium text-yellow-800 mb-2">📋 How to get a free API key:</p>
                    <ol className="text-yellow-700 space-y-1 list-decimal list-inside">
                      <li>Go to <a href="https://console.developers.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
                      <li>Create a new project or select existing one</li>
                      <li>Enable "YouTube Data API v3"</li>
                      <li>Create credentials → API Key</li>
                      <li>Copy the key and paste it above</li>
                    </ol>
                    <p className="mt-2 text-yellow-600">
                      <strong>Free tier:</strong> 10,000 requests/day (more than enough for personal use)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-end gap-2 p-6 border-t border-gray-200 flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save Settings
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}