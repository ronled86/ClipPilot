import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import AnimatedLogo from './components/AnimatedLogo'
import SearchBar from './components/SearchBar'
import VideoPreviewModal from './components/VideoPreviewModal'
import SettingsModal, { DownloadSettings } from './components/SettingsModal'
import DownloadNotifications, { DownloadJob } from './components/DownloadNotifications'
import { getVersionString } from '../version'
import './types.d.ts'

type Result = { id: string; title: string; channel: string; duration: string; thumbnail: string; license: 'cc'|'mine'|'standard'; publishedAt: string }

export default function App() {
  const { t, i18n } = useTranslation()
  const [results, setResults] = useState<Result[]>([])
  const [dir, setDir] = useState<'ltr'|'rtl'>('ltr')
  const [apiReady, setApiReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentQuery, setCurrentQuery] = useState('')
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [downloadingVideos, setDownloadingVideos] = useState<Set<string>>(new Set())
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean
    videoId: string
    title: string
  }>({
    isOpen: false,
    videoId: '',
    title: ''
  })

  const [settingsModal, setSettingsModal] = useState(false)
  const [settings, setSettings] = useState<DownloadSettings>({
    downloadFolder: '',
    defaultFormat: 'mp4',
    defaultQuality: 'best',
    audioFormat: 'mp3',
    audioBitrate: '192k',
    videoFormat: 'mp4',
    videoQuality: '720p',
    videoCodec: 'h264'
  })

  const [downloads, setDownloads] = useState<DownloadJob[]>([])

  // Load settings on app start
  useEffect(() => {
    const loadSettings = async () => {
      if (window.clippilot?.getSettings) {
        try {
          const savedSettings = await window.clippilot.getSettings()
          setSettings(savedSettings)
        } catch (error) {
          console.error('Failed to load settings:', error)
        }
      }
    }
    loadSettings()
  }, [])

  useEffect(() => {
    const rtl = i18n.language === 'he'
    document.documentElement.dir = rtl ? 'rtl' : 'ltr'
    setDir(rtl ? 'rtl' : 'ltr')
  }, [i18n.language])

  useEffect(() => {
    // Check if the API is available
    const checkApi = () => {
      if (window.clippilot) {
        setApiReady(true)
      } else {
        setTimeout(checkApi, 100)
      }
    }
    checkApi()
  }, [])

  // Infinite scroll effect with window resize and fullscreen handling
  useEffect(() => {
    let isScrolling = false
    let resizeTimeout: NodeJS.Timeout | null = null
    
    const checkScrollPosition = () => {
      if (isScrolling) return
      
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.offsetHeight || document.body.offsetHeight
      
      if (
        scrollTop + windowHeight + 100 >= documentHeight &&
        !loading &&
        nextPageToken &&
        currentQuery
      ) {
        isScrolling = true
        loadMoreResults().finally(() => {
          isScrolling = false
        })
      }
    }

    const handleScroll = () => {
      checkScrollPosition()
    }

    const handleResize = () => {
      // Debounce resize events to avoid excessive checks
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      resizeTimeout = setTimeout(() => {
        // Check if we need to load more content after resize
        checkScrollPosition()
      }, 150)
    }

    const handleFullscreenChange = () => {
      // Handle fullscreen toggle with a delay to let the window settle
      setTimeout(checkScrollPosition, 200)
    }

    const handleVisibilityChange = () => {
      // Recheck scroll position when window becomes visible
      if (!document.hidden) {
        setTimeout(checkScrollPosition, 100)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
    }
  }, [loading, nextPageToken, currentQuery])

  // Intersection Observer for infinite scroll (more reliable for window resizing)
  useEffect(() => {
    const sentinel = document.getElementById('scroll-sentinel')
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (
          entry.isIntersecting &&
          !loading &&
          nextPageToken &&
          currentQuery
        ) {
          loadMoreResults()
        }
      },
      {
        root: null, // Use viewport as root
        rootMargin: '100px', // Trigger 100px before the sentinel comes into view
        threshold: 0.1
      }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [loading, nextPageToken, currentQuery, results.length]) // Include results.length to re-observe when content changes

  // Load trending videos when app starts
  const loadTrendingVideos = async () => {
    if (!window.clippilot?.getTrending) return

    setLoading(true)
    try {
      const response = await window.clippilot.getTrending()
      setResults(response.items || [])
      setCurrentQuery('') // Clear query since this is trending, not search
      setNextPageToken(null) // Trending doesn't have pagination
    } catch (error) {
      console.error('Failed to load trending videos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load trending videos when API becomes ready
  useEffect(() => {
    if (apiReady && results.length === 0 && !currentQuery) {
      loadTrendingVideos()
    }
  }, [apiReady])

  const onSearch = async (q: string) => {
    if (!window.clippilot) {
      console.error('ClipPilot API not available')
      return
    }
    
    setLoading(true)
    setCurrentQuery(q)
    setNextPageToken(null)
    
    try {
      const response = await window.clippilot.search(q)
      setResults(response.items || response) // Handle both old and new API responses
      setNextPageToken(response.nextPageToken || null)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMoreResults = async () => {
    if (!window.clippilot || !currentQuery || !nextPageToken || loading) {
      return
    }

    setLoading(true)

    try {
      const response = await window.clippilot.searchMore(currentQuery, nextPageToken)
      setResults(prev => [...prev, ...(response.items || response)])
      setNextPageToken(response.nextPageToken || null)
    } catch (error) {
      console.error('Load more failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (newSettings: DownloadSettings) => {
    try {
      if (window.clippilot?.saveSettings) {
        await window.clippilot.saveSettings(newSettings)
        setSettings(newSettings)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    }
  }

  const handleDownload = async (videoId: string, format?: 'mp3' | 'mp4') => {
    if (!window.clippilot || downloadingVideos.has(videoId)) {
      return
    }

    // Find the video info for the title
    const video = results.find(v => v.id === videoId)
    const videoTitle = video?.title || 'Unknown Video'

    try {
      const p = await window.clippilot.canDownload(videoId)
      if (!p.allowed) {
        // Add failed download notification
        const actualFormat = (format || settings.defaultFormat) === 'mp3' ? settings.audioFormat : settings.videoFormat
        const failedJob: DownloadJob = {
          id: `failed-${Date.now()}`,
          title: videoTitle,
          format: format || settings.defaultFormat,
          actualFormat: actualFormat,
          status: 'failed',
          error: p.reason || 'Blocked by policy',
          startTime: Date.now()
        }
        setDownloads(prev => [...prev, failedJob])
        return
      }

      // Mark video as downloading
      setDownloadingVideos(prev => new Set(prev).add(videoId))

      // Use user settings with detailed format preferences
      const downloadOptions = {
        quality: settings.defaultQuality,
        format: format || settings.defaultFormat,
        outputPath: settings.downloadFolder,
        // Audio settings
        audioFormat: settings.audioFormat,
        audioBitrate: settings.audioBitrate,
        // Video settings  
        videoFormat: settings.videoFormat,
        videoQuality: settings.videoQuality,
        videoCodec: settings.videoCodec
      }

      // Start the download
      const downloadResult = await window.clippilot.enqueueDownload(videoId, downloadOptions)

      if (downloadResult.success) {
        // Add download notification
        const actualFormat = format === 'mp3' ? settings.audioFormat : settings.videoFormat
        const downloadJob: DownloadJob = {
          id: downloadResult.jobId,
          title: videoTitle,
          format: (format || settings.defaultFormat) as 'mp3' | 'mp4',
          actualFormat: actualFormat,
          status: 'downloading',
          progress: 0,
          outputPath: downloadResult.outputPath,
          startTime: Date.now()
        }
        setDownloads(prev => [...prev, downloadJob])

        // Simulate progress updates (in real app, this would come from yt-dlp progress)
        const progressInterval = setInterval(() => {
          setDownloads(prev => prev.map(job => {
            if (job.id === downloadResult.jobId && job.status === 'downloading') {
              const newProgress = Math.min((job.progress || 0) + Math.random() * 15, 95)
              return { ...job, progress: newProgress }
            }
            return job
          }))
        }, 1000)

        // Simulate completion after 10-15 seconds
        setTimeout(() => {
          clearInterval(progressInterval)
          setDownloads(prev => prev.map(job => 
            job.id === downloadResult.jobId 
              ? { ...job, status: 'completed', progress: 100 }
              : job
          ))
        }, 10000 + Math.random() * 5000)

      } else {
        // Add failed download notification
        const failedJob: DownloadJob = {
          id: `failed-${Date.now()}`,
          title: videoTitle,
          format: (format || settings.defaultFormat) as 'mp3' | 'mp4',
          status: 'failed',
          error: downloadResult.error,
          startTime: Date.now()
        }
        setDownloads(prev => [...prev, failedJob])
      }

    } catch (error) {
      console.error('Download failed:', error)
      // Add failed download notification
      const failedJob: DownloadJob = {
        id: `failed-${Date.now()}`,
        title: videoTitle,
        format: (format || settings.defaultFormat) as 'mp3' | 'mp4',
        status: 'failed',
        error: 'Error starting download',
        startTime: Date.now()
      }
      setDownloads(prev => [...prev, failedJob])
    } finally {
      // Remove from downloading set
      setDownloadingVideos(prev => {
        const newSet = new Set(prev)
        newSet.delete(videoId)
        return newSet
      })
    }
  }

  const handleDismissDownload = (jobId: string) => {
    setDownloads(prev => prev.filter(job => job.id !== jobId))
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 bg-white/80 backdrop-blur border-b">
        <div className="w-full px-4 py-3 flex items-center gap-3">
          <AnimatedLogo />
          <h1 className="text-xl font-semibold">ClipPilot</h1>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">v{getVersionString()}</span>
          <div className="flex-1" />
          <select
            className="border rounded px-2 py-1"
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            aria-label={t('language')}
          >
            <option value="en">English</option>
            <option value="he">עברית</option>
          </select>
          <button
            onClick={() => setSettingsModal(true)}
            className="px-3 py-1 border rounded hover:bg-gray-50"
            title="Download Settings"
          >
            ⚙️
          </button>
        </div>
        <div className="w-full px-4 py-3">
          <SearchBar onSearch={onSearch} />
          <p className="text-xs text-gray-500 mt-2">{t('download_policy')}</p>
        </div>
      </header>

      <main className="w-full px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">
            {currentQuery ? `${t('results')} for "${currentQuery}"` : '🔥 Trending Videos'}
          </h2>
          {currentQuery && (
            <button
              onClick={() => {
                setCurrentQuery('')
                setNextPageToken(null)
                loadTrendingVideos()
              }}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              🔥 Back to Trending
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {results.map(v => (
            <article key={v.id} className="border rounded-xl p-3 shadow-sm flex flex-col gap-2">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {v.thumbnail ? (
                  <img 
                    src={v.thumbnail} 
                    alt={v.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to play icon if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = '<div class="text-5xl">▶</div>'
                    }}
                  />
                ) : (
                  <div className="text-5xl">▶</div>
                )}
              </div>
              <div className="font-medium line-clamp-2" title={v.title}>{v.title}</div>
              <div className="text-sm text-gray-600">{v.channel} • {v.duration}</div>
              <div className="text-xs text-gray-500">{v.publishedAt}</div>
              <div className="text-xs">
                {v.license === 'cc' && <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">{t('license_cc')}</span>}
                {v.license === 'mine' && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{t('license_mine')}</span>}
                {v.license === 'standard' && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{t('license_standard')}</span>}
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  className="flex-1 flex items-center justify-center gap-1 border rounded-lg py-2 hover:bg-gray-50 transition-colors" 
                  onClick={() => {
                    setPreviewModal({
                      isOpen: true,
                      videoId: v.id,
                      title: v.title
                    })
                  }}
                  title="Preview Video"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span className="text-xs">Preview</span>
                </button>
                <button 
                  className={`flex-1 flex items-center justify-center gap-1 border rounded-lg py-2 hover:bg-blue-50 hover:border-blue-300 transition-colors ${downloadingVideos.has(v.id) ? 'opacity-50 cursor-not-allowed' : ''}`} 
                  disabled={downloadingVideos.has(v.id)}
                  title={`Download ${settings.videoFormat.toUpperCase()} (Video)`} 
                  onClick={() => handleDownload(v.id, 'mp4')}
                >
                  {downloadingVideos.has(v.id) ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-xs">Loading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                      </svg>
                      <span className="text-xs text-blue-600 font-medium">{settings.videoFormat.toUpperCase()}</span>
                    </>
                  )}
                </button>
                <button 
                  className={`flex-1 flex items-center justify-center gap-1 border rounded-lg py-2 hover:bg-green-50 hover:border-green-300 transition-colors ${downloadingVideos.has(v.id) ? 'opacity-50 cursor-not-allowed' : ''}`} 
                  disabled={downloadingVideos.has(v.id)}
                  title={`Download ${settings.audioFormat.toUpperCase()} (Audio Only)`} 
                  onClick={() => handleDownload(v.id, 'mp3')}
                >
                  {downloadingVideos.has(v.id) ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-xs">Loading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                      <span className="text-xs text-green-600 font-medium">{settings.audioFormat.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
        
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading more videos...</span>
          </div>
        )}
        
        {/* Intersection Observer sentinel for infinite scroll */}
        {!loading && nextPageToken && currentQuery && (
          <div 
            id="scroll-sentinel" 
            className="h-4 w-full"
            style={{ height: '20px' }}
          />
        )}
        
        {/* End of results indicator */}
        {!loading && results.length > 0 && !nextPageToken && (
          <div className="text-center py-8 text-gray-500">
            No more results to load
          </div>
        )}
      </main>

      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, videoId: '', title: '' })}
        videoId={previewModal.videoId}
        title={previewModal.title}
      />

      <SettingsModal
        isOpen={settingsModal}
        onClose={() => setSettingsModal(false)}
        onSave={handleSaveSettings}
        currentSettings={settings}
      />

      <DownloadNotifications
        downloads={downloads}
        onDismiss={handleDismissDownload}
      />
    </div>
  )
}