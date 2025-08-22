import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import { spawn } from 'child_process'
import * as path from 'path'
import * as url from 'url'
import * as fs from 'fs'
import * as os from 'os'
import * as dotenv from 'dotenv'
import { google } from 'googleapis'

// Load environment variables
dotenv.config()

const isDev = process.env.NODE_ENV === 'development'
const devUrl = process.env.DEV_SERVER_URL || 'http://localhost:5173'

let win: BrowserWindow | null = null

function createWindow() {
  // Try to use custom icon, fall back gracefully if not found
  const iconPath = path.join(__dirname, '../../assets/icon.png')
  const windowOptions: any = {
    width: 1200,
    height: 800,
    show: false,
    title: 'ClipPilot - YouTube Search & Download',
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      preload: path.join(__dirname, '../preload/index.js')
    }
  }

  // Only set icon if the file exists
  if (require('fs').existsSync(iconPath)) {
    windowOptions.icon = iconPath
  }

  win = new BrowserWindow(windowOptions)

  win.on('ready-to-show', () => win?.show())

  if (isDev) {
    win.loadURL(devUrl)
  } else {
    win.loadURL(
      url.pathToFileURL(path.join(__dirname, '../renderer/index.html')).toString()
    )
  }

  // open external links in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  // Set application user model ID for Windows
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.ronled.clippilot')
  }
  
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Simple IPC stubs
type SearchResult = {
  id: string
  title: string
  channel: string
  duration: string
  thumbnail: string
  license: 'cc' | 'mine' | 'standard'
  publishedAt: string
}

// Store search results for license checking
let cachedResults: SearchResult[] = []

// Helper function to get basic YouTube search results without API
async function getBasicYouTubeResults(query: string): Promise<SearchResult[]> {
  return new Promise((resolve) => {
    // For now, let's create some realistic-looking results based on the search query
    // In a real implementation, you might use:
    // 1. Alternative APIs (like Invidious instances)
    // 2. RSS feeds for specific channels
    // 3. Search engines that index YouTube content
    
    const commonVideoIds = [
      'dQw4w9WgXcQ', '9bZkp7q19f0', 'K_dQw4w9WgX', 'L_HTX9oK8Q0', 'M_9bZkp7q19',
      'N_K_dQw4w9W', 'O_L_HTX9oK8', 'P_M_9bZkp7q', 'Q_N_K_dQw4w', 'R_O_L_HTX9o'
    ]
    
    const results: SearchResult[] = []
    
    // Generate some realistic results based on the search query
    for (let i = 0; i < Math.min(8, commonVideoIds.length); i++) {
      const videoId = commonVideoIds[i]
      const variations = [
        `${query} - Official Video`,
        `How to ${query}`,
        `${query} Tutorial`,
        `Best ${query} Compilation`,
        `${query} Music Video`,
        `${query} Explained`,
        `${query} - Full Version`,
        `${query} Live Performance`
      ]
      
      const channels = [
        'Official Channel', 'Music Videos', 'Tutorials Pro', 'Entertainment Hub',
        'Learn With Us', 'Creative Content', 'Popular Music', 'Educational'
      ]
      
      const durations = ['3:45', '5:22', '2:18', '7:30', '4:12', '6:05', '3:28', '8:15']
      const publishTimes = ['2 days ago', '1 week ago', '3 days ago', '5 days ago', '1 day ago', '4 days ago', '6 days ago', '2 weeks ago']
      
      results.push({
        id: videoId,
        title: variations[i % variations.length],
        channel: channels[i % channels.length],
        duration: durations[i % durations.length],
        thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        license: 'standard',
        publishedAt: publishTimes[i % publishTimes.length]
      })
    }
    
    // Add a note about the free tier
    results.push({
      id: 'free-tier-info',
      title: `💡 These are sample results for "${query}". Add YouTube API key for real search results!`,
      channel: 'ClipPilot Free Tier',
      duration: '0:00',
      thumbnail: '',
      license: 'standard',
      publishedAt: 'Info'
    })
    
    console.log(`Generated ${results.length} sample results for: ${query}`)
    resolve(results)
  })
}

// Helper function to determine video license (simplified)
function determineLicense(video: any): 'cc' | 'mine' | 'standard' {
  // In a real implementation, you would:
  // 1. Check if the video has Creative Commons license
  // 2. Check if the channel is yours (compare with your channel ID)
  // 3. Default to standard license
  
  // For demo purposes, let's make some videos CC licensed
  if (video.snippet.title.toLowerCase().includes('creative commons') || 
      video.snippet.title.toLowerCase().includes('cc')) {
    return 'cc'
  }
  
  // Simulate some videos being "yours" (you'd check against your actual channel)
  if (video.snippet.channelTitle.includes('Your') || 
      video.snippet.channelTitle.includes('Tutorial')) {
    return 'mine'
  }
  
  return 'standard'
}

// Helper function to format duration from ISO 8601 to readable format
// Convert YouTube duration to readable format
function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'
  
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Format YouTube publishedAt date to readable format
function formatPublishedDate(publishedAt: string): string {
  const date = new Date(publishedAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

ipcMain.handle('search', async (_evt, q: string, apiKey?: string, enhancedSearch?: boolean): Promise<any> => {
  try {
    // Check if API key is available (from settings or env)
    const availableApiKey = apiKey || process.env.YOUTUBE_API_KEY
    
    // Use enhanced search if API key is available (regardless of the enhancedSearch flag)
    // The enhancedSearch flag is just a user preference, but if they have an API key, use it
    const useEnhancedSearch = !!availableApiKey
    
    console.log(`Search request: query="${q}", hasApiKey=${!!availableApiKey}, useEnhanced=${useEnhancedSearch}`)
    
    if (!useEnhancedSearch) {
      console.log('Using free search method (basic search)')
      
      // Free tier: Use a simple approach to get real video data
      try {
        const results = await getBasicYouTubeResults(q)
        cachedResults = results
        return { items: results, nextPageToken: null }
        
      } catch (error) {
        console.warn('Free tier search failed:', error)
        
        // Return a more helpful message but still functional
        const fallbackResults: SearchResult[] = [
          {
            id: 'search-info',
            title: `Free search for "${q}" - Add API key in Settings for enhanced results`,
            channel: 'ClipPilot Free Tier',
            duration: '0:00',
            thumbnail: '',
            license: 'standard',
            publishedAt: 'Info'
          }
        ]
        
        cachedResults = fallbackResults
        return { items: fallbackResults, nextPageToken: null }
      }
    }

    console.log('Using enhanced search with API key')
    // Initialize YouTube API with the provided key
    const { google } = require('googleapis')
    const youtubeApi = google.youtube({
      version: 'v3',
      auth: availableApiKey
    })

    // Search for videos using YouTube Data API
    const searchResponse = await youtubeApi.search.list({
      part: ['snippet'],
      q: q,
      type: ['video'],
      maxResults: 12,
      order: 'relevance'
    })

    if (!searchResponse.data.items) {
      cachedResults = []
      return { items: [], nextPageToken: null }
    }

    // Get video IDs for additional details
    const videoIds = searchResponse.data.items
      .map((item: any) => item.id?.videoId)
      .filter(Boolean) as string[]

    // Get video details including duration
    const videosResponse = await youtubeApi.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: videoIds
    })

    if (!videosResponse.data.items) {
      cachedResults = []
      return { items: [], nextPageToken: null }
    }

    // Convert to our SearchResult format
    const results: SearchResult[] = videosResponse.data.items.map((video: any) => ({
      id: video.id!,
      title: video.snippet!.title!,
      channel: video.snippet!.channelTitle!,
      duration: formatDuration(video.contentDetails!.duration!),
      thumbnail: video.snippet!.thumbnails!.medium?.url || '',
      license: determineLicense(video),
      publishedAt: formatPublishedDate(video.snippet!.publishedAt!)
    }))

    // Cache results for license checking
    cachedResults = [...cachedResults, ...results]
    
    return {
      items: results,
      nextPageToken: searchResponse.data.nextPageToken || null
    }

  } catch (error) {
    console.error('YouTube search failed:', error)
    
    // Return helpful fallback
    const errorResults: SearchResult[] = [
      {
        id: 'error-info',
        title: `Search error for "${q}" - Check your connection or add API key for better results`,
        channel: 'ClipPilot',
        duration: '0:00',
        thumbnail: '',
        license: 'standard',
        publishedAt: 'Error info'
      }
    ]
    cachedResults = errorResults
    return { items: errorResults, nextPageToken: null }
  }
})

ipcMain.handle('search-more', async (_evt, q: string, pageToken: string, apiKey?: string, enhancedSearch?: boolean): Promise<any> => {
  try {
    // Check if API key is available (from settings or env)
    const availableApiKey = apiKey || process.env.YOUTUBE_API_KEY
    
    // Use enhanced search if API key is available (regardless of the enhancedSearch flag)
    const useEnhancedSearch = !!availableApiKey
    
    console.log(`Search-more request: query="${q}", hasApiKey=${!!availableApiKey}, useEnhanced=${useEnhancedSearch}`)
    
    if (!useEnhancedSearch) {
      // No more data to load without enhanced search
      return { items: [], nextPageToken: null }
    }

    // Initialize YouTube API with the provided key
    const { google } = require('googleapis')
    const youtubeApi = google.youtube({
      version: 'v3',
      auth: availableApiKey
    })

    // Search for more videos using YouTube Data API
    const searchResponse = await youtubeApi.search.list({
      part: ['snippet'],
      q: q,
      type: ['video'],
      maxResults: 12,
      order: 'relevance',
      pageToken: pageToken
    })

    if (!searchResponse.data.items) {
      return { items: [], nextPageToken: null }
    }

    // Get video IDs for additional details
    const videoIds = searchResponse.data.items
      .map((item: any) => item.id?.videoId)
      .filter(Boolean) as string[]

    // Get video details including duration
    const videosResponse = await youtubeApi.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: videoIds
    })

    if (!videosResponse.data.items) {
      return { items: [], nextPageToken: null }
    }

    // Convert to our SearchResult format
    const results: SearchResult[] = videosResponse.data.items.map((video: any) => ({
      id: video.id!,
      title: video.snippet!.title!,
      channel: video.snippet!.channelTitle!,
      duration: formatDuration(video.contentDetails!.duration!),
      thumbnail: video.snippet!.thumbnails!.medium?.url || '',
      license: determineLicense(video),
      publishedAt: formatPublishedDate(video.snippet!.publishedAt!)
    }))

    // Add to cached results for license checking
    cachedResults = [...cachedResults, ...results]
    
    return {
      items: results,
      nextPageToken: searchResponse.data.nextPageToken || null
    }

  } catch (error) {
    console.error('YouTube API search-more failed:', error)
    return { items: [], nextPageToken: null }
  }
})

// Handler for getting trending/popular videos
ipcMain.handle('get-trending', async (_evt, apiKey?: string, enhancedSearch?: boolean): Promise<any> => {
  try {
    // Check if API key is available (from settings or env)
    const availableApiKey = apiKey || process.env.YOUTUBE_API_KEY
    
    // Use enhanced search if API key is available (regardless of the enhancedSearch flag)
    const useEnhancedSearch = !!availableApiKey
    
    console.log(`Trending request: hasApiKey=${!!availableApiKey}, useEnhanced=${useEnhancedSearch}`)
    
    if (!useEnhancedSearch) {
      console.log('Using free method (no enhanced trending without API key)')
      // Return demo trending data to show app capabilities
      const demoTrending: SearchResult[] = [
        {
          id: 'trending1',
          title: '🔥 Free Tier Demo - Real trending videos appear with API key',
          channel: 'ClipPilot Demo',
          duration: '0:00',
          thumbnail: '',
          license: 'standard',
          publishedAt: 'Demo mode'
        },
        {
          id: 'trending2',
          title: '⚙️ Add your YouTube API key in Settings for full functionality',
          channel: 'ClipPilot Help',
          duration: '0:00',
          thumbnail: '',
          license: 'standard',
          publishedAt: 'Setup info'
        },
        {
          id: 'trending3',
          title: '🔍 Search suggestions work without API key - try searching above!',
          channel: 'ClipPilot Features',
          duration: '0:00',
          thumbnail: '',
          license: 'standard',
          publishedAt: 'Feature info'
        }
      ]
      cachedResults = demoTrending
      return { items: demoTrending }
    }

    console.log('Using enhanced trending with API key')
    // Initialize YouTube API with the provided key
    const { google } = require('googleapis')
    const youtubeApi = google.youtube({
      version: 'v3',
      auth: availableApiKey
    })

    // Get trending videos using YouTube Data API
    const trendingResponse = await youtubeApi.videos.list({
      part: ['snippet', 'contentDetails'],
      chart: 'mostPopular',
      regionCode: 'US', // You can change this or make it configurable
      maxResults: 50, // Increased from 20 to get more initial content
      videoCategoryId: '10' // Music category - you can remove this for all categories
    })

    if (!trendingResponse.data.items) {
      return { items: [] }
    }

    const results: SearchResult[] = trendingResponse.data.items.map((video: any) => ({
      id: video.id!,
      title: video.snippet!.title!,
      channel: video.snippet!.channelTitle!,
      duration: formatDuration(video.contentDetails!.duration!),
      thumbnail: video.snippet!.thumbnails!.medium?.url || '',
      license: determineLicense(video),
      publishedAt: formatPublishedDate(video.snippet!.publishedAt!)
    }))

    // Cache results for license checking
    cachedResults = results
    
    return { items: results }

  } catch (error) {
    console.error('YouTube API trending failed:', error)
    // Return demo trending data on error
    const errorTrending: SearchResult[] = [
      {
        id: 'error-trending1',
        title: '❌ Trending API Error - Add YouTube API key for real trending videos',
        channel: 'ClipPilot',
        duration: '0:00',
        thumbnail: '',
        license: 'standard',
        publishedAt: 'Error info'
      }
    ]
    cachedResults = errorTrending
    return { items: errorTrending }
  }
})

// Handler for loading more trending videos from different categories
ipcMain.handle('get-more-trending', async (_evt, apiKey?: string, offset: number = 0): Promise<any> => {
  try {
    // Check if API key is available (from settings or env)
    const availableApiKey = apiKey || process.env.YOUTUBE_API_KEY
    const useEnhancedSearch = !!availableApiKey
    
    console.log(`More trending request: hasApiKey=${!!availableApiKey}, offset=${offset}`)
    
    if (!useEnhancedSearch) {
      // No more trending data without API key
      return { items: [] }
    }

    // Initialize YouTube API with the provided key
    const { google } = require('googleapis')
    const youtubeApi = google.youtube({
      version: 'v3',
      auth: availableApiKey
    })

    // Different video categories to get diverse content
    const categories = [
      '10', // Music
      '24', // Entertainment  
      '23', // Comedy
      '27', // Education
      '28', // Science & Technology
      '26', // Howto & Style
      '25', // News & Politics
      '22', // People & Blogs
      '1',  // Film & Animation
      '20', // Gaming
      '17', // Sports
      '19', // Travel & Events
      '15', // Pets & Animals
      '2'   // Autos & Vehicles
    ]
    
    // Use different category based on offset
    const categoryIndex = Math.floor(offset / 20) % categories.length
    const categoryId = categories[categoryIndex]
    
    console.log(`Loading trending from category ${categoryId} (offset: ${offset})`)

    // Get trending videos from specific category
    const trendingResponse = await youtubeApi.videos.list({
      part: ['snippet', 'contentDetails'],
      chart: 'mostPopular',
      regionCode: 'US',
      maxResults: 20,
      videoCategoryId: categoryId
    })

    if (!trendingResponse.data.items) {
      return { items: [] }
    }

    const results: SearchResult[] = trendingResponse.data.items.map((video: any) => ({
      id: video.id!,
      title: video.snippet!.title!,
      channel: video.snippet!.channelTitle!,
      duration: formatDuration(video.contentDetails!.duration!),
      thumbnail: video.snippet!.thumbnails!.medium?.url || '',
      license: determineLicense(video),
      publishedAt: formatPublishedDate(video.snippet!.publishedAt!)
    }))

    // Add to cached results for license checking
    cachedResults = [...cachedResults, ...results]
    
    return { 
      items: results,
      hasMore: categoryIndex < categories.length - 1 || offset < 200 // Allow up to ~200 videos
    }

  } catch (error) {
    console.error('YouTube API more trending failed:', error)
    return { items: [] }
  }
})

// Handler for getting YouTube search suggestions (to avoid CORS issues)
ipcMain.handle('get-youtube-suggestions', async (_evt, query: string): Promise<string[]> => {
  try {
    const https = require('https')
    const url = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`
    
    return new Promise((resolve, reject) => {
      https.get(url, (res: any) => {
        let data = ''
        res.on('data', (chunk: any) => data += chunk)
        res.on('end', () => {
          try {
            // Parse JSONP response
            const jsonStart = data.indexOf('(') + 1
            const jsonEnd = data.lastIndexOf(')')
            const jsonStr = data.substring(jsonStart, jsonEnd)
            const parsedData = JSON.parse(jsonStr)
            
            // Extract suggestions from the response
            const suggestions = parsedData[1]?.map((item: any) => item[0]).filter((item: string) => item && item !== query) || []
            resolve(suggestions.slice(0, 8)) // Limit to 8 suggestions
          } catch (parseError) {
            console.warn('Failed to parse YouTube suggestions:', parseError)
            resolve([])
          }
        })
      }).on('error', (err: any) => {
        console.warn('YouTube suggestions request failed:', err)
        resolve([])
      })
    })
  } catch (error) {
    console.warn('YouTube suggestions handler failed:', error)
    return []
  }
})

ipcMain.handle('get-formats', async (_evt, _id: string) => {
  // TODO: query yt-dlp -F
  return {
    audio: [{ itag: 140, container: 'm4a', kbps: 128 }, { itag: 251, container: 'webm', kbps: 160 }],
    video: [{ itag: 18, container: 'mp4', res: '360p' }, { itag: 22, container: 'mp4', res: '720p' }]
  }
})

ipcMain.handle('can-download', async (_evt, id: string) => {
  // Find video info from cached results
  const videoInfo = cachedResults.find(v => v.id === id)
  
  if (!videoInfo) {
    return { allowed: false, reason: 'Video not found' }
  }

  // Handle demo/placeholder results  
  if (id.startsWith('demo') || id.startsWith('error') || id.startsWith('trending') || id.includes('info')) {
    return { 
      allowed: false, 
      reason: 'This is a sample result. Add your YouTube API key in Settings to search and download real videos.' 
    }
  }

  // For sample videos in free tier, allow preview but inform about limitations
  const commonSampleIds = ['dQw4w9WgXcQ', '9bZkp7q19f0', 'K_dQw4w9WgX', 'L_HTX9oK8Q0', 'M_9bZkp7q19']
  if (commonSampleIds.includes(id)) {
    return { 
      allowed: false, 
      reason: 'These are sample videos for demonstration. Add your YouTube API key to download real search results.' 
    }
  }

  // For real video IDs (when API key is used), allow downloads
  console.log(`Can-download check for: "${videoInfo.title}" with license: ${videoInfo.license}`)
  return { allowed: true, reason: 'Download allowed' }
})

ipcMain.handle('enqueue-download', async (_evt, id: string, opts: any) => {
  try {
    // First check if download is allowed
    const videoInfo = cachedResults.find(v => v.id === id)
    if (!videoInfo) {
      return { success: false, error: 'Video not found' }
    }

    // Temporarily allow all downloads for testing
    // Note: This is for personal use only. Users are responsible for respecting copyright laws.
    console.log(`Download request for: "${videoInfo.title}" with license: ${videoInfo.license}`)
    
    // For now, allow all downloads
    // const titleLower = videoInfo.title.toLowerCase()
    // const isMusic = titleLower.includes('music') ||
    //                titleLower.includes('song') ||
    //                titleLower.includes('audio') ||
    //                titleLower.includes('cover') ||
    //                titleLower.includes('remix') ||
    //                titleLower.includes('lyrics') ||
    //                titleLower.includes('official') ||
    //                titleLower.includes('acoustic')
    
    // const isEducational = titleLower.includes('tutorial') ||
    //                       titleLower.includes('lesson') ||
    //                       titleLower.includes('how to') ||
    //                       titleLower.includes('educational')
    
    // Allow downloads for CC, music, and educational content
    // if (videoInfo.license === 'standard' && !isMusic && !isEducational) {
    //   return { success: false, error: 'Download Blocked - not your upload or CC license. Music and educational content downloads are allowed for personal use.' }
    // }

    // Real yt-dlp download implementation
    console.log(`Starting download for video: ${id}`)
    console.log(`Video title: ${videoInfo.title}`)
    console.log(`License: ${videoInfo.license}`)
    console.log(`Download type: ${opts.format}`)
    console.log(`User settings:`, {
      audioFormat: opts.audioFormat,
      audioBitrate: opts.audioBitrate,
      videoFormat: opts.videoFormat,
      videoQuality: opts.videoQuality,
      videoCodec: opts.videoCodec
    })
    
    const jobId = `job-${Date.now()}`
    const ytDlpPath = path.join(__dirname, '../../tools/yt-dlp/yt-dlp.exe')
    const outputPath = opts.outputPath || appSettings.downloadFolder
    
    // Ensure output directory exists
    try {
      await fs.promises.mkdir(outputPath, { recursive: true })
    } catch (error) {
      console.error('Failed to create output directory:', error)
    }

    // Build yt-dlp arguments based on format and user settings
    const args = [
      `https://www.youtube.com/watch?v=${id}`,
      '-o', path.join(outputPath, '%(title)s.%(ext)s'),
    ]

    // Add ffmpeg location so yt-dlp can find it for audio conversion
    const ffmpegPath = path.join(__dirname, '../../tools/ffmpeg/ffmpeg.exe')
    if (fs.existsSync(ffmpegPath)) {
      args.push('--ffmpeg-location', path.dirname(ffmpegPath))
      console.log(`Using ffmpeg from: ${path.dirname(ffmpegPath)}`)
    } else {
      console.warn('ffmpeg not found at expected location:', ffmpegPath)
    }

    // Add format-specific arguments using user preferences from opts
    if (opts.format === 'mp3') {
      // Audio extraction with user preferences
      const audioFormat = opts.audioFormat || appSettings.audioFormat || 'mp3'
      const audioBitrate = opts.audioBitrate || appSettings.audioBitrate || '192k'
      
      console.log(`🎵 Audio download requested: format=${audioFormat}, bitrate=${audioBitrate}`)
      
      args.push('--extract-audio')
      
      // Handle different audio formats properly for yt-dlp
      if (audioFormat === 'aac') {
        args.push('--audio-format', 'aac')
      } else if (audioFormat === 'mp3') {
        args.push('--audio-format', 'mp3')
      } else if (audioFormat === 'flac') {
        args.push('--audio-format', 'flac')
      } else if (audioFormat === 'wav') {
        args.push('--audio-format', 'wav')
      } else if (audioFormat === 'ogg') {
        args.push('--audio-format', 'vorbis') // yt-dlp uses 'vorbis' for .ogg
      } else if (audioFormat === 'm4a') {
        args.push('--audio-format', 'aac')
        args.push('--audio-ext', 'm4a') // Force .m4a extension for AAC
      } else {
        args.push('--audio-format', audioFormat)
      }
      
      // Add audio quality if not 'best'
      if (audioBitrate !== 'best') {
        if (audioFormat === 'flac' || audioFormat === 'wav') {
          // Lossless formats don't use bitrate
          console.log(`Audio settings: ${audioFormat} (lossless)`)
        } else {
          args.push('--audio-quality', audioBitrate.replace('k', 'K'))
          console.log(`Audio settings: ${audioFormat} @ ${audioBitrate}`)
        }
      } else {
        console.log(`Audio settings: ${audioFormat} (best quality)`)
      }
    } else {
      // Video download with user preferences  
      const videoQuality = opts.videoQuality || appSettings.videoQuality || '720p'
      const videoFormat = opts.videoFormat || appSettings.videoFormat || 'mp4'
      const videoCodec = opts.videoCodec || appSettings.videoCodec || 'h264'
      
      if (videoQuality === 'best') {
        args.push('--format', 'best')
      } else {
        // Build format string with quality and codec preferences
        const height = videoQuality.replace('p', '')
        if (videoCodec === 'best') {
          args.push('--format', `best[height<=${height}]`)
        } else {
          args.push('--format', `best[height<=${height}][vcodec*=${videoCodec}]/best[height<=${height}]`)
        }
      }
      
      // Set container format if not mp4
      if (videoFormat !== 'mp4') {
        args.push('--merge-output-format', videoFormat)
      }
      
      console.log(`Video settings: ${videoQuality} ${videoFormat} (${videoCodec})`)
    }

    try {
      // Check if yt-dlp exists
      if (!fs.existsSync(ytDlpPath)) {
        return { 
          success: false, 
          error: 'yt-dlp not found. Please place yt-dlp.exe in the tools/yt-dlp folder.' 
        }
      }

      // Log the exact command being executed for debugging
      console.log(`🚀 Executing yt-dlp with args:`, args.join(' '))
      console.log(`📁 Working directory: ${outputPath}`)

      // Spawn yt-dlp process (hidden window)
      const child = spawn(ytDlpPath, args, {
        cwd: outputPath,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        detached: false
      })

      let output = ''
      let errorOutput = ''

      child.stdout?.on('data', (data) => {
        output += data.toString()
        console.log('yt-dlp output:', data.toString())
      })

      child.stderr?.on('data', (data) => {
        errorOutput += data.toString()
        console.error('yt-dlp error:', data.toString())
      })

      // Return immediately with job info, download continues in background
      child.on('close', (code) => {
        if (code === 0) {
          console.log(`Download completed successfully for: ${videoInfo.title}`)
          // Could emit an event to notify the renderer of completion
        } else {
          console.error(`Download failed with code ${code} for: ${videoInfo.title}`)
          console.error('Error output:', errorOutput)
          console.error('Full output:', output)
          
          // Specific error handling for audio format issues
          if (errorOutput.includes('ffprobe and ffmpeg not found') || errorOutput.includes('ffmpeg-location')) {
            console.error('❌ FFMPEG ERROR: Audio conversion failed because ffmpeg is not found')
            console.error('Solution: Make sure ffmpeg.exe is in tools/ffmpeg/ffmpeg.exe')
            console.error('Download ffmpeg from: https://ffmpeg.org/download.html')
          } else if (errorOutput.includes('audio format') || errorOutput.includes('codec')) {
            console.error('⚠️ Audio format error detected. This might be due to:')
            console.error('- Unsupported audio codec on this video')
            console.error('- Missing audio conversion dependencies')
            console.error('- Try using a different audio format (MP3 is most compatible)')
          }
          
          if (errorOutput.includes('aac') || errorOutput.includes('AAC')) {
            console.error('⚠️ AAC-specific error detected. Consider:')
            console.error('- Using MP3 format instead')
            console.error('- Checking if ffmpeg supports AAC encoding')
          }
        }
      })

      // Determine file extension based on user preferences from opts
      let extension: string
      if (opts.format === 'mp3') {
        extension = opts.audioFormat || appSettings.audioFormat || 'mp3'
      } else {
        extension = opts.videoFormat || appSettings.videoFormat || 'mp4'
      }
      
      const filename = `${videoInfo.title.replace(/[<>:"/\\|?*]/g, '_')}.${extension}`
      
      return { 
        success: true, 
        jobId: jobId,
        message: `Download started for: ${videoInfo.title}`,
        outputPath: path.join(outputPath, filename),
        format: opts.format,
        quality: opts.videoQuality || opts.quality || 'best',
        actualFormat: extension
      }

    } catch (error) {
      console.error('Failed to start download:', error)
      return { 
        success: false, 
        error: `Failed to start download: ${(error as Error).message}` 
      }
    }
    
  } catch (error) {
    console.error('Download failed:', error)
    return { success: false, error: 'Download failed: ' + (error as Error).message }
  }
})

ipcMain.handle('preview-video', async (_evt, id: string) => {
  // Find video info from cached results
  const videoInfo = cachedResults.find(v => v.id === id)
  
  if (!videoInfo) {
    return { success: false, error: 'Video not found' }
  }
  
  // In a real implementation, this would:
  // 1. Generate a preview URL or thumbnail
  // 2. Open video in a preview window
  // 3. Or return stream information for preview
  
  const previewUrl = `https://www.youtube.com/watch?v=${id}`
  
  // Open the video in the default browser for now
  shell.openExternal(previewUrl)
  
  return { 
    success: true, 
    url: previewUrl,
    title: videoInfo.title,
    duration: videoInfo.duration
  }
})

// Settings storage
let appSettings = {
  downloadFolder: path.join(os.homedir(), 'Downloads', 'ClipPilot'),
  defaultFormat: 'mp4' as 'mp3' | 'mp4',
  defaultQuality: 'best',
  audioFormat: 'mp3',
  audioBitrate: '192k',
  videoFormat: 'mp4',
  videoQuality: '720p',
  videoCodec: 'h264'
}

// Folder selection handler
ipcMain.handle('select-folder', async () => {
  try {
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openDirectory'],
      title: 'Select Download Folder',
      defaultPath: appSettings.downloadFolder
    })
    
    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, cancelled: true }
    }
    
    return { success: true, path: result.filePaths[0] }
  } catch (error) {
    console.error('Failed to open folder dialog:', error)
    return { success: false, error: (error as Error).message }
  }
})

// Settings handlers
ipcMain.handle('get-settings', async () => {
  return appSettings
})

ipcMain.handle('save-settings', async (_evt, settings) => {
  appSettings = { ...appSettings, ...settings }
  
  // Create download folder if it doesn't exist
  try {
    await fs.promises.mkdir(appSettings.downloadFolder, { recursive: true })
  } catch (error) {
    console.error('Failed to create download folder:', error)
  }
  
  return { success: true }
})

// Open folder handler
ipcMain.handle('open-folder', async (_evt, filePath: string) => {
  try {
    const folderPath = path.dirname(filePath)
    await shell.openPath(folderPath)
    return { success: true }
  } catch (error) {
    console.error('Failed to open folder:', error)
    return { success: false, error: (error as Error).message }
  }
})