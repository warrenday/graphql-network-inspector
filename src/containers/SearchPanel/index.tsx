import React, { useMemo, useState } from "react";
import { Textfield } from "../../components/Textfield";
import { useKeyDown } from "../../hooks/useKeyDown";
import { NetworkRequest } from "../../hooks/useNetworkMonitor";
import { useSearch } from "../../hooks/useSearch";
import { NetworkTabs } from "../../hooks/useNetworkTabs";
import { getSearchResults, ISearchResult } from "../../services/searchService";
import { SearchResults } from "./SearchResults";
import { Header } from "../../components/Header";
import { CloseButton } from "../../components/CloseButton";

interface ISearchPanelProps {
  networkRequests: NetworkRequest[];
  onResultClick: (
    searchResult: ISearchResult,
    searchResultType: NetworkTabs
  ) => void;
}

export const SearchPanel = (props: ISearchPanelProps) => {
  const { networkRequests, onResultClick } = props;
  const [searchInput, setSearchInput] = useState("");
  const { searchQuery, setSearchQuery, setIsSearchOpen } = useSearch();
  const searchResults = useMemo(
    () => getSearchResults(searchQuery, networkRequests),
    [searchQuery, networkRequests]
  );

  useKeyDown("Enter", () => {
    setSearchQuery(searchInput);
  });

  return (
    <div
      className="flex flex-col h-full border-r border-gray-300 dark:border-gray-600"
      data-testid="search-panel"
    >
      <Header
        rightContent={<CloseButton onClick={() => setIsSearchOpen(false)} />}
      >
        <div className="flex items-center pl-2" style={{ height: "3.5rem" }}>
          <h2 className="font-bold">Search</h2>
        </div>
      </Header>
      <div className="p-2">
        <Textfield
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search full request"
          autoFocus
          className="w-full"
          testId="search-input"
        />
      </div>
      {searchResults && (
        <div className="scroll overflow-y-scroll">
          <SearchResults
            searchQuery={searchQuery}
            searchResults={searchResults}
            onResultClick={onResultClick}
          />
        </div>
      )}
    </div>
  );
};
