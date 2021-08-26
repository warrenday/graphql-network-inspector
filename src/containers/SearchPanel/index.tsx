import React, { useMemo } from "react";
import { Textfield } from "../../components/Textfield";
import { NetworkRequest } from "../../hooks/useNetworkMonitor";
import { useSearch } from "../../hooks/useSearch";
import { getSearchResults, ISearchResult } from "../../services/searchService";
import { SearchResults, SearchResultType } from "./SearchResults";

interface ISearchPanelProps {
  networkRequests: NetworkRequest[];
  onResultClick: (
    searchResult: ISearchResult,
    searchResultType: SearchResultType
  ) => void;
}

export const SearchPanel = (props: ISearchPanelProps) => {
  const { networkRequests, onResultClick } = props;
  const { activeSearchQuery, searchQuery, setSearchQuery } = useSearch();
  const searchResults = useMemo(
    () => getSearchResults(activeSearchQuery, networkRequests),
    [activeSearchQuery, networkRequests]
  );

  return (
    <div className="flex flex-col h-full border-r border-gray-300 dark:border-gray-600">
      <div className="p-2">
        <Textfield
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search"
          autoFocus
          className="w-full"
        />
      </div>
      {searchResults && (
        <div className="scroll overflow-y-scroll">
          <SearchResults
            searchQuery={activeSearchQuery}
            searchResults={searchResults}
            onResultClick={onResultClick}
          />
        </div>
      )}
    </div>
  );
};
