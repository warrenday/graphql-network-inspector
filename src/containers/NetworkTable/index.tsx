import React, { useMemo } from "react";
import prettyBytes from "pretty-bytes";
import prettyMs from "pretty-ms";
import { Table, TableProps } from "../../components/Table";
import { BinIcon } from "../../components/Icons/BinIcon";
import { Badge } from "../../components/Badge";
import { getErrorCountColor, getStatusColor } from "../../helpers/colorHelpers";
import { NetworkRequest } from "../../hooks/useNetworkMonitor";
import { useKeyPress } from "../../hooks/useKeyPress";
import { getErrorMessages } from "../../helpers/graphqlHelpers";

export type NetworkTableProps = {
  data: NetworkRequest[];
  onRowClick: (rowId: string | number, row: NetworkRequest) => void;
  onRowSelect: (rowId: string | number) => void;
  onClear: () => void;
  selectedRowId?: string | number | null;
  showSingleColumn?: boolean;
};

const ClearButton = ({ onClick }: { onClick: () => void }) => (
  <button
    className="z-20 absolute right-2 top-2 h-6 w-6 border-0 p-0 m-0 bg-none opacity-50 outline-none hover:opacity-100"
    onClick={onClick}
    data-testid="clear-network-table"
    style={{ marginTop: 1 }}
  >
    <BinIcon width="1.5rem" height="1.5rem" />
  </button>
);

const Query = ({
  queryType,
  operationName,
  totalQueries,
}: {
  queryType: string;
  operationName: string;
  totalQueries: number;
}) => (
  <div className="flex" data-testid="column-query">
    <Badge>
      <span
        className={queryType === "query" ? "text-green-400" : "text-indigo-400"}
      >
        {queryType === "query" ? "Q" : "M"}
      </span>
    </Badge>
    <span className="pl-2 font-bold">{operationName}</span>
    {totalQueries > 1 && (
      <span className="ml-auto pr-2 font-bold opacity-75">
        +{totalQueries - 1}
      </span>
    )}
  </div>
);

const ResponseErrors = ({ body }: { body: string | undefined }) => {
  const errorMessages = useMemo(() => getErrorMessages(body), [body]);
  const countColor = getErrorCountColor(errorMessages?.length);
  return (
    <div
      data-testid="column-error-count"
      className="flex items-center"
      title={errorMessages?.join("\n")}
    >
      <div
        className="w-3 h-3 rounded-full mr-2"
        style={{ backgroundColor: countColor }}
      />
      {body ? errorMessages?.length : "pending"}
    </div>
  );
};

const Status = ({ status }: { status?: number }) => {
  const statusColor = getStatusColor(status);
  return (
    <div className="flex items-center" data-testid="column-status">
      <div
        className="w-3 h-3 rounded-full mr-2"
        style={{ backgroundColor: statusColor }}
      />
      {status || "pending"}
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
    onRowSelect,
    onClear,
    selectedRowId,
    showSingleColumn,
  } = props;

  const selectNextRow = (direction: "up" | "down") => {
    const directionCount = direction === "up" ? -1 : 1;
    const selectedRowIndex = data.findIndex((row) => row.id === selectedRowId);
    const nextRow = data[selectedRowIndex + directionCount];
    if (nextRow) {
      onRowSelect(nextRow.id);
    }
  };

  useKeyPress("ArrowUp", () => {
    selectNextRow("up");
  });

  useKeyPress("ArrowDown", () => {
    selectNextRow("down");
  });

  const columns = useMemo(() => {
    const columns = [
      {
        id: "query",
        Header: "Query / Mutation",
        accessor: (row) => {
          const { operation, operationName } = row.request.primaryOperation;

          return (
            <Query
              queryType={operation}
              operationName={operationName}
              totalQueries={row.request.body.length}
            />
          );
        },
      },
      {
        Header: "Errors",
        accessor: (row) => <ResponseErrors body={row.response?.body} />,
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
    ] as TableProps<NetworkRequest>["columns"];

    return columns.filter((column) => {
      return showSingleColumn ? column.id === "query" : true;
    });
  }, [showSingleColumn]);

  return (
    <div
      className="w-full relative h-full dark:bg-gray-900"
      data-testid="network-table"
    >
      <ClearButton onClick={onClear} />
      <Table
        columns={columns}
        data={data}
        onRowClick={onRowClick}
        selectedRowId={selectedRowId}
        isScollBottomMaintained
      />
    </div>
  );
};
