import {
  getHeaderSearchContent,
  getRequestSearchContent,
  getResponseSearchContent,
} from "../helpers/getSearchContent";
import { NetworkRequest } from "../hooks/useNetworkMonitor";

export interface ISearchResult {
  matches: {
    request: boolean;
    response: boolean;
    headers: boolean;
  };
  networkRequest: NetworkRequest;
}

const getMatchedHeaders = (
  searchQuery: string,
  networkRequests: NetworkRequest
): boolean => {
  return getHeaderSearchContent(networkRequests)
    .toLowerCase()
    .includes(searchQuery.toLowerCase());
};

const getMatchedRequest = (
  searchQuery: string,
  networkRequests: NetworkRequest
): boolean => {
  return getRequestSearchContent(networkRequests)
    .toLowerCase()
    .includes(searchQuery.toLowerCase());
};

const getMatchedResponse = (
  searchQuery: string,
  networkRequests: NetworkRequest
): boolean => {
  return getResponseSearchContent(networkRequests)
    .toLowerCase()
    .includes(searchQuery.toLowerCase());
};

export const getSearchResults = (
  searchQuery: string,
  networkRequests: NetworkRequest[]
): ISearchResult[] => {
  if (!searchQuery) {
    return [];
  }

  const lowercaseSearchQuery = searchQuery.toLocaleLowerCase();
  return networkRequests
    .map((networkRequest) => {
      const matches: ISearchResult["matches"] = {
        request: getMatchedRequest(lowercaseSearchQuery, networkRequest),
        response: getMatchedResponse(lowercaseSearchQuery, networkRequest),
        headers: getMatchedHeaders(lowercaseSearchQuery, networkRequest),
      };

      return {
        networkRequest,
        matches,
      };
    })
    .filter((searchResult) => {
      return Object.values(searchResult.matches).some(Boolean);
    });
};
