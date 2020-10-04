import React, { useState } from "react";
import SplitPane from "react-split-pane";
import classes from "./App.module.css";
import { NetworkTable } from "../NetworkTable";
import { NetworkPanel } from "../NetworkPanel";
import {
  useNetworkMonitor,
  NetworkRequest,
} from "../../hooks/useNetworkMonitor";

export function App() {
  const [networkRequests, clearWebRequests] = useNetworkMonitor();
  const [selectedRowId, setSelectedRowId] = useState<string | null>();
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(
    null
  );

  const NetworkTableComponent = (
    <NetworkTable
      data={networkRequests}
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
    return NetworkTableComponent;
  }

  return (
    <div className={classes.container}>
      <SplitPane split="vertical" minSize={200}>
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
  );
}
