import { useCallback, useEffect, useRef } from "react"
import Mark from "mark.js"
import { useSearch } from "./useSearch"

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
