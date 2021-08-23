import React, { useState, useEffect } from "react";
import SplitPane from "react-split-pane";
import { HeadBodyLayout, SplitPaneLayout } from "../../components/Layout";
import { NetworkTable } from "../NetworkTable";
import { NetworkPanel } from "../NetworkPanel";
import { Toolbar } from "../Toolbar";
import {
  useNetworkMonitor,
  NetworkRequest,
} from "../../hooks/useNetworkMonitor";
import { onNavigate } from "../../services/networkMonitor";

const filterNetworkRequests = (
  networkRequests: NetworkRequest[],
  filterValue: string
) => {
  if (!filterValue) {
    return networkRequests;
  }
  return networkRequests.filter((networkRequest) => {
    const { operationName } = networkRequest.request.primaryOperation;
    return operationName.toLowerCase().includes(filterValue.toLowerCase());
  });
};

export const Main = () => {
  const [networkRequests, clearWebRequests] = useNetworkMonitor();
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(
    null
  );
  const [filterValue, setFilterValue] = useState("");
  const [isPreserveLogs, setIsPreserveLogs] = useState(false);
  const filteredNetworkRequests = filterNetworkRequests(
    networkRequests,
    filterValue
  );
  const selectedRequest = networkRequests.find(
    (request) => request.id === selectedRowId
  );

  useEffect(() => {
    return onNavigate(() => {
      if (!isPreserveLogs) {
        clearWebRequests();
      }
    });
  }, [isPreserveLogs, clearWebRequests]);

  return (
    <SplitPaneLayout
      header={
        <Toolbar
          filterValue={filterValue}
          onFilterValueChange={setFilterValue}
          preserveLogs={isPreserveLogs}
          onPreserveLogsChange={setIsPreserveLogs}
        />
      }
      leftPane={
        <NetworkTable
          data={filteredNetworkRequests}
          selectedRowId={selectedRowId}
          onRowClick={setSelectedRowId}
          onRowSelect={setSelectedRowId}
          showSingleColumn={Boolean(selectedRequest)}
          onClear={() => {
            setSelectedRowId(null);
            clearWebRequests();
          }}
        />
      }
      rightPane={
        selectedRequest && (
          <div
            className="dark:bg-gray-900 border-l border-gray-300 dark:border-gray-600 h-full"
            style={{ minWidth: 200 }}
          >
            <NetworkPanel
              data={selectedRequest}
              onClose={() => {
                setSelectedRowId(null);
              }}
            />
          </div>
        )
      }
    />
  );
};
