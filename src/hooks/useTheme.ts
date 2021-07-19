import { useState, useEffect } from "react";

export const useDarkTheme = () => {
  const darkThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const [isDarkTheme, setIsDarkTheme] = useState(darkThemeMediaQuery.matches);

  useEffect(() => {
    const mediaQueryListener = (event: MediaQueryListEvent) => {
      setIsDarkTheme(event.matches);
    };

    darkThemeMediaQuery.addEventListener("change", mediaQueryListener);
    return () => {
      darkThemeMediaQuery.removeEventListener("change", mediaQueryListener);
    };
  }, [darkThemeMediaQuery, setIsDarkTheme]);

  return false;
  return isDarkTheme;
};
