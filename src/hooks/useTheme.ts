import { useEffect } from "react"
import { chromeProvider } from "../services/chromeProvider"

export const useDarkTheme = () => {
  const chrome = chromeProvider()
  const isDark = chrome.devtools.panels.themeName === "dark"

  // Switch out the css for highlight.js depending on the theme
  useEffect(() => {
    const darkThemeLink = document.getElementById("highlightjs-dark-theme")
    const lightThemeLink = document.getElementById("highlightjs-light-theme")

    if (isDark) {
      lightThemeLink?.setAttribute("disabled", "disabled")
      darkThemeLink?.removeAttribute("disabled")
    } else {
      darkThemeLink?.setAttribute("disabled", "disabled")
      lightThemeLink?.removeAttribute("disabled")
    }
  }, [isDark])

  return isDark
}
