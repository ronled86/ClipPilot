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

// YouTube API setup
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
})

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

ipcMain.handle('search', async (_evt, q: string): Promise<any> => {
  try {
    // Check if API key is configured
    if (!process.env.YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured, using mock data')
      // Fall back to mock data if no API key
      const sample: SearchResult[] = [
        { id: 'abc123', title: `Sample for: ${q}`, channel: 'ClipPilot', duration: '12:34', thumbnail: '', license: 'cc', publishedAt: '2 days ago' },
        { id: 'def456', title: `Demo track: ${q}`, channel: 'ClipPilot', duration: '05:20', thumbnail: '', license: 'standard', publishedAt: '1 week ago' },
        { id: 'ghi789', title: `My upload: ${q}`, channel: 'Your Channel', duration: '08:15', thumbnail: '', license: 'mine', publishedAt: '3 days ago' }
      ]
      cachedResults = sample
      return { items: sample, nextPageToken: null }
    }

    // Search for videos using YouTube Data API
    const searchResponse = await youtube.search.list({
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
      .map(item => item.id?.videoId)
      .filter(Boolean) as string[]

    // Get video details including duration
    const videosResponse = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: videoIds
    })

    if (!videosResponse.data.items) {
      cachedResults = []
      return { items: [], nextPageToken: null }
    }

    // Convert to our SearchResult format
    const results: SearchResult[] = videosResponse.data.items.map(video => ({
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
    console.error('YouTube API search failed:', error)
    
    // Fall back to mock data on error
    const sample: SearchResult[] = [
      { id: 'error123', title: `API Error - Sample for: ${q}`, channel: 'ClipPilot', duration: '12:34', thumbnail: '', license: 'cc', publishedAt: '1 day ago' },
      { id: 'error456', title: `Check API key - Demo: ${q}`, channel: 'ClipPilot', duration: '05:20', thumbnail: '', license: 'standard', publishedAt: '5 days ago' }
    ]
    cachedResults = sample
    return { items: sample, nextPageToken: null }
  }
})

ipcMain.handle('search-more', async (_evt, q: string, pageToken: string): Promise<any> => {
  try {
    // Check if API key is configured
    if (!process.env.YOUTUBE_API_KEY) {
      // No more mock data to load
      return { items: [], nextPageToken: null }
    }

    // Search for more videos using YouTube Data API
    const searchResponse = await youtube.search.list({
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
      .map(item => item.id?.videoId)
      .filter(Boolean) as string[]

    // Get video details including duration
    const videosResponse = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: videoIds
    })

    if (!videosResponse.data.items) {
      return { items: [], nextPageToken: null }
    }

    // Convert to our SearchResult format
    const results: SearchResult[] = videosResponse.data.items.map(video => ({
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
ipcMain.handle('get-trending', async (_evt): Promise<any> => {
  try {
    // Check if API key is configured
    if (!process.env.YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured, using mock trending data')
      // Return mock trending data
      const mockTrending: SearchResult[] = [
        { id: 'trending1', title: '🔥 Trending Music Mix 2025', channel: 'Music Channel', duration: '45:32', thumbnail: '', license: 'standard', publishedAt: '6 hours ago' },
        { id: 'trending2', title: '🎵 Top Hits This Week', channel: 'Popular Music', duration: '32:15', thumbnail: '', license: 'standard', publishedAt: '12 hours ago' },
        { id: 'trending3', title: '📱 Tech Review: Latest Gadgets', channel: 'Tech Today', duration: '12:45', thumbnail: '', license: 'standard', publishedAt: '1 day ago' },
        { id: 'trending4', title: '🎬 Movie Trailers Compilation', channel: 'Cinema Hub', duration: '25:30', thumbnail: '', license: 'standard', publishedAt: '2 days ago' },
        { id: 'trending5', title: '🎸 Acoustic Guitar Sessions', channel: 'Music Live', duration: '38:20', thumbnail: '', license: 'cc', publishedAt: '3 days ago' },
        { id: 'trending6', title: '🏃‍♂️ Fitness Workout Routine', channel: 'Health & Fitness', duration: '22:10', thumbnail: '', license: 'standard', publishedAt: '4 days ago' },
        { id: 'trending7', title: '🍳 Quick Cooking Recipes', channel: 'Food Network', duration: '15:45', thumbnail: '', license: 'standard', publishedAt: '5 days ago' },
        { id: 'trending8', title: '🎯 Gaming Highlights 2025', channel: 'Pro Gaming', duration: '28:55', thumbnail: '', license: 'standard', publishedAt: '1 week ago' },
        { id: 'trending9', title: '🌍 Travel Destinations Guide', channel: 'Adventure World', duration: '35:40', thumbnail: '', license: 'standard', publishedAt: '1 week ago' },
        { id: 'trending10', title: '📚 Educational Content Hub', channel: 'Learn Today', duration: '42:15', thumbnail: '', license: 'cc', publishedAt: '2 weeks ago' }
      ]
      cachedResults = mockTrending
      return { items: mockTrending }
    }

    // Get trending videos using YouTube Data API
    const trendingResponse = await youtube.videos.list({
      part: ['snippet', 'contentDetails'],
      chart: 'mostPopular',
      regionCode: 'US', // You can change this or make it configurable
      maxResults: 20,
      videoCategoryId: '10' // Music category - you can remove this for all categories
    })

    if (!trendingResponse.data.items) {
      return { items: [] }
    }

    const results: SearchResult[] = trendingResponse.data.items.map(video => ({
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
    // Return mock data on error
    const mockTrending: SearchResult[] = [
      { id: 'error1', title: '🔥 Popular Content (Demo)', channel: 'ClipPilot', duration: '15:30', thumbnail: '', license: 'cc', publishedAt: '1 hour ago' },
      { id: 'error2', title: '🎵 Trending Music (Demo)', channel: 'ClipPilot', duration: '22:45', thumbnail: '', license: 'standard', publishedAt: '3 hours ago' }
    ]
    cachedResults = mockTrending
    return { items: mockTrending }
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

  // Temporarily allow all downloads for testing
  console.log(`Can-download check for: "${videoInfo.title}" with license: ${videoInfo.license}`)
  return { allowed: true, reason: 'Download allowed for testing' }

  // // Allow downloads for CC licensed videos and user's own uploads
  // if (videoInfo.license === 'cc') {
  //   return { allowed: true, reason: 'Creative Commons license allows download' }
  // }
  
  // if (videoInfo.license === 'mine') {
  //   return { allowed: true, reason: 'This is your upload' }
  // }
  
  // // Block standard licensed videos
  // return { allowed: false, reason: 'Not your upload or CC license' }
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

    // Add format-specific arguments using user preferences from opts
    if (opts.format === 'mp3') {
      // Audio extraction with user preferences
      const audioFormat = opts.audioFormat || appSettings.audioFormat || 'mp3'
      const audioBitrate = opts.audioBitrate || appSettings.audioBitrate || '192k'
      
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
          if (errorOutput.includes('audio format') || errorOutput.includes('codec')) {
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