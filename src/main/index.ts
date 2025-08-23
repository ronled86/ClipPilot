import { app, BrowserWindow, ipcMain, shell, dialog, globalShortcut } from 'electron'
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
  let iconPath: string
  
  if (isDev) {
    // In development, use icon from project root assets folder
    iconPath = path.join(process.cwd(), 'assets', 'icon.ico')
  } else {
    // In production, use icon from app resources
    iconPath = path.join(__dirname, '../../assets/icon.ico')
  }
  
  const windowOptions: any = {
    width: 1200,
    height: 800,
    show: false,
    title: 'ClipPAilot - YouTube Search & Download',
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
    console.log(`🎨 Using custom icon: ${iconPath}`)
  } else {
    console.log(`⚠️ Icon not found at: ${iconPath}`)
  }

  win = new BrowserWindow(windowOptions)

  // Explicitly set the icon for taskbar on Windows
  if (process.platform === 'win32' && require('fs').existsSync(iconPath)) {
    win.setIcon(iconPath)
  }

  // Hide menu bar by default for cleaner interface
  win.setMenuBarVisibility(false)
  win.setAutoHideMenuBar(true)

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

app.whenReady().then(async () => {
  // Set application user model ID for Windows
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.ronled.clippailot')
  }
  
  // Load settings from file
  try {
    appSettings = await loadSettings()
    console.log('Settings loaded from file')
  } catch (error) {
    console.error('Failed to load settings, using defaults:', error)
  }
  
  createWindow()
  
  // Register global shortcuts
  globalShortcut.register('F12', () => {
    if (win && win.webContents) {
      win.webContents.toggleDevTools()
    }
  })

  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (win && win.webContents) {
      win.webContents.toggleDevTools()
    }
  })

  globalShortcut.register('Alt+M', () => {
    if (win) {
      const isVisible = win.isMenuBarVisible()
      const newVisibility = !isVisible
      
      console.log(`Menu toggle: currently ${isVisible ? 'visible' : 'hidden'}, setting to ${newVisibility ? 'visible' : 'hidden'}`)
      
      win.setMenuBarVisibility(newVisibility)
      win.setAutoHideMenuBar(!newVisibility) // When showing menu, disable auto-hide; when hiding, enable auto-hide
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll()
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
      channel: 'ClipPAilot Free Tier',
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

ipcMain.handle('search', async (_evt, q: string, apiKey?: string): Promise<any> => {
  try {
    // Check if API key is available (from settings or env)
    const availableApiKey = apiKey || process.env.YOUTUBE_API_KEY
    
    if (!availableApiKey) {
      throw new Error('YouTube API key is required for search functionality')
    }
    
    console.log(`Search request: query="${q}"`)
    
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
    // Handle specific error types with clean logging
    if ((error as any)?.status === 403 && (error as any)?.message?.includes('quota')) {
      console.log('ℹ️ YouTube API quota exceeded during search')
      const quotaResults: SearchResult[] = [
        {
          id: 'quota-error',
          title: 'API Quota Exceeded - Daily limit of 10,000 requests reached',
          channel: 'ClipPAilot Notice',
          duration: '0:00',
          thumbnail: '',
          license: 'standard',
          publishedAt: 'Quotas reset at midnight Pacific Time'
        },
        {
          id: 'quota-solution',
          title: 'Solution: Create a new API key or wait for quota reset',
          channel: 'ClipPAilot Help',
          duration: '0:00',
          thumbnail: '',
          license: 'standard',
          publishedAt: 'Visit Google Cloud Console for new key'
        }
      ]
      cachedResults = quotaResults
      return { items: quotaResults, nextPageToken: null }
    }
    
    // Generic search error with clean logging
    console.log(`⚠️ YouTube search failed: ${(error as any)?.message || 'Unknown error'}`)
    
    // Return helpful fallback
    const errorResults: SearchResult[] = [
      {
        id: 'error-info',
        title: `Search error for "${q}" - Check your connection or add API key for better results`,
        channel: 'ClipPAilot',
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

ipcMain.handle('search-more', async (_evt, q: string, pageToken: string, apiKey?: string): Promise<any> => {
  try {
    // Check if API key is available (from settings or env)
    const availableApiKey = apiKey || process.env.YOUTUBE_API_KEY
    
    if (!availableApiKey) {
      throw new Error('YouTube API key is required for search functionality')
    }
    
    console.log(`Search-more request: query="${q}"`)

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
    console.log(`⚠️ Failed to load more search results: ${(error as any)?.message || 'Unknown error'}`)
    
    // Handle quota exceeded error specifically
    if ((error as any)?.status === 403 && (error as any)?.message?.includes('quota')) {
      return { 
        items: [{
          id: 'quota-error',
          title: 'API Quota Exceeded - Daily limit reached (10,000 requests)',
          channel: 'ClipPAilot Error',
          duration: '0:00',
          thumbnail: '',
          license: 'standard',
          publishedAt: 'Quotas reset at midnight PT'
        }], 
        nextPageToken: null 
      }
    }
    
    return { items: [], nextPageToken: null }
  }
})

// Handler for getting trending/popular videos
ipcMain.handle('get-trending', async (_evt, apiKey?: string, categoryId?: string): Promise<any> => {
  try {
    // Check if API key is available (from settings or env)
    const availableApiKey = apiKey || process.env.YOUTUBE_API_KEY
    
    if (!availableApiKey) {
      throw new Error('YouTube API key is required for trending videos')
    }
    
    console.log(`Trending request with API key for category: ${categoryId || 'all'}`)
    
    // Initialize YouTube API with the provided key
    const { google } = require('googleapis')
    const youtubeApi = google.youtube({
      version: 'v3',
      auth: availableApiKey
    })

    try {
      // Prepare request parameters
      const requestParams: any = {
        part: ['snippet', 'contentDetails'],
        chart: 'mostPopular',
        regionCode: 'US', // You can change this or make it configurable
        maxResults: 50 // Increased from 20 to get more initial content
      }

      // Add category filter if specified
      if (categoryId && categoryId !== '0') {
        requestParams.videoCategoryId = categoryId
      }

      // Get trending videos using YouTube Data API
      const trendingResponse = await youtubeApi.videos.list(requestParams)

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

    } catch (error: any) {
      // Handle specific error types with user-friendly messages
      if (error?.status === 403 && error?.message?.includes('quota')) {
        console.log('ℹ️ YouTube API quota exceeded - daily limit reached')
        const quotaError = new Error('YouTube API quota exceeded. The daily limit of 10,000 requests has been reached. Quotas reset at midnight Pacific Time. Consider creating a new API key if you need immediate access.')
        ;(quotaError as any).code = 'QUOTA_EXCEEDED'
        ;(quotaError as any).status = 403
        throw quotaError
      }
      
      if (error?.status === 404) {
        console.log(`ℹ️ No trending videos found for the selected category - trying fallback to all categories`)
        // Fallback: try without category restriction
        try {
          const fallbackResponse = await youtubeApi.videos.list({
            part: ['snippet', 'contentDetails'],
            chart: 'mostPopular',
            regionCode: 'US',
            maxResults: 50
          })
          
          if (fallbackResponse.data.items) {
            const results: SearchResult[] = fallbackResponse.data.items.map((video: any) => ({
              id: video.id!,
              title: video.snippet!.title!,
              channel: video.snippet!.channelTitle!,
              duration: formatDuration(video.contentDetails!.duration!),
              thumbnail: video.snippet!.thumbnails!.medium?.url || '',
              license: determineLicense(video),
              publishedAt: formatPublishedDate(video.snippet!.publishedAt!)
            }))
            
            cachedResults = results
            return { items: results }
          }
        } catch (fallbackError) {
          console.log('⚠️ Fallback trending request also failed')
        }
      }
      
      // Generic error handling with clean logging
      console.log(`⚠️ YouTube trending request failed: ${error?.message || 'Unknown error'}`)
      
      throw error
    }
  } catch (outerError) {
    // This catches any errors from the API setup itself
    console.log(`⚠️ YouTube API setup failed: ${(outerError as any)?.message || 'Unknown error'}`)
    throw outerError
  }
})

// Handler for loading more trending videos from different categories
ipcMain.handle('get-more-trending', async (_evt, apiKey?: string, offset: number = 0): Promise<any> => {
  try {
    // Check if API key is available (from settings or env)
    const availableApiKey = apiKey || process.env.YOUTUBE_API_KEY
    
    if (!availableApiKey) {
      throw new Error('YouTube API key is required for trending videos')
    }
    
    console.log(`More trending request with API key, offset=${offset}`)

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
    // Handle specific error types with clean, user-friendly messages
    if ((error as any)?.status === 403 && (error as any)?.message?.includes('quota')) {
      console.log('ℹ️ YouTube API quota exceeded - cannot load more trending videos')
      return { 
        items: [{
          id: 'quota-error-trending',
          title: 'API Quota Exceeded - Cannot load more trending videos',
          channel: 'ClipPAilot Notice',
          duration: '0:00',
          thumbnail: '',
          license: 'standard',
          publishedAt: 'Daily limit reached - resets at midnight PT'
        }] 
      }
    }
    
    if ((error as any)?.status === 404) {
      console.log('ℹ️ No more trending videos found for this category')
      return { items: [] }
    }
    
    // Generic error with clean logging
    console.log(`⚠️ Failed to load more trending videos: ${(error as any)?.message || 'Unknown error'}`)
    
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
    // Check if this is a direct URL download
    const isUrlDownload = opts.url && opts.url.startsWith('http')
    
    if (!isUrlDownload) {
      // For video ID downloads, check if video info exists
      const videoInfo = cachedResults.find(v => v.id === id)
      if (!videoInfo) {
        return { success: false, error: 'Video not found' }
      }
      
      console.log(`Download request for: "${videoInfo.title}" with license: ${videoInfo.license}`)
    } else {
      console.log(`Direct URL download request for: ${opts.url}`)
    }

    // Allow all downloads for personal use
    // Note: Users are responsible for respecting copyright laws.
    
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
    const videoInfo = isUrlDownload ? null : cachedResults.find(v => v.id === id)
    
    console.log(`Starting download for: ${isUrlDownload ? 'URL' : 'video'} ${id}`)
    if (videoInfo) {
      console.log(`Video title: ${videoInfo.title}`)
      console.log(`License: ${videoInfo.license}`)
    } else if (isUrlDownload) {
      console.log(`URL: ${opts.url}`)
    }
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
    // Determine the URL to download
    let downloadUrl = ''
    if (opts.url) {
      // Direct URL provided
      downloadUrl = opts.url
      console.log(`Using direct URL: ${downloadUrl}`)
    } else {
      // Video ID provided, construct YouTube URL
      downloadUrl = `https://www.youtube.com/watch?v=${id}`
      console.log(`Using YouTube video ID: ${id}`)
    }
    
    const args = [
      downloadUrl,
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

      // Register the download for cancellation support
      const downloadTimeout = setTimeout(() => {
        console.log(`Download ${jobId} timed out after 10 minutes, cancelling...`)
        cancelDownload(jobId)
      }, 10 * 60 * 1000) // 10 minute timeout

      activeDownloads.set(jobId, {
        process: child,
        startTime: Date.now(),
        timeout: downloadTimeout
      })

      // Send initial status to renderer
      if (win && win.webContents) {
        win.webContents.send('job-progress', {
          jobId: jobId,
          progress: 0,
          status: 'preparing'
        })
      }

      let output = ''
      let errorOutput = ''
      let lastProgressTime = Date.now()
      let hasSeenProgress = false
      let lastKnownProgress = 0
      let downloadCompleted = false // Track if main download is completed

      child.stdout?.on('data', (data) => {
        const outputLine = data.toString()
        output += outputLine
        console.log('yt-dlp output:', outputLine)
        
        // Update last activity time
        lastProgressTime = Date.now()
        
        // Initialize progress tracking
        let currentStatus = 'downloading'
        let progress = lastKnownProgress // Start with last known progress
        let statusMessage = ''
        
        // Parse yt-dlp progress output first - this is the main download progress
        // Example: [download]  45.2% of 10.5MiB at 1.2MiB/s ETA 00:03
        const progressMatch = outputLine.match(/\[download\]\s+(\d+(?:\.\d+)?)%/)
        if (progressMatch) {
          progress = parseFloat(progressMatch[1])
          lastKnownProgress = progress
          hasSeenProgress = true
          currentStatus = 'downloading'
          statusMessage = `${progress.toFixed(1)}% downloaded`
          console.log(`Download progress: ${progress}%`)
          
          // Check if download completed
          if (progress >= 100) {
            downloadCompleted = true
          }
        } else if (outputLine.includes('[download] 100%') || outputLine.includes('has already been downloaded')) {
          // Explicit download completion detection
          progress = 100
          lastKnownProgress = 100
          downloadCompleted = true
          currentStatus = 'downloading'
          statusMessage = 'Download completed'
          console.log('Download completed (100%)')
        } else {
          // Handle different phases with stage-based progress
          if (!downloadCompleted) {
            // Pre-download phases - reset progress to 0 for each stage
            if (outputLine.includes('[youtube]') || outputLine.includes('Extracting URL')) {
              currentStatus = 'extracting'
              statusMessage = 'Extracting video information...'
              progress = hasSeenProgress ? Math.min(lastKnownProgress, 100) : 20 // Stage progress
            } else if (outputLine.includes('[info]') && outputLine.includes('format')) {
              currentStatus = 'preparing'
              statusMessage = 'Selecting best format...'
              progress = hasSeenProgress ? Math.min(lastKnownProgress, 100) : 50 // Stage progress
            }
          } else {
            // Post-download phases - each gets its own 0-100% range
            if (outputLine.includes('[ExtractAudio]') || outputLine.includes('[ffmpeg]')) {
              currentStatus = 'converting'
              statusMessage = 'Converting audio format...'
              progress = 30 // Starting conversion stage
            } else if (outputLine.includes('Deleting original file')) {
              currentStatus = 'finalizing'
              statusMessage = 'Finalizing conversion...'
              progress = 90 // Almost done
            }
          }
        }
        
        // Send progress update to renderer
        if (win && win.webContents) {
          win.webContents.send('job-progress', {
            jobId: jobId,
            progress: progress,
            status: currentStatus,
            message: statusMessage
          })
        }
      })

      child.stderr?.on('data', (data) => {
        const errorLine = data.toString()
        errorOutput += errorLine
        console.error('yt-dlp error:', errorLine)
        
        // Check for specific error patterns
        if (errorLine.includes('ERROR:') || errorLine.includes('FATAL:')) {
          console.error('Download error detected')
          if (win && win.webContents) {
            win.webContents.send('job-progress', {
              jobId: jobId,
              progress: 0,
              status: 'failed',
              error: errorLine.trim()
            })
          }
        }
      })

      // Return immediately with job info, download continues in background
      child.on('close', (code) => {
        const title = videoInfo?.title || opts.url || id
        
        // Clean up from active downloads
        const download = activeDownloads.get(jobId)
        if (download) {
          if (download.timeout) {
            clearTimeout(download.timeout)
          }
          activeDownloads.delete(jobId)
        }
        
        if (code === 0) {
          console.log(`Download completed successfully for: ${title}`)
          // Send completion status to renderer
          if (win && win.webContents) {
            win.webContents.send('job-progress', {
              jobId: jobId,
              progress: 100,
              status: 'completed',
              message: 'Download completed successfully'
            })
          }
        } else if (code === null) {
          // Process was killed (likely cancelled)
          console.log(`Download cancelled for: ${title}`)
        } else {
          console.error(`Download failed with code ${code} for: ${title}`)
          console.error('Error output:', errorOutput)
          console.error('Full output:', output)
          
          // Send error status to renderer
          if (win && win.webContents) {
            win.webContents.send('job-progress', {
              jobId: jobId,
              progress: 0,
              status: 'failed',
              error: `Download failed with exit code ${code}`
            })
          }
          
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
      
      const title = videoInfo?.title || `download-${Date.now()}`
      const filename = `${title.replace(/[<>:"/\\|?*]/g, '_')}.${extension}`
      
      return { 
        success: true, 
        jobId: jobId,
        message: `Download started for: ${videoInfo?.title || opts.url || id}`,
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
const settingsPath = path.join(app.getPath('userData'), 'settings.json')

const defaultSettings = {
  downloadFolder: path.join(os.homedir(), 'Downloads', 'ClipPAilot'),
  defaultFormat: 'mp4' as 'mp3' | 'mp4',
  defaultQuality: 'best',
  audioFormat: 'mp3',
  audioBitrate: '192k',
  videoFormat: 'mp4',
  videoQuality: '720p',
  videoCodec: 'h264',
  youtubeApiKey: '',
  language: 'en'
}

// Load settings from file or create with defaults
const loadSettings = async () => {
  try {
    const data = await fs.promises.readFile(settingsPath, 'utf-8')
    const saved = JSON.parse(data)
    return { ...defaultSettings, ...saved }
  } catch (error) {
    console.log('Settings file not found, using defaults')
    return defaultSettings
  }
}

// Save settings to file
const saveSettingsToFile = async (settings: typeof defaultSettings) => {
  try {
    const userDataDir = path.dirname(settingsPath)
    await fs.promises.mkdir(userDataDir, { recursive: true })
    await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2))
    console.log('Settings saved to:', settingsPath)
  } catch (error) {
    console.error('Failed to save settings to file:', error)
    throw error
  }
}

let appSettings = defaultSettings

// Active downloads tracking for cancellation support
const activeDownloads = new Map<string, {
  process: any,
  startTime: number,
  timeout?: NodeJS.Timeout
}>()

// Function to cancel a download
const cancelDownload = (jobId: string) => {
  const download = activeDownloads.get(jobId)
  if (download) {
    try {
      download.process.kill('SIGTERM')
      if (download.timeout) {
        clearTimeout(download.timeout)
      }
      activeDownloads.delete(jobId)
      
      // Send cancellation notification
      if (win && win.webContents) {
        win.webContents.send('job-progress', {
          jobId: jobId,
          progress: 0,
          status: 'cancelled'
        })
      }
      
      console.log(`Download ${jobId} cancelled`)
      return true
    } catch (error) {
      console.error(`Failed to cancel download ${jobId}:`, error)
      return false
    }
  }
  return false
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
  try {
    appSettings = { ...appSettings, ...settings }
    await saveSettingsToFile(appSettings)
    
    // Create download folder if it doesn't exist
    try {
      await fs.promises.mkdir(appSettings.downloadFolder, { recursive: true })
    } catch (error) {
      console.error('Failed to create download folder:', error)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Failed to save settings:', error)
    return { success: false, error: (error as Error).message }
  }
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

// Toggle developer tools
ipcMain.handle('toggle-dev-tools', async () => {
  try {
    if (win && win.webContents) {
      win.webContents.toggleDevTools()
      return { success: true }
    }
    return { success: false, error: 'No active window' }
  } catch (error) {
    console.error('Failed to toggle dev tools:', error)
    return { success: false, error: (error as Error).message }
  }
})

// Cancel download
ipcMain.handle('cancel-download', async (_evt, jobId: string) => {
  try {
    const success = cancelDownload(jobId)
    return { success, message: success ? 'Download cancelled' : 'Download not found or already completed' }
  } catch (error) {
    console.error('Failed to cancel download:', error)
    return { success: false, error: (error as Error).message }
  }
})

// Toggle menu bar
ipcMain.handle('toggle-menu-bar', async () => {
  try {
    if (win) {
      const isVisible = win.isMenuBarVisible()
      const newVisibility = !isVisible
      
      console.log(`IPC Menu toggle: currently ${isVisible ? 'visible' : 'hidden'}, setting to ${newVisibility ? 'visible' : 'hidden'}`)
      
      win.setMenuBarVisibility(newVisibility)
      win.setAutoHideMenuBar(!newVisibility) // When showing menu, disable auto-hide; when hiding, enable auto-hide
      
      return { success: true, visible: newVisibility }
    }
    return { success: false, error: 'No active window' }
  } catch (error) {
    console.error('Failed to toggle menu bar:', error)
    return { success: false, error: (error as Error).message }
  }
})

// Exit application
ipcMain.handle('exit-app', async () => {
  try {
    console.log('Exit app requested via IPC')
    app.quit()
    return { success: true }
  } catch (error) {
    console.error('Failed to exit app:', error)
    return { success: false, error: (error as Error).message }
  }
})