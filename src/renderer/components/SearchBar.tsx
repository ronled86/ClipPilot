import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// Common fallback suggestions for music/video content
const FALLBACK_SUGGESTIONS = [
  'music', 'tutorial', 'podcast', 'live', 'interview', 'cover', 'remix', 'acoustic',
  'piano', 'guitar', 'vocals', 'instrumental', 'beats', 'mix', 'playlist', 'album',
  'song', 'video', 'documentary', 'review', 'gameplay', 'trailer', 'news', 'comedy',
  'education', 'lecture', 'course', 'how to', 'DIY', 'cooking', 'fitness', 'travel'
]

export default function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const { t } = useTranslation()
  const [q, setQ] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [youtubeSuggestions, setYoutubeSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load search history from localStorage on component mount
  useEffect(() => {
    const history = localStorage.getItem('clippilot-search-history')
    if (history) {
      try {
        setSearchHistory(JSON.parse(history))
      } catch (e) {
        console.warn('Failed to parse search history:', e)
      }
    }
  }, [])

  // Save search to history
  const saveToHistory = (query: string) => {
    if (!query.trim() || query.length < 2) return
    
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 20)
    setSearchHistory(newHistory)
    localStorage.setItem('clippilot-search-history', JSON.stringify(newHistory))
  }

  // Fetch YouTube search suggestions
  const fetchYoutubeSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setYoutubeSuggestions([])
      return
    }

    setLoadingSuggestions(true)
    try {
      // Use YouTube's autocomplete API
      const response = await fetch(`https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`)
      const text = await response.text()
      
      // Parse JSONP response
      const jsonStart = text.indexOf('(') + 1
      const jsonEnd = text.lastIndexOf(')')
      const jsonStr = text.substring(jsonStart, jsonEnd)
      const data = JSON.parse(jsonStr)
      
      // Extract suggestions from the response
      const suggestions = data[1]?.map((item: any) => item[0]).filter((item: string) => item && item !== query) || []
      setYoutubeSuggestions(suggestions.slice(0, 6)) // Limit to 6 suggestions
    } catch (error) {
      console.warn('Failed to fetch YouTube suggestions:', error)
      setYoutubeSuggestions([])
    } finally {
      setLoadingSuggestions(false)
    }
  }

  // Generate suggestions based on input
  const generateSuggestions = (input: string) => {
    if (!input.trim() || input.length < 2) {
      setSuggestions([])
      return
    }

    const query = input.toLowerCase()
    
    // Get history suggestions
    const historySuggestions = searchHistory.filter(item => 
      item.toLowerCase().includes(query) && item.toLowerCase() !== query
    )
    
    // Get fallback suggestions
    const fallbackSuggestions = FALLBACK_SUGGESTIONS.filter((item: string) =>
      item.toLowerCase().startsWith(query) || item.toLowerCase().includes(query)
    )

    // Combine YouTube suggestions, history, and fallback suggestions
    const allSuggestions = [
      ...youtubeSuggestions,
      ...historySuggestions.filter(item => !youtubeSuggestions.includes(item)),
      ...fallbackSuggestions.filter(item => 
        !youtubeSuggestions.includes(item) && 
        !historySuggestions.includes(item)
      )
    ].slice(0, 8) // Limit total suggestions

    setSuggestions(allSuggestions)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQ(value)
    setShowSuggestions(true)
    setSelectedIndex(-1)
    
    // Clear previous debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    // Generate immediate suggestions from history and fallback
    generateSuggestions(value)
    
    // Debounce YouTube API calls
    if (value.length >= 2) {
      debounceTimeoutRef.current = setTimeout(() => {
        fetchYoutubeSuggestions(value).then(() => {
          // Regenerate suggestions after YouTube results come back
          generateSuggestions(value)
        })
      }, 300) // 300ms debounce
    } else {
      setYoutubeSuggestions([])
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1)
        break
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault()
          const selectedSuggestion = suggestions[selectedIndex]
          setQ(selectedSuggestion)
          setShowSuggestions(false)
          saveToHistory(selectedSuggestion)
          onSearch(selectedSuggestion)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
      case 'Tab':
        if (selectedIndex >= 0) {
          e.preventDefault()
          setQ(suggestions[selectedIndex])
          setShowSuggestions(false)
        }
        break
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQ(suggestion)
    setShowSuggestions(false)
    saveToHistory(suggestion)
    onSearch(suggestion)
    inputRef.current?.focus()
  }

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) {
      saveToHistory(q.trim())
      onSearch(q.trim())
      setShowSuggestions(false)
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      // Cleanup debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative w-full">
      <form className="flex items-center gap-2 w-full" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            className="w-full rounded-xl border px-4 py-2 outline-none focus:ring focus:ring-blue-200 focus:border-blue-400"
            placeholder={t('search_placeholder')}
            value={q}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => q.length >= 2 && setShowSuggestions(true)}
            autoComplete="off"
            spellCheck="false"
          />
          
          {/* Suggestions dropdown */}
          {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
            >
              {loadingSuggestions && suggestions.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Loading YouTube suggestions...
                </div>
              )}
              
              {suggestions.map((suggestion, index) => {
                const isYoutubeSuggestion = youtubeSuggestions.includes(suggestion)
                const isHistorySuggestion = searchHistory.includes(suggestion)
                
                return (
                  <div
                    key={suggestion}
                    className={`px-4 py-2 cursor-pointer text-sm flex items-center justify-between hover:bg-gray-50 ${
                      index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className="flex-1">{suggestion}</span>
                    <div className="flex items-center gap-1 ml-2">
                      {isYoutubeSuggestion && (
                        <span className="text-xs text-red-500">🎥 YouTube</span>
                      )}
                      {isHistorySuggestion && !isYoutubeSuggestion && (
                        <span className="text-xs text-gray-400">📝 History</span>
                      )}
                      {!isYoutubeSuggestion && !isHistorySuggestion && (
                        <span className="text-xs text-blue-400">💡 Suggestion</span>
                      )}
                    </div>
                  </div>
                )
              })}
              
              {/* Helpful hint */}
              <div className="px-4 py-2 text-xs text-gray-500 border-t bg-gray-50">
                💡 Use ↑↓ to navigate, Tab to complete, Enter to search
                {loadingSuggestions && <span className="ml-2">• Loading more suggestions...</span>}
              </div>
            </div>
          )}
        </div>
        
        <button 
          className="rounded-xl px-4 py-2 border hover:bg-gray-50 transition-colors" 
          type="submit"
          title="Search"
        >
          🔎
        </button>
      </form>
    </div>
  )
}