import { NetworkRequest } from "../hooks/useNetworkMonitor";

export interface ISearchResult {
  matches: {
    request: boolean;
    response: boolean;
    headers: boolean;
  };
  networkRequest: NetworkRequest;
}

const getMatchedRequest = (
  searchQuery: string,
  networkRequests: NetworkRequest
): boolean => {
  return networkRequests.request.body.some((requestBody) => {
    return (
      requestBody.query.toLocaleLowerCase().includes(searchQuery) ||
      JSON.stringify(requestBody.variables)
        .toLocaleLowerCase()
        .includes(searchQuery)
    );
  });
};

const getMatchedResponse = (
  searchQuery: string,
  networkRequests: NetworkRequest
): boolean => {
  const responseBody = networkRequests.response?.body || "";
  return responseBody.toLocaleLowerCase().includes(searchQuery);
};

const getMatchedHeaders = (
  searchQuery: string,
  networkRequests: NetworkRequest
): boolean => {
  return (
    JSON.stringify(networkRequests.request.headers)
      .toLowerCase()
      .includes(searchQuery) ||
    JSON.stringify(networkRequests.response?.headers || {})
      .toLowerCase()
      .includes(searchQuery)
  );
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
