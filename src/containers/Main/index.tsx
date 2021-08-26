import React, { useState } from "react";
import { SplitPaneLayout } from "../../components/Layout";
import { useNetworkMonitor } from "../../hooks/useNetworkMonitor";
import { useSearch } from "../../hooks/useSearch";
import { NetworkPanel } from "../NetworkPanel";
import { SearchPanel } from "../SearchPanel";

export const Main = () => {
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(
    null
  );
  const [networkRequests, clearWebRequests] = useNetworkMonitor();
  const { isSearchOpen } = useSearch();

  return (
    <SplitPaneLayout
      leftPane={
        isSearchOpen ? (
          <SearchPanel
            networkRequests={networkRequests}
            onResultClick={(searchResult, searchResultType) => {
              setSelectedRowId(searchResult.networkRequest.id);
              // TODO allow tabs to be controlled globally
              // will need context for this
            }}
          />
        ) : undefined
      }
      rightPane={
        <NetworkPanel
          networkRequests={networkRequests}
          clearWebRequests={clearWebRequests}
          selectedRowId={selectedRowId}
          setSelectedRowId={setSelectedRowId}
        />
      }
    />
  );
};
