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
