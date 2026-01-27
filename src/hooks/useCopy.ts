import { useEffect, useState } from "react"
import copy from "copy-to-clipboard"

/** Duration in ms to show "Copied!" feedback before resetting */
const COPY_FEEDBACK_DURATION_MS = 1000

const useCopy = () => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS)

      return () => {
        clearTimeout(timeout)
      }
    }
  }, [copied])

  return {
    isCopied: copied,
    copy: (text: string) => {
      setCopied(true)
      copy(text)
    },
  }
}

export default useCopy
