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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalResults, setTotalResults] = useState(0)

  // Add mark to set current index as different color
  useEffect(() => {
    const elements = document.querySelectorAll('mark[data-markjs="true"]')
    if (!elements.length) {
      return
    }

    const currentElement = elements[currentIndex]
    if (!currentElement) {
      return
    }

    // Remove all existing data-markjs-current attributes
    elements.forEach((element) => {
      element.removeAttribute('data-markjs-current')
    })

    // Add data-markjs-current attribute to the current element
    currentElement.setAttribute('data-markjs-current', 'true')
  }, [currentIndex])

  // Once mark is complete we can jump to the first result
  const onMarkDone = useCallback(() => {
    const elements = document.querySelectorAll('mark[data-markjs="true"]')
    if (!elements.length) {
      return
    }

    const firstResult = elements[0]
    if (!firstResult) {
      return
    }

    setCurrentIndex(0)
    firstResult.scrollIntoView()
    setTotalResults(elements.length)
  }, [])

  const jumpToSibling = useCallback(
    (direction: 'next' | 'previous') => {
      const elements = document.querySelectorAll('mark[data-markjs="true"]')
      if (!elements.length) {
        return
      }

      const nextIndex =
        direction === 'next' ? currentIndex + 1 : currentIndex - 1
      const nextElement = elements[nextIndex]
      if (!nextElement) {
        return
      }

      setCurrentIndex(nextIndex)
      nextElement.scrollIntoView()
    },
    [currentIndex]
  )

  const jumpToNext = useCallback(() => {
    jumpToSibling('next')
  }, [jumpToSibling])

  const jumpToPrevious = useCallback(() => {
    jumpToSibling('previous')
  }, [jumpToSibling])

  const ref = useMark(searchQuery, content, onMarkDone)

  return { ref, currentIndex, totalResults, jumpToNext, jumpToPrevious }
}
