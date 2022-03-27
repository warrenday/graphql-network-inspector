import { useEffect } from "react"

export const useWindowEvent = <K extends keyof WindowEventMap>(
  type: K,
  handler: (event: WindowEventMap[K]) => void
) => {
  useEffect(() => {
    window.addEventListener(type, handler)
    return () => window.removeEventListener(type, handler)
  }, [type, handler])
}
