import React from "react";
import { HighlightedText } from "../../components/HighlightedText";
import { ISearchResult } from "../../services/searchService";
import {
  getHeaderSearchContent,
  getRequestSearchContent,
  getResponseSearchContent,
} from "./getSearchContent";

export type SearchResultType = "header" | "request" | "response";

interface ISearchResultsProps {
  searchQuery: string;
  searchResults: ISearchResult[];
  onResultClick: (
    searchResult: ISearchResult,
    searchResultType: SearchResultType
  ) => void;
}

interface ISearchResultEntryProps {
  searchQuery: string;
  searchResult: ISearchResult;
  onResultClick: (searchResultType: SearchResultType) => void;
}

interface ISearchResultEntryRowProps {
  title: string;
  onClick: () => void;
}

const SearchResultEntryRow: React.FC<ISearchResultEntryRowProps> = ({
  title,
  children,
  onClick,
}) => {
  return (
    <div className="flex hover:bg-gray-700 cursor-pointer" onClick={onClick}>
      <div className="mr-3 opacity-70">{title}</div>
      <div className="whitespace-nowrap">{children}</div>
    </div>
  );
};

const SearchResultEntry = (props: ISearchResultEntryProps) => {
  const { searchQuery, searchResult, onResultClick } = props;
  const { matches, networkRequest } = searchResult;
  const { operationName } = networkRequest.request.primaryOperation;

  return (
    <div key={searchResult.networkRequest.id}>
      <div className="font-bold mb-1">{operationName}</div>
      {matches.headers && (
        <SearchResultEntryRow
          title="Header"
          onClick={() => onResultClick("header")}
        >
          <HighlightedText
            text={getHeaderSearchContent(networkRequest)}
            highlight={searchQuery}
          />
        </SearchResultEntryRow>
      )}
      {matches.request && (
        <SearchResultEntryRow
          title="Request"
          onClick={() => onResultClick("request")}
        >
          <HighlightedText
            text={getRequestSearchContent(networkRequest)}
            highlight={searchQuery}
          />
        </SearchResultEntryRow>
      )}
      {matches.response && (
        <SearchResultEntryRow
          title="Response"
          onClick={() => onResultClick("response")}
        >
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
  const { searchQuery, searchResults, onResultClick } = props;
  return (
    <div className="pt-0 p-2 space-y-4">
      {searchResults.map((searchResult) => (
        <SearchResultEntry
          key={searchResult.networkRequest.id}
          searchQuery={searchQuery}
          searchResult={searchResult}
          onResultClick={(searchResultType) => {
            onResultClick(searchResult, searchResultType);
          }}
        />
      ))}
    </div>
  );
};
