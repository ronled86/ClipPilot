/**
 * ClipPAilot Version Information
 * Auto-generated version file - do not edit manually
 */

export const VERSION = {
  major: 1,
  minor: 0,
  patch: 12,
  build: 3,
  fullVersion: '1.0.12.3',
  buildDate: '2025-08-23T14:23:46.183Z',
  features: [
    'YouTube Search & Preview',
    'Intelligent Search Autocomplete',
    'Multi-format Downloads (MP3, MP4, AAC, FLAC, etc.)',
    'Custom Download Settings',
    'Real-time Download Progress',
    'Multilingual Support (English, Hebrew)',
    'License-aware Content Filtering',
    'Modern Electron + React Architecture'
  ]
} as const

export const getVersionString = (): string => {
  return VERSION.fullVersion
}

export const getBuildInfo = (): string => {
  return `Build ${VERSION.build} (${new Date(VERSION.buildDate).toLocaleDateString()})`
}

export const getAppInfo = () => ({
  name: 'ClipPAilot',
  version: VERSION.fullVersion,
  build: VERSION.build,
  buildDate: VERSION.buildDate,
  features: VERSION.features
})