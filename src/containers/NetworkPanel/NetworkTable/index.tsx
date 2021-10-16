import React, { useMemo } from "react";
import prettyBytes from "pretty-bytes";
import prettyMs from "pretty-ms";
import { Table, TableProps } from "../../../components/Table";
import { Dot } from "../../../components/Dot";
import { Badge } from "../../../components/Badge";
import { getStatusColor } from "../../../helpers/getStatusColor";
import { NetworkRequest } from "../../../hooks/useNetworkMonitor";
import { useKeyDown } from "../../../hooks/useKeyDown";
import { getErrorMessages } from "../../../helpers/graphqlHelpers";
import { useAutoFocusResponse } from "../../../hooks/useAutoFocusResponse";
import { NUM_TABS, useNetworkTabs } from "../../../hooks/useNetworkTabs";

export type NetworkTableProps = {
  data: NetworkRequest[];
  onRowClick: (rowId: string | number, row: NetworkRequest) => void;
  onRowDoubleClick: (rowId: string | number, row: NetworkRequest) => void;
  onRowSelect: (rowId: string | number) => void;
  selectedRowId?: string | number | null;
  showSingleColumn?: boolean;
};

const Operation = ({ request }: { request: NetworkRequest }) => {
  const totalOperations = request.request.body.length;
  const { operation, operationName } = request.request.primaryOperation;

  const responseBody = request.response?.body;
  const errorMessages = useMemo(
    () => getErrorMessages(responseBody),
    [responseBody]
  );

  return (
    <div className="flex items-center gap-2" data-testid="column-operation">
      <Badge>
        <span
          className={
            operation === "query" ? "text-green-400" : "text-indigo-400"
          }
        >
          {operation === "query" ? "Q" : "M"}
        </span>
      </Badge>

      <span className="font-bold">{operationName}</span>

      <div>
        {totalOperations > 1 && (
          <span className="font-bold opacity-75 mr-2">
            +{totalOperations - 1}
          </span>
        )}
      </div>
      <div className="ml-auto mr-1">
        {errorMessages && errorMessages.length > 0 && (
          <Dot title={errorMessages.join("\n")}>{errorMessages.length}</Dot>
        )}
      </div>
    </div>
  );
};

const Status = ({ status }: { status?: number }) => {
  const statusColor = getStatusColor(status);
  return (
    <div className="flex items-center" data-testid="column-status">
      <div
        className="w-3 h-3 rounded-full mr-2"
        style={{
          backgroundColor: statusColor,
          transform: "rotate(0.1deg)",
          marginTop: "-1px",
        }}
      />
      {status || "cancelled"}
    </div>
  );
};

const ByteSize = ({ byteSize }: { byteSize: number }) => {
  const prettyByteSize = useMemo(() => prettyBytes(byteSize), [byteSize]);
  return <div data-testid="column-size">{prettyByteSize}</div>;
};

const Time = ({ ms }: { ms: number }) => {
  const prettyTimeValue = useMemo(() => prettyMs(ms), [ms]);
  return <div data-testid="column-time">{prettyTimeValue}</div>;
};

export const NetworkTable = (props: NetworkTableProps) => {
  const {
    data,
    onRowClick,
    onRowDoubleClick,
    onRowSelect,
    selectedRowId,
    showSingleColumn,
  } = props;

  const { setAutoFocusResponse } = useAutoFocusResponse();
  const { activeTab, setActiveTab } = useNetworkTabs();

  const selectNextRow = (direction: "up" | "down") => {
    const directionCount = direction === "up" ? -1 : 1;
    const selectedRowIndex = data.findIndex((row) => row.id === selectedRowId);
    const nextRow = data[selectedRowIndex + directionCount];
    setAutoFocusResponse(false);

    if (nextRow) {
      onRowSelect(nextRow.id);
    }
  };

  useKeyDown("ArrowUp", () => {
    selectNextRow("up");
  });
  useKeyDown("ArrowDown", () => {
    selectNextRow("down");
  });

  useKeyDown("ArrowLeft", () => {
    if (!selectedRowId) {
      return;
    }
    setActiveTab(Math.max(0, activeTab - 1));
  });
  useKeyDown("ArrowRight", () => {
    if (!selectedRowId) {
      return;
    }
    setActiveTab(Math.min(NUM_TABS - 1, activeTab + 1));
  });

  useKeyDown("Enter", () => {
    setAutoFocusResponse(true);
  });

  const columns = useMemo(() => {
    const columns: TableProps<NetworkRequest>["columns"] = [
      {
        id: "query",
        Header: "Query / Mutation",
        accessor: (row) => <Operation request={row} />,
      },
      {
        Header: "Status",
        accessor: (row) => <Status status={row.status} />,
      },
      {
        Header: "Size",
        accessor: (row) => <ByteSize byteSize={row.response?.bodySize || 0} />,
      },
      {
        Header: "Time",
        accessor: (row) => <Time ms={row.time} />,
      },
      {
        Header: "URL",
        accessor: (row) => <div data-testid="column-url">{row.url}</div>,
      },
    ];

    return showSingleColumn ? columns.slice(0, 1) : columns;
  }, [showSingleColumn]);

  return (
    <div
      className="w-full relative h-full dark:bg-gray-900"
      data-testid="network-table"
    >
      <Table
        columns={columns}
        data={data}
        onRowClick={onRowClick}
        onRowDoubleClick={onRowDoubleClick}
        selectedRowId={selectedRowId}
        isScollBottomMaintained
      />
    </div>
  );
};
