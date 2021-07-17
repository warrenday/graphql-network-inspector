import { chromeProvider } from "./chromeProvider";

const chrome = chromeProvider();

export const onRequestFinished = (
  cb: (e: chrome.devtools.network.Request) => void
) => {
  chrome.devtools.network.onRequestFinished.addListener(cb);
  return () => {
    chrome.devtools.network.onRequestFinished.removeListener(cb);
  };
};

export const onNavigate = (cb: () => void) => {
  chrome.devtools.network.onNavigated.addListener(cb);
  return () => {
    chrome.devtools.network.onNavigated.removeListener(cb);
  };
};
