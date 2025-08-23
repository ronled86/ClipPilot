import React from 'react'
import { useTranslation } from 'react-i18next'
import { getVersionString } from '../../version'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              📺 {t('about_modal.title')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              title={t('about_modal.close')}
            >
              ×
            </button>
          </div>

          {/* App Introduction */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">🚀 {t('about_modal.welcome.title')}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {t('about_modal.welcome.description')}
              </p>
            </div>
          </div>

          {/* Version Info */}
          <div className="mb-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">ℹ️ {t('about_modal.version_info.title')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('about_modal.version_info.version')}</span>
                  <span className="font-mono text-gray-800">{getVersionString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('about_modal.version_info.platform')}</span>
                  <span className="font-mono text-gray-800">{navigator.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('about_modal.version_info.user_agent')}</span>
                  <span className="font-mono text-xs text-gray-600 truncate max-w-xs" title={navigator.userAgent}>
                    {navigator.userAgent.substring(0, 60)}...
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mb-6">
            <div className="border rounded-lg p-4 bg-yellow-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">⌨️ {t('about_modal.shortcuts.title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t('about_modal.shortcuts.developer_tools')}</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F12</kbd>
                    <span className="text-gray-400">{t('about_modal.shortcuts.or')}</span>
                    <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl+Shift+I</kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t('about_modal.shortcuts.toggle_menu')}</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Alt+M</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t('about_modal.shortcuts.settings')}</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl+,</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t('about_modal.shortcuts.about')}</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F1</kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <div className="border rounded-lg p-4 bg-green-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">✨ {t('about_modal.features.title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">{t('about_modal.features.youtube_search')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">{t('about_modal.features.direct_url')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">{t('about_modal.features.multiple_formats')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">{t('about_modal.features.quality_selection')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">{t('about_modal.features.progress_tracking')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">{t('about_modal.features.video_previews')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Open Source Licenses */}
          <div className="mb-6">
            <div className="border rounded-lg p-4 bg-purple-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📜 {t('about_modal.licenses.title')}</h3>
              <p className="text-xs text-gray-600 mb-3">{t('about_modal.licenses.description')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-2">
                  <div>
                    <strong className="text-gray-800">Electron</strong>
                    <span className="text-gray-600"> - MIT License</span>
                    <p className="text-gray-500">{t('about_modal.licenses.electron_desc')}</p>
                  </div>
                  <div>
                    <strong className="text-gray-800">React</strong>
                    <span className="text-gray-600"> - MIT License</span>
                    <p className="text-gray-500">{t('about_modal.licenses.react_desc')}</p>
                  </div>
                  <div>
                    <strong className="text-gray-800">TypeScript</strong>
                    <span className="text-gray-600"> - Apache 2.0</span>
                    <p className="text-gray-500">{t('about_modal.licenses.typescript_desc')}</p>
                  </div>
                  <div>
                    <strong className="text-gray-800">Tailwind CSS</strong>
                    <span className="text-gray-600"> - MIT License</span>
                    <p className="text-gray-500">{t('about_modal.licenses.tailwind_desc')}</p>
                  </div>
                  <div>
                    <strong className="text-gray-800">Vite</strong>
                    <span className="text-gray-600"> - MIT License</span>
                    <p className="text-gray-500">{t('about_modal.licenses.vite_desc')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <strong className="text-gray-800">Google APIs</strong>
                    <span className="text-gray-600"> - Apache 2.0</span>
                    <p className="text-gray-500">{t('about_modal.licenses.google_apis_desc')}</p>
                  </div>
                  <div>
                    <strong className="text-gray-800">react-i18next</strong>
                    <span className="text-gray-600"> - MIT License</span>
                    <p className="text-gray-500">{t('about_modal.licenses.react_i18next_desc')}</p>
                  </div>
                  <div>
                    <strong className="text-gray-800">yt-dlp</strong>
                    <span className="text-gray-600"> - Unlicense</span>
                    <p className="text-gray-500">{t('about_modal.licenses.yt_dlp_desc')}</p>
                  </div>
                  <div>
                    <strong className="text-gray-800">FFmpeg</strong>
                    <span className="text-gray-600"> - LGPL/GPL</span>
                    <p className="text-gray-500">{t('about_modal.licenses.ffmpeg_desc')}</p>
                  </div>
                  <div>
                    <strong className="text-gray-800">Node.js</strong>
                    <span className="text-gray-600"> - MIT License</span>
                    <p className="text-gray-500">{t('about_modal.licenses.nodejs_desc')}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-purple-200">
                <p className="text-xs text-gray-600">
                  <strong>{t('about_modal.licenses.clippailot_license')}</strong> Apache 2.0 - 
                  <a href="https://github.com/ronled86/ClipPAilot" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 underline ml-1">
                    {t('about_modal.licenses.view_source')}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t pt-4">
            <p>{t('about_modal.footer.built_with')}</p>
            <p className="mt-1">{t('about_modal.footer.support')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
