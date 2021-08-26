import React from "react";
import { SplitPaneLayout } from "../../components/Layout";
import { useNetworkMonitor } from "../../hooks/useNetworkMonitor";
import { useSearch } from "../../hooks/useSearch";
import { NetworkPanel } from "../NetworkPanel";
import { SearchPanel } from "../SearchPanel";

export const Main = () => {
  const [networkRequests, clearWebRequests] = useNetworkMonitor();
  const { isSearchOpen } = useSearch();

  return (
    <SplitPaneLayout
      leftPane={
        isSearchOpen ? (
          <SearchPanel networkRequests={networkRequests} />
        ) : undefined
      }
      rightPane={
        <NetworkPanel
          networkRequests={networkRequests}
          clearWebRequests={clearWebRequests}
        />
      }
    />
  );
};
