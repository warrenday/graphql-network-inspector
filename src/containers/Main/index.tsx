import React, { useState } from "react";
import { SplitPaneLayout } from "../../components/Layout";
import { useNetworkMonitor } from "../../hooks/useNetworkMonitor";
import { useSearch } from "../../hooks/useSearch";
import { useNetworkTabs } from "../../hooks/useNetworkTabs";
import { NetworkPanel } from "../NetworkPanel";
import { SearchPanel } from "../SearchPanel";

export const Main = () => {
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(
    null
  );
  const [networkRequests, clearWebRequests] = useNetworkMonitor();
  const { isSearchOpen } = useSearch();
  const { setActiveTab } = useNetworkTabs();

  return (
    <SplitPaneLayout
      leftPane={
        isSearchOpen ? (
          <SearchPanel
            networkRequests={networkRequests}
            onResultClick={(searchResult, networkTab) => {
              setSelectedRowId(searchResult.networkRequest.id);
              setActiveTab(networkTab);
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
