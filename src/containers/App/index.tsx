import React, { useState, useEffect } from "react";
import SplitPane from "react-split-pane";
import { LayoutMain } from "../../components/Layout";
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
  searchValue: string
) => {
  if (!searchValue) {
    return networkRequests;
  }
  return networkRequests.filter((networkRequest) => {
    const { operationName } = networkRequest.request.primaryOperation;
    return operationName.toLowerCase().includes(searchValue.toLowerCase());
  });
};

export function App() {
  const [networkRequests, clearWebRequests] = useNetworkMonitor();
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(
    null
  );
  const [searchValue, setSearchValue] = useState("");
  const [isPreserveLogs, setIsPreserveLogs] = useState(false);
  const filteredNetworkRequests = filterNetworkRequests(
    networkRequests,
    searchValue
  );

  useEffect(() => {
    return onNavigate(() => {
      if (!isPreserveLogs) {
        clearWebRequests();
      }
    });
  }, [isPreserveLogs, clearWebRequests]);

  const ToolbarComponent = (
    <Toolbar
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      preserveLogs={isPreserveLogs}
      onPreserveLogsChange={setIsPreserveLogs}
    />
  );

  const NetworkTableComponent = (
    <NetworkTable
      data={filteredNetworkRequests}
      selectedRowId={selectedRowId}
      onRowClick={(rowId, data) => {
        setSelectedRequest(data);
        setSelectedRowId(rowId);
      }}
      showSingleColumn={Boolean(selectedRequest)}
      onClear={() => {
        setSelectedRequest(null);
        setSelectedRowId(null);
        clearWebRequests();
      }}
    />
  );

  if (!selectedRequest) {
    return (
      <LayoutMain header={ToolbarComponent} body={NetworkTableComponent} />
    );
  }

  return (
    <div className="flex flex-col bg-gray-800">
      <LayoutMain
        header={ToolbarComponent}
        body={
          <SplitPane split="vertical" minSize={210}>
            {NetworkTableComponent}
            <div
              className="bg-gray-900 border-l border-gray-600 h-full"
              style={{ minWidth: 400 }}
            >
              <NetworkPanel
                data={selectedRequest}
                onClose={() => {
                  setSelectedRowId(null);
                  setSelectedRequest(null);
                }}
              />
            </div>
          </SplitPane>
        }
      />
    </div>
  );
}
