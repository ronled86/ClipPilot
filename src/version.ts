/**
 * ClipPAilot Version Information
 * Auto-generated version file - do not edit manually
 */

export const VERSION = {
  major: 1,
  minor: 0,
  patch: 7,
  build: 1755953310388,
  tag: 'stable',
  fullVersion: '1.0.7',
  buildDate: '2025-08-23T12:48:30.388Z',
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
  return `${VERSION.fullVersion}-${VERSION.tag}`
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