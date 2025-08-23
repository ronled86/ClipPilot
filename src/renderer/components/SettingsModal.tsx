import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNotifications } from './NotificationSystem'

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
  // UI Settings
  language?: string
}

export default function SettingsModal({ isOpen, onClose, onSave, currentSettings }: SettingsModalProps) {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<DownloadSettings>(currentSettings)
  const [showApiKey, setShowApiKey] = useState(false)
  const { showWarning } = useNotifications()

  useEffect(() => {
    setSettings(currentSettings)
  }, [currentSettings])

  const handleSave = () => {
    onSave(settings)
    onClose()
  }

  const handleSelectFolder = async () => {
    // Check if we're in browser mode
    if (!window.clippailot) {
      // Browser mode - show a helpful message
      showWarning(
        'Browser Mode Limitation',
        'Folder selection is only available in the desktop app. Downloads would typically go to your default Downloads folder.',
        6000
      )
      return
    }
    
    try {
      const result = await window.clippailot.selectFolder()
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
          <h2 className="text-xl font-bold">{t('settings_modal.title')}</h2>
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
              📁 {t('settings_modal.download_folder.label')}
            </label>
            {!window.clippailot && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                🌐 <strong>{t('settings_modal.download_folder.browser_warning')}</strong>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={window.clippailot ? settings.downloadFolder : 'Browser default downloads folder'}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                placeholder="Choose download folder..."
              />
              <button
                onClick={handleSelectFolder}
                className={`px-4 py-2 rounded-md transition-colors ${
                  window.clippailot 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed hover:bg-gray-300'
                }`}
                title={window.clippailot ? t('common.browse') : 'Only available in desktop app'}
              >
                {t('common.browse')}
              </button>
            </div>
          </div>

          {/* Audio and Video Settings - Side by Side */}
          <div className="grid grid-cols-2 gap-6">
            {/* Audio Settings */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🎵 {t('settings_modal.audio_settings.title')}</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="audio-format" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings_modal.audio_settings.format')}
                  </label>
                  <select
                    id="audio-format"
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
                  <label htmlFor="audio-bitrate" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings_modal.audio_settings.bitrate')}
                  </label>
                  <select
                    id="audio-bitrate"
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🎥 {t('settings_modal.video_settings.title')}</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="video-format" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings_modal.video_settings.format')}
                  </label>
                  <select
                    id="video-format"
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
                  <label htmlFor="video-quality" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings_modal.video_settings.quality')}
                  </label>
                  <select
                    id="video-quality"
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
                  <label htmlFor="video-codec" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings_modal.video_settings.codec')}
                  </label>
                  <select
                    id="video-codec"
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔑 {t('settings_modal.api_settings.title')}</h3>
            
            <div className="space-y-4">
              {!window.clippailot && (
                <div className="bg-orange-100 border border-orange-300 rounded-md p-3 text-sm">
                  <p className="font-medium text-orange-800 mb-2">🌐 Browser Mode:</p>
                  <p className="text-orange-700 text-xs">API configuration works in browser mode but actual downloads require the desktop app.</p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label htmlFor="youtube-api-key" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings_modal.api_settings.youtube_api_key')}
                  </label>
                  <div className="relative">
                    <input
                      id="youtube-api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.youtubeApiKey || ''}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        youtubeApiKey: e.target.value 
                      }))}
                      placeholder="Enter your YouTube Data API v3 key..."
                      className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      title={showApiKey ? 'Hide API key' : 'Show API key'}
                    >
                      {showApiKey ? (
                        // Eye slash icon (hide)
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L9.878 9.878m4.242 4.242L8.464 8.464m5.656 5.656l1.415 1.415m1.415-1.415l-1.415-1.415m-1.415 1.415l1.415 1.415" />
                        </svg>
                      ) : (
                        // Eye icon (show)
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-300 rounded-md p-3 text-xs">
                  <p className="font-medium text-blue-800 mb-2">📋 {t('settings_modal.api_settings.instructions.title')}</p>
                  <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                    <li>{t('settings_modal.api_settings.instructions.step1')} <a href="https://console.developers.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
                    <li>{t('settings_modal.api_settings.instructions.step2')}</li>
                    <li>{t('settings_modal.api_settings.instructions.step3')}</li>
                    <li>{t('settings_modal.api_settings.instructions.step4')}</li>
                  </ol>
                  <p className="text-blue-700 mt-2 text-xs">
                    <strong>{t('settings_modal.api_settings.instructions.free_note')}</strong> • <strong>{t('settings_modal.api_settings.instructions.private_note')}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-end gap-2 p-6 border-t border-gray-200 flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {t('settings_modal.save_settings')}
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}