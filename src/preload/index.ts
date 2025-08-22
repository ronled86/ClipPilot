import { contextBridge, ipcRenderer } from 'electron'

const api = {
  search: async (q: string) => {
    if (!q || q.trim().length === 0) {
      throw new Error('Search query cannot be empty')
    }
    return ipcRenderer.invoke('search', q)
  },
  searchMore: async (q: string, pageToken: string) => {
    if (!q || q.trim().length === 0) {
      throw new Error('Search query cannot be empty')
    }
    return ipcRenderer.invoke('search-more', q, pageToken)
  },
  getTrending: async () => ipcRenderer.invoke('get-trending'),
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