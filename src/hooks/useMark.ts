import { useCallback, useEffect, useRef, useState } from 'react'
import Mark from 'mark.js'
import { useSearch } from './useSearch'

/**
 * Mark given text.
 * @param content Optional content to listen for changes to causing mark to re-run.
 *
 * @returns ref to the element to mark
 */
export const useMark = (
  searchQuery: string,
  content?: string,
  done?: () => void
) => {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const mark = new Mark(ref.current)
    mark.mark(searchQuery, {
      caseSensitive: false,
      separateWordSearch: false,
      done: () => done?.(),
    })

    return () => {
      mark.unmark()
    }
  }, [ref, searchQuery, content, done])

  return ref
}

/**
 * Mark text that has been searched from the search provider.
 *
 * @param content Optional string to cause mark to re-run when changed.
 *
 * @returns ref to the element to mark
 */
export const useMarkSearch = (content?: string) => {
  const { searchQuery } = useSearch()

  // Once mark is complete we can jump to the first result
  const onMarkDone = useCallback(() => {
    const element = document.querySelector('mark[data-markjs="true"]')
    element?.scrollIntoView()
  }, [])

  const ref = useMark(searchQuery, content, onMarkDone)

  return ref
}

/**
 * Mark text with local search functionality including match tracking and navigation.
 *
 * @param searchQuery The search query to mark
 * @param content Optional content to listen for changes to causing mark to re-run.
 *
 * @returns ref to the element to mark, match count, current index, and navigation functions
 */
export const useLocalMark = (searchQuery: string, content?: string) => {
  const ref = useRef<HTMLElement>(null)
  const [matchCount, setMatchCount] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)

  const scrollToCurrentMark = useCallback((index: number) => {
    const marks = document.querySelectorAll('mark[data-markjs="true"]')
    if (marks.length > 0 && index >= 0 && index < marks.length) {
      // Remove highlight from all marks
      marks.forEach((mark) => {
        mark.classList.remove('bg-yellow-400', 'dark:bg-yellow-600')
        mark.classList.add('bg-yellow-200', 'dark:bg-yellow-800')
      })

      // Highlight current mark
      const currentMark = marks[index]
      currentMark.classList.remove('bg-yellow-200', 'dark:bg-yellow-800')
      currentMark.classList.add('bg-yellow-400', 'dark:bg-yellow-600')
      currentMark.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  useEffect(() => {
    if (!ref.current || !searchQuery) {
      setMatchCount(0)
      setCurrentIndex(0)
      return
    }

    const mark = new Mark(ref.current)
    mark.mark(searchQuery, {
      caseSensitive: false,
      separateWordSearch: false,
      className: 'bg-yellow-200 dark:bg-yellow-800',
      done: () => {
        const marks = document.querySelectorAll('mark[data-markjs="true"]')
        setMatchCount(marks.length)
        if (marks.length > 0) {
          setCurrentIndex(0)
          scrollToCurrentMark(0)
        }
      },
    })

    return () => {
      mark.unmark()
    }
  }, [ref, searchQuery, content, scrollToCurrentMark])

  const goToNext = useCallback(() => {
    if (matchCount === 0) return
    const nextIndex = (currentIndex + 1) % matchCount
    setCurrentIndex(nextIndex)
    scrollToCurrentMark(nextIndex)
  }, [currentIndex, matchCount, scrollToCurrentMark])

  const goToPrevious = useCallback(() => {
    if (matchCount === 0) return
    const prevIndex = currentIndex === 0 ? matchCount - 1 : currentIndex - 1
    setCurrentIndex(prevIndex)
    scrollToCurrentMark(prevIndex)
  }, [currentIndex, matchCount, scrollToCurrentMark])

  return {
    ref,
    matchCount,
    currentIndex,
    goToNext,
    goToPrevious,
  }
}
