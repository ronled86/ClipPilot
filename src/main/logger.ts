import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { getVersionString } from '../version'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private logDir: string
  private logFile: string
  private isDev: boolean

  constructor() {
    this.isDev = process.env.NODE_ENV === 'development'
    this.logDir = this.getLogDirectory()
    this.logFile = path.join(this.logDir, `clippailot-${this.getDateString()}.log`)
    
    // Ensure log directory exists
    this.ensureLogDirectory()
    
    // Log startup information
    this.logStartup()
  }

  private getLogDirectory(): string {
    if (this.isDev) {
      // In development, use project logs folder
      return path.join(process.cwd(), 'logs')
    } else {
      // In production, use user's app data folder
      const userDataPath = path.join(os.homedir(), 'AppData', 'Local', 'ClipPAilot', 'logs')
      return userDataPath
    }
  }

  private ensureLogDirectory(): void {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true })
      }
    } catch (error) {
      console.error('Failed to create log directory:', error)
    }
  }

  private getDateString(): string {
    const now = new Date()
    return now.toISOString().split('T')[0] // YYYY-MM-DD format
  }

  private getTimestamp(): string {
    return new Date().toISOString()
  }

  private writeLog(level: LogLevel, message: string, data?: any): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR']
    const timestamp = this.getTimestamp()
    const logLevel = levelNames[level]
    
    let logEntry = `[${timestamp}] [${logLevel}] ${message}`
    
    if (data) {
      if (typeof data === 'object') {
        try {
          logEntry += ` | Data: ${JSON.stringify(data, null, 2)}`
        } catch (error) {
          logEntry += ` | Data: [Object - JSON.stringify failed: ${error}]`
        }
      } else {
        logEntry += ` | Data: ${data}`
      }
    }
    
    logEntry += '\n'

    try {
      // Write to console (visible in dev tools)
      console.log(`[${logLevel}] ${message}`, data || '')
      
      // Write to file
      fs.appendFileSync(this.logFile, logEntry, 'utf8')
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  private logStartup(): void {
    this.info('='.repeat(80))
    this.info('ClipPAilot Application Started')
    this.info(`Version: ${getVersionString()}`)
    this.info(`Environment: ${this.isDev ? 'Development' : 'Production'}`)
    this.info(`Platform: ${process.platform} ${process.arch}`)
    this.info(`Node.js: ${process.version}`)
    this.info(`Electron: ${process.versions.electron}`)
    this.info(`Working Directory: ${process.cwd()}`)
    this.info(`Log Directory: ${this.logDir}`)
    this.info(`Log File: ${this.logFile}`)
    this.info(`User: ${os.userInfo().username}`)
    this.info(`Hostname: ${os.hostname()}`)
    this.info('='.repeat(80))
  }

  public debug(message: string, data?: any): void {
    this.writeLog(LogLevel.DEBUG, message, data)
  }

  public info(message: string, data?: any): void {
    this.writeLog(LogLevel.INFO, message, data)
  }

  public warn(message: string, data?: any): void {
    this.writeLog(LogLevel.WARN, message, data)
  }

  public error(message: string, data?: any): void {
    this.writeLog(LogLevel.ERROR, message, data)
  }

  public logToolPaths(): void {
    this.info('Tool Path Information:')
    
    const toolsPath = this.isDev 
      ? path.join(process.cwd(), 'tools')
      : path.join(process.resourcesPath, 'tools')
    
    this.info(`Tools Directory: ${toolsPath}`)
    
    const ytDlpPath = path.join(toolsPath, 'yt-dlp', 'yt-dlp.exe')
    const ffmpegPath = path.join(toolsPath, 'ffmpeg', 'ffmpeg.exe')
    
    this.info(`yt-dlp Path: ${ytDlpPath}`)
    this.info(`yt-dlp Exists: ${fs.existsSync(ytDlpPath)}`)
    
    this.info(`ffmpeg Path: ${ffmpegPath}`)
    this.info(`ffmpeg Exists: ${fs.existsSync(ffmpegPath)}`)
    
    if (fs.existsSync(toolsPath)) {
      try {
        const toolsContents = fs.readdirSync(toolsPath, { recursive: true })
        this.info('Tools Directory Contents:', toolsContents)
      } catch (error) {
        this.error('Failed to read tools directory:', error)
      }
    }
  }

  public logSystemInfo(): void {
    this.info('System Information:')
    this.info(`OS: ${os.type()} ${os.release()}`)
    this.info(`Architecture: ${os.arch()}`)
    this.info(`CPU Count: ${os.cpus().length}`)
    this.info(`Total Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`)
    this.info(`Free Memory: ${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`)
    this.info(`Uptime: ${Math.round(os.uptime() / 3600)}h`)
  }

  public logEnvironmentVariables(): void {
    this.info('Environment Variables:')
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      DEV_SERVER_URL: process.env.DEV_SERVER_URL,
      YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY ? '[SET]' : '[NOT SET]',
      AI_STUDIO_API_KEY: process.env.AI_STUDIO_API_KEY ? '[SET]' : '[NOT SET]'
    }
    this.info('Relevant Environment Variables:', envVars)
  }

  public cleanup(): void {
    this.info('ClipPAilot Application Shutting Down')
    this.info('='.repeat(80))
  }
}

// Export singleton instance
export const logger = new Logger()
