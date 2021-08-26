import React from "react";
import { HighlightedText } from "../../components/HighlightedText";
import { ISearchResult } from "../../services/searchService";
import {
  getHeaderSearchContent,
  getRequestSearchContent,
  getResponseSearchContent,
} from "./getSearchContent";

interface ISearchResultsProps {
  searchQuery: string;
  searchResults: ISearchResult[];
}

interface ISearchResultEntryProps {
  searchQuery: string;
  searchResult: ISearchResult;
}

const SearchResultEntryRow: React.FC<{ title: string }> = ({
  title,
  children,
}) => {
  return (
    <div className="flex hover:bg-gray-700 cursor-pointer" onClick={() => {}}>
      <div className="mr-3 opacity-70">{title}</div>
      <div className="whitespace-nowrap">{children}</div>
    </div>
  );
};

const SearchResultEntry = (props: ISearchResultEntryProps) => {
  const { searchQuery, searchResult } = props;
  const { matches, networkRequest } = searchResult;
  const { operationName } = networkRequest.request.primaryOperation;

  return (
    <div key={searchResult.networkRequest.id}>
      <div className="font-bold mb-1">{operationName}</div>
      {matches.headers && (
        <SearchResultEntryRow title="Header">
          <HighlightedText
            text={getHeaderSearchContent(networkRequest)}
            highlight={searchQuery}
          />
        </SearchResultEntryRow>
      )}
      {matches.request && (
        <SearchResultEntryRow title="Request">
          <HighlightedText
            text={getRequestSearchContent(networkRequest)}
            highlight={searchQuery}
          />
        </SearchResultEntryRow>
      )}
      {matches.response && (
        <SearchResultEntryRow title="Response">
          <HighlightedText
            text={getResponseSearchContent(networkRequest)}
            highlight={searchQuery}
          />
        </SearchResultEntryRow>
      )}
    </div>
  );
};

export const SearchResults = (props: ISearchResultsProps) => {
  const { searchQuery, searchResults } = props;
  return (
    <div className="pt-0 p-2 space-y-4">
      {searchResults.map((searchResult) => (
        <SearchResultEntry
          key={searchResult.networkRequest.id}
          searchQuery={searchQuery}
          searchResult={searchResult}
        />
      ))}
    </div>
  );
};
