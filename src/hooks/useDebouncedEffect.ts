import { useEffect } from "react"

export const useDebouncedEffect = (
  cb: () => void,
  deps: any[],
  delay = 300
) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      cb()
    }, delay)

    return () => {
      clearTimeout(timeout)
    }
  }, [cb, delay, ...deps])
}
