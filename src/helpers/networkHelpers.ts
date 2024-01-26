const isNetworkRequest = (
  details:
    | chrome.devtools.network.Request
    | chrome.webRequest.WebRequestBodyDetails
): details is chrome.devtools.network.Request => {
  return details.hasOwnProperty("response")
}

const getRequestBodyFromWebRequestBodyDetails = (
  details: chrome.webRequest.WebRequestBodyDetails
) => {
  // TODO i think there is different encoding if it is a form data request
  // so we need to test and handle.

  if (details.method === "GET") {
    return "" // TODO parse url
  } else {
    const rawBody = details.requestBody?.raw?.[0]?.bytes
    const decoder = new TextDecoder("utf-8")
    const body = rawBody ? decoder.decode(rawBody) : undefined
    return body
  }
}

const getRequestBodyFromNetworkRequest = (
  details: chrome.devtools.network.Request
) => {
  if (details.request.method === "GET") {
    return "" // TODO parse get request
  } else {
    const body = details.request.postData?.text
    return body
  }
}

export const getRequestBody = (
  details:
    | chrome.devtools.network.Request
    | chrome.webRequest.WebRequestBodyDetails
) => {
  if (isNetworkRequest(details)) {
    return getRequestBodyFromNetworkRequest(details)
  } else {
    return getRequestBodyFromWebRequestBodyDetails(details)
  }
}

export const matchWebAndNetworkRequest = (
  webRequest: chrome.webRequest.WebRequestBodyDetails,
  networkRequest: chrome.devtools.network.Request
) => {
  const webRequestBody = getRequestBodyFromWebRequestBodyDetails(webRequest)
  const networkRequestBody = getRequestBodyFromNetworkRequest(networkRequest)

  const isMethodMatch = webRequest.method === networkRequest.request.method
  const isBodyMatch = webRequestBody === networkRequestBody
  const isUrlMatch = webRequest.url === networkRequest.request.url
  // TODO can we match on request headers???
  // const isHeaderMatch = webRequest.requestHeaders === networkRequest.request.headers

  return isMethodMatch && isBodyMatch && isUrlMatch
}
