import { chromeProvider } from "./chromeProvider";

// On first load of app, try to get previous network activity
// No requests would have loaded at this point?
// Do we need to check against existing requests to avoid duplication?

export const getHAR = async (): Promise<chrome.devtools.network.HARLog> => {
  const chrome = chromeProvider();
  return new Promise((resolve) => {
    chrome.devtools.network.getHAR((harLog) => {
      resolve(harLog);
    });
  });
};

export const onRequestFinished = (
  cb: (e: chrome.devtools.network.Request) => void
) => {
  const chrome = chromeProvider();

  chrome.devtools.network.onRequestFinished.addListener(cb);
  return () => {
    chrome.devtools.network.onRequestFinished.removeListener(cb);
  };
};

export const onNavigate = (cb: () => void) => {
  const chrome = chromeProvider();
  chrome.devtools.network.onNavigated.addListener(cb);
  return () => {
    chrome.devtools.network.onNavigated.removeListener(cb);
  };
};
