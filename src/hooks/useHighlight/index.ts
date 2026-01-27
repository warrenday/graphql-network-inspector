import { useEffect, useState } from "react"
import hljs from "highlight.js"

type Language = "json" | "graphql"

export interface MessagePayload {
  language: Language
  code: string
}

/** Minimum code length before offloading to worker thread */
const WORKER_THRESHOLD_CHARS = 500

/** Timeout in ms for worker operations before falling back to unhighlighted content */
const WORKER_TIMEOUT_MS = 5000

const createWorker = () => {
  try {
    return new Worker(new URL("./worker.ts", import.meta.url))
  } catch (e) {
    return undefined
  }
}

/**
 * Highlight the text in a worker thread and return the resulting markup.
 * This provides a performant async way to render the given text.
 *
 * For code blocks smaller than WORKER_THRESHOLD_CHARS, highlighting is done
 * on the main thread. Larger blocks use a Web Worker with a timeout fallback
 * to prevent the UI from hanging on very large or complex code.
 *
 * @param language the language to highlight against (json or graphql)
 * @param code the code to highlight
 * @returns Object containing the highlighted markup and loading state
 */
export const useHighlight = (language: Language, code: string) => {
  const [loading, setLoading] = useState(false)
  const [markup, setMarkup] = useState("")

  useEffect(() => {
    const highlightOnMainThread = () => {
      try {
        const result = hljs.highlight(code, { language })
        setMarkup(result.value)
      } catch (error) {
        // On highlighting error, fall back to escaped plain text
        console.error('Error highlighting code:', error)
        setMarkup(escapeHtml(code))
      }
      setLoading(false)
    }

    // Fall back to unhighlighted content (escaped for safe HTML rendering)
    const fallbackToUnhighlighted = () => {
      setMarkup(escapeHtml(code))
      setLoading(false)
    }

    // Highlight small code blocks in the main thread
    if (code.length < WORKER_THRESHOLD_CHARS) {
      highlightOnMainThread()
      return
    }

    // Highlight large code blocks in a worker thread
    const worker = createWorker()
    if (!worker) {
      highlightOnMainThread()
      return
    }

    let isCompleted = false

    // Set up timeout to terminate stale workers
    const timeoutId = setTimeout(() => {
      if (!isCompleted) {
        console.warn('Syntax highlighting worker timed out, falling back to unhighlighted content')
        isCompleted = true
        worker.terminate()
        fallbackToUnhighlighted()
      }
    }, WORKER_TIMEOUT_MS)

    worker.onmessage = (event) => {
      if (!isCompleted) {
        isCompleted = true
        clearTimeout(timeoutId)
        setLoading(false)
        setMarkup(event.data)
      }
    }

    worker.onerror = (error) => {
      if (!isCompleted) {
        console.error('Worker error:', error)
        isCompleted = true
        clearTimeout(timeoutId)
        worker.terminate()
        fallbackToUnhighlighted()
      }
    }

    setLoading(true)
    const messagePayload: MessagePayload = { language, code }
    worker.postMessage(messagePayload)

    return () => {
      if (!isCompleted) {
        isCompleted = true
        clearTimeout(timeoutId)
      }
      worker.terminate()
    }
  }, [setLoading, setMarkup, language, code])

  return { markup, loading }
}

/**
 * Escape HTML special characters to prevent XSS when displaying unhighlighted code
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
