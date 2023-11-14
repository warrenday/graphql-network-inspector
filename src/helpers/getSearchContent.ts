import { stringify } from "./safeJson"
import { IHeader, INetworkRequest } from "../hooks/useNetworkMonitor"

const stringifyHeaders = (headers: IHeader[] = []) => {
  return headers
    .map((header) => {
      return `${header.name}: ${header.value}`
    })
    .join(", ")
}

export const getHeaderSearchContent = (
  networkRequest: INetworkRequest
): string => {
  const requestHeaderText = stringifyHeaders(networkRequest.request.headers)
  const responseHeaderText = stringifyHeaders(networkRequest.response?.headers)
  return [requestHeaderText, responseHeaderText].join(", ")
}

export const getRequestSearchContent = (
  networkRequest: INetworkRequest
): string => {
  return networkRequest.request.body
    .map((body) => {
      return body.query + " " + stringify(body.variables)
    })
    .join(", ")
}

export const getResponseSearchContent = (
  networkRequest: INetworkRequest
): string => {
  return networkRequest.response?.body || ""
}
