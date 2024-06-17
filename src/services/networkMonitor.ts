import { chromeProvider } from './chromeProvider'

export const getHAR = async (): Promise<chrome.devtools.network.HARLog> => {
  const chrome = chromeProvider()
  return new Promise((resolve) => {
    chrome.devtools.network.getHAR((harLog) => {
      resolve(harLog)
    })
  })
}

export const onBeforeRequest = (
  cb: (e: chrome.webRequest.WebRequestBodyDetails) => void
) => {
  const chrome = chromeProvider()
  const currentTabId = chrome.devtools.inspectedWindow.tabId

  chrome.webRequest.onBeforeRequest.addListener(
    cb,
    { urls: ['<all_urls>'], tabId: currentTabId },
    ['requestBody']
  )
  return () => {
    chrome.webRequest.onBeforeRequest.removeListener(cb)
  }
}

export const onBeforeSendHeaders = (
  cb: (e: chrome.webRequest.WebRequestHeadersDetails) => void
) => {
  const chrome = chromeProvider()
  const currentTabId = chrome.devtools.inspectedWindow.tabId

  chrome.webRequest.onBeforeSendHeaders.addListener(
    cb,
    { urls: ['<all_urls>'], tabId: currentTabId },
    ['requestHeaders']
  )
  return () => {
    chrome.webRequest.onBeforeSendHeaders.removeListener(cb)
  }
}

export const onRequestFinished = (
  cb: (e: chrome.devtools.network.Request) => void
) => {
  const chrome = chromeProvider()

  chrome.devtools.network.onRequestFinished.addListener(cb)
  return () => {
    chrome.devtools.network.onRequestFinished.removeListener(cb)
  }
}

export const onNavigate = (cb: () => void) => {
  const chrome = chromeProvider()
  chrome.devtools.network.onNavigated.addListener(cb)
  return () => {
    chrome.devtools.network.onNavigated.removeListener(cb)
  }
}

// Can I get request body in webrequest event?
// If so, can just match on headers, method, body.
// Just associate first response where match, is found.
