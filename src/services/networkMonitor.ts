import { chromeProvider } from "./chromeProvider";

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
