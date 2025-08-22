import { contextBridge, ipcRenderer } from 'electron'

const api = {
  search: async (q: string, apiKey?: string, enhancedSearch?: boolean) => {
    if (!q || q.trim().length === 0) {
      throw new Error('Search query cannot be empty')
    }
    return ipcRenderer.invoke('search', q, apiKey, enhancedSearch)
  },
  searchMore: async (q: string, pageToken: string, apiKey?: string, enhancedSearch?: boolean) => {
    if (!q || q.trim().length === 0) {
      throw new Error('Search query cannot be empty')
    }
    return ipcRenderer.invoke('search-more', q, pageToken, apiKey, enhancedSearch)
  },
  getTrending: async (apiKey?: string, enhancedSearch?: boolean) => ipcRenderer.invoke('get-trending', apiKey, enhancedSearch),
  getMoreTrending: async (apiKey?: string, offset?: number) => ipcRenderer.invoke('get-more-trending', apiKey, offset),
  getYoutubeSuggestions: async (query: string) => ipcRenderer.invoke('get-youtube-suggestions', query),
  getFormats: async (id: string) => ipcRenderer.invoke('get-formats', id),
  canDownload: async (id: string) => ipcRenderer.invoke('can-download', id),
  enqueueDownload: async (id: string, opts: any) => ipcRenderer.invoke('enqueue-download', id, opts),
  previewVideo: async (id: string) => ipcRenderer.invoke('preview-video', id),
  selectFolder: async () => ipcRenderer.invoke('select-folder'),
  getSettings: async () => ipcRenderer.invoke('get-settings'),
  saveSettings: async (settings: any) => ipcRenderer.invoke('save-settings', settings),
  openFolder: async (filePath: string) => ipcRenderer.invoke('open-folder', filePath),
  onProgress: (cb: (ev: any) => void) => {
    const listener = (_e: any, data: any) => cb(data)
    ipcRenderer.on('job-progress', listener)
    return () => ipcRenderer.removeListener('job-progress', listener)
  }
}

contextBridge.exposeInMainWorld('clippilot', api)
export type Api = typeof api
declare global {
  interface Window { clippilot: Api }
}