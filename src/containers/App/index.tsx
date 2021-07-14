import React, { useState } from "react";
import SplitPane from "react-split-pane";
import classes from "./App.module.css";
import { NetworkTable } from "../NetworkTable";
import { NetworkPanel } from "../NetworkPanel";
import { Toolbar } from "../Toolbar";
import {
  useNetworkMonitor,
  NetworkRequest,
} from "../../hooks/useNetworkMonitor";

const filterNetworkRequests = (
  networkRequests: NetworkRequest[],
  searchValue: string
) => {
  if (!searchValue) {
    return networkRequests;
  }
  return networkRequests.filter((networkRequest) => {
    const { operationName } = networkRequest.request.primaryOperation;
    return operationName.toLowerCase().startsWith(searchValue.toLowerCase());
  });
};

export function App() {
  const [networkRequests, clearWebRequests] = useNetworkMonitor();
  const [selectedRowId, setSelectedRowId] = useState<string | null>();
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(
    null
  );
  const [searchValue, setSearchValue] = useState("");
  const [isPreserveLogs, setIsPreserveLogs] = useState(false);
  const filteredNetworkRequests = filterNetworkRequests(
    networkRequests,
    searchValue
  );

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
      <div className="bg-gray-800 h-full">
        {ToolbarComponent}
        {NetworkTableComponent}
      </div>
    );
  }

  return (
    <div className={`${classes.container} bg-gray-800 h-full`}>
      {ToolbarComponent}
      <div>
        <SplitPane split="vertical" minSize={210}>
          <div className={classes.networkTable}>{NetworkTableComponent}</div>
          <div className={classes.networkPanel}>
            <NetworkPanel
              data={selectedRequest}
              onClose={() => {
                setSelectedRowId(null);
                setSelectedRequest(null);
              }}
            />
          </div>
        </SplitPane>
      </div>
    </div>
  );
}
