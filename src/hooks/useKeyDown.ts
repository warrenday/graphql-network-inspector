import { useEffect } from "react"

type Code = "ArrowDown" | "ArrowUp" | "Enter"

export const useKeyDown = (code: Code, cb: (e: KeyboardEvent) => void) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === code) {
        cb(event)
      }
    }
    window.addEventListener("keydown", handleKeyPress)

    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [code, cb])
}
