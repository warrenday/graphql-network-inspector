import { useMemo, useState, useEffect, useCallback } from 'react'
import * as safeJson from '@/helpers/safeJson'
import { CopyButton } from '@/components/CopyButton'
import { CodeView } from '@/components/CodeView'
import { ShareButton } from '../../../components/ShareButton'
import { LocalSearchInput } from '@/components/LocalSearchInput'

interface IResponseRawViewProps {
  response?: string
  onShare?: () => void
}

const useFormatResponse = (response?: string): string => {
  return useMemo(() => {
    if (!response) {
      return '{}'
    }

    // We remove the "extensions" prop as this is just meta data
    // for things like "tracing" and can be huge in size.
    const parsedResponse = safeJson.parse<{ extensions?: string }>(response)
    if (!parsedResponse) {
      return ''
    }

    if ('extensions' in parsedResponse) {
      delete parsedResponse['extensions']
    }

    return safeJson.stringify(parsedResponse, undefined, 2)
  }, [response])
}

export const ResponseRawView = (props: IResponseRawViewProps) => {
  const { response, onShare } = props
  const formattedJson = useFormatResponse(response)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{
    matchCount: number
    currentIndex: number
    goToNext: () => void
    goToPrevious: () => void
  }>({
    matchCount: 0,
    currentIndex: 0,
    goToNext: () => {},
    goToPrevious: () => {},
  })

  // Handle Cmd/Ctrl+F to open search - using same pattern as useSearchStart
  useEffect(() => {
    const getIsCommandKeyPressed = (event: KeyboardEvent) => {
      return event.code === 'MetaLeft' || event.code === 'ControlLeft'
    }

    let isCommandKeyPressed = false

    const handleKeyDown = (event: KeyboardEvent) => {
      if (getIsCommandKeyPressed(event)) {
        isCommandKeyPressed = true
      } else if (event.code === 'KeyF' && isCommandKeyPressed) {
        event.preventDefault()
        event.stopPropagation()
        setIsSearchOpen(true)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (getIsCommandKeyPressed(event)) {
        isCommandKeyPressed = false
      }
    }

    document.addEventListener('keydown', handleKeyDown, true) // Use capture phase
    document.addEventListener('keyup', handleKeyUp, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('keyup', handleKeyUp, true)
    }
  }, [])

  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false)
    setSearchQuery('')
  }, [])

  const handleSearchResults = useCallback(
    (results: {
      matchCount: number
      currentIndex: number
      goToNext: () => void
      goToPrevious: () => void
    }) => {
      setSearchResults(results)
    },
    []
  )

  return (
    <>
      <div className="relative p-4">
        <div className="absolute right-3 top-3 z-10 flex gap-2">
          {onShare && <ShareButton onClick={onShare} />}
          <CopyButton textToCopy={formattedJson} />
        </div>
        <CodeView
          text={formattedJson}
          language={'json'}
          className="p-4"
          searchQuery={isSearchOpen ? searchQuery : undefined}
          onSearchResults={handleSearchResults}
        />
      </div>
      {isSearchOpen && (
        <div className="absolute left-0 bottom-0 z-10 w-full">
          <LocalSearchInput
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            matchCount={searchResults.matchCount}
            currentIndex={searchResults.currentIndex}
            onNext={searchResults.goToNext}
            onPrevious={searchResults.goToPrevious}
            onClose={handleSearchClose}
          />
        </div>
      )}
    </>
  )
}
