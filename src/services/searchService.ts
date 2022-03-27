import {
  getHeaderSearchContent,
  getRequestSearchContent,
  getResponseSearchContent,
} from "../helpers/getSearchContent"
import { NetworkRequest } from "../hooks/useNetworkMonitor"

export interface ISearchResult {
  matches: {
    request: boolean
    response: boolean
    headers: boolean
  }
  networkRequest: NetworkRequest
}

const isSearchMatch = (query: string, content: string) =>
  content.toLocaleLowerCase().includes(query)

export const getSearchResults = (
  searchQuery: string,
  networkRequests: NetworkRequest[]
): ISearchResult[] => {
  if (!searchQuery) {
    return []
  }

  const lowercaseSearchQuery = searchQuery.toLocaleLowerCase()
  return networkRequests
    .map((networkRequest) => {
      const matches: ISearchResult["matches"] = {
        request: isSearchMatch(
          lowercaseSearchQuery,
          getRequestSearchContent(networkRequest)
        ),
        response: isSearchMatch(
          lowercaseSearchQuery,
          getResponseSearchContent(networkRequest)
        ),
        headers: isSearchMatch(
          lowercaseSearchQuery,
          getHeaderSearchContent(networkRequest)
        ),
      }

      return {
        networkRequest,
        matches,
      }
    })
    .filter((searchResult) => Object.values(searchResult.matches).some(Boolean))
}

export const getSearchLineNumbers = (query: string, content: string) => {
  if (!query) return []
  const lowercaseQuery = query.toLocaleLowerCase()
  const lineNumbers = []
  for (const [lineIndex, line] of content.split("\n").entries()) {
    if (isSearchMatch(lowercaseQuery, line)) {
      lineNumbers.push(lineIndex + 1)
    }
  }
  return lineNumbers
}
