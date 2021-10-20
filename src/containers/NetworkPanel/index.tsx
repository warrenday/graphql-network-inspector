import React, { useState, useEffect } from "react";
import { SplitPaneLayout } from "../../components/Layout";
import { NetworkTable } from "./NetworkTable";
import { NetworkDetails } from "./NetworkDetails";
import { Toolbar } from "../Toolbar";
import { NetworkRequest } from "../../hooks/useNetworkMonitor";
import { onNavigate } from "../../services/networkMonitor";

interface NetworkPanelProps {
  selectedRowId: string | number | null;
  setSelectedRowId: (selectedRowId: string | number | null) => void;
  networkRequests: NetworkRequest[];
  clearWebRequests: () => void;
}

const filterNetworkRequests = (
  networkRequests: NetworkRequest[],
  filterValue: string,
  isRegexActive: boolean
) => {
  if (!filterValue) {
    return networkRequests;
  }
  return networkRequests.filter((networkRequest) => {
    const { operationName } = networkRequest.request.primaryOperation;
    if (isRegexActive) {
      return !!operationName.match(filterValue);
    }
    return operationName.toLowerCase().includes(filterValue.toLowerCase());
  });
};

export const NetworkPanel = (props: NetworkPanelProps) => {
  const { networkRequests, clearWebRequests, selectedRowId, setSelectedRowId } =
    props;

  const [filterValue, setFilterValue] = useState("");
  const [isPreserveLogs, setIsPreserveLogs] = useState(false);
  const [regex, setIsRegex] = useState(false);
  const filteredNetworkRequests = filterNetworkRequests(
    networkRequests,
    filterValue,
    regex
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
          regex={regex}
          onRegexChange={setIsRegex}
          onClear={() => {
            setSelectedRowId(null);
            clearWebRequests();
          }}
        />
      }
      leftPane={
        <NetworkTable
          data={filteredNetworkRequests}
          selectedRowId={selectedRowId}
          onRowClick={setSelectedRowId}
          onRowSelect={setSelectedRowId}
          showSingleColumn={Boolean(selectedRequest)}
        />
      }
      rightPane={
        selectedRequest && (
          <div
            className="dark:bg-gray-900 border-l border-gray-300 dark:border-gray-600 h-full"
            style={{ minWidth: 200 }}
          >
            <NetworkDetails
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
