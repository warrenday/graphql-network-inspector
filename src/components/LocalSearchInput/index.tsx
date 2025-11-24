import { useCallback, useEffect, useState } from 'react'
import { Textfield } from '../Textfield'
import { SearchIcon } from '../Icons/SearchIcon'
import { CloseIcon } from '../Icons/CloseIcon'
import { ChevronIcon } from '../Icons/ChevronIcon'

interface ILocalSearchInputProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  matchCount: number
  currentIndex: number
  onNext: () => void
  onPrevious: () => void
  onClose: () => void
}

export const LocalSearchInput = (props: ILocalSearchInputProps) => {
  const {
    searchQuery,
    onSearchChange,
    matchCount,
    currentIndex,
    onNext,
    onPrevious,
    onClose,
  } = props
  const [localValue, setLocalValue] = useState(searchQuery)

  useEffect(() => {
    setLocalValue(searchQuery)
  }, [searchQuery])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setLocalValue(value)
    onSearchChange(value)
  }

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        if (event.shiftKey) {
          onPrevious()
        } else {
          onNext()
        }
        event.preventDefault()
      } else if (event.key === 'Escape') {
        onClose()
        event.preventDefault()
      }
    },
    [onNext, onPrevious, onClose]
  )

  const hasMatches = matchCount > 0
  const displayCount = hasMatches
    ? `${currentIndex + 1} of ${matchCount}`
    : 'No matches'

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-3 py-2 pr-20 shadow-lg">
      <SearchIcon width="1rem" height="1rem" className="text-gray-500" />
      <Textfield
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Find in response"
        className="text-sm px-2 py-0.5 w-48 flex-1"
        testId="local-search-input"
        type="search"
        autoFocus
        name={'local-search'}
      />
      <div className="text-sm text-gray-600 dark:text-gray-400 min-w-[80px] text-center">
        {searchQuery && displayCount}
      </div>
      <button
        onClick={onPrevious}
        disabled={!hasMatches}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rotate-180"
        title="Previous match (Shift+Enter)"
        data-testid="search-previous"
      >
        <ChevronIcon width="1rem" height="1rem" />
      </button>
      <button
        onClick={onNext}
        disabled={!hasMatches}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Next match (Enter)"
        data-testid="search-next"
      >
        <ChevronIcon width="1rem" height="1rem" />
      </button>
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        title="Close (Esc)"
        data-testid="search-close"
      >
        <CloseIcon />
      </button>
    </div>
  )
}
