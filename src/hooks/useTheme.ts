import { chromeProvider } from "../services/chromeProvider";

export const useDarkTheme = () => {
  const chrome = chromeProvider();
  return chrome.devtools.panels.themeName === "dark";
};
