import { INetworkRequest } from "@/helpers/networkHelpers"
import {
  getHeaderSearchContent,
  getRequestSearchContent,
  getResponseSearchContent,
} from "@/helpers/getSearchContent"

export interface ISearchResult {
  matches: {
    request: boolean
    response: boolean
    headers: boolean
  }
  networkRequest: INetworkRequest
}

const getMatchedHeaders = (
  searchQuery: string,
  networkRequests: INetworkRequest
): boolean => {
  return getHeaderSearchContent(networkRequests)
    .toLowerCase()
    .includes(searchQuery.toLowerCase())
}

const getMatchedRequest = (
  searchQuery: string,
  networkRequests: INetworkRequest
): boolean => {
  return getRequestSearchContent(networkRequests)
    .toLowerCase()
    .includes(searchQuery.toLowerCase())
}

const getMatchedResponse = (
  searchQuery: string,
  networkRequests: INetworkRequest
): boolean => {
  return getResponseSearchContent(networkRequests)
    .toLowerCase()
    .includes(searchQuery.toLowerCase())
}

export const getSearchResults = (
  searchQuery: string,
  networkRequests: INetworkRequest[]
): ISearchResult[] => {
  if (!searchQuery) {
    return []
  }

  const lowercaseSearchQuery = searchQuery.toLocaleLowerCase()
  return networkRequests
    .map((networkRequest) => {
      const matches: ISearchResult["matches"] = {
        request: getMatchedRequest(lowercaseSearchQuery, networkRequest),
        response: getMatchedResponse(lowercaseSearchQuery, networkRequest),
        headers: getMatchedHeaders(lowercaseSearchQuery, networkRequest),
      }

      return {
        networkRequest,
        matches,
      }
    })
    .filter((searchResult) => {
      return Object.values(searchResult.matches).some(Boolean)
    })
}
