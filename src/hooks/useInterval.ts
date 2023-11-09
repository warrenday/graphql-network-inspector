import { useEffect } from "react"

const defaultOptions = { isRunning: true }

/**
 * Call a function every `ms` milliseconds. Ensure
 * the callback given is memoized with useCallback.
 *
 */
const useInterval = (
  cb: () => void,
  ms: number,
  options: { isRunning: boolean } = defaultOptions
) => {
  const { isRunning } = options

  // Run once on mount
  useEffect(() => {
    if (!isRunning) {
      return
    }

    const run = async () => {
      await cb()
    }
    run()
  }, [cb, isRunning])

  // Run every `ms` milliseconds
  useEffect(() => {
    let timer: ReturnType<typeof window.setTimeout>
    const run = () => {
      if (!isRunning) {
        return
      }

      timer = setTimeout(async () => {
        await cb()
        run()
      }, ms)
    }
    run()

    return () => clearTimeout(timer)
  }, [cb, ms, isRunning])
}

export default useInterval
