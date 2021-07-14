import React, { useMemo } from "react";
import { Table, TableProps } from "../../components/Table";
import { BinIcon } from "../../components/Icons/BinIcon";
import { Badge } from "../../components/Badge";
import { getStatusColor } from "../../helpers/getStatusColor";
import { NetworkRequest } from "../../hooks/useNetworkMonitor";

export type NetworkTableProps = {
  data: NetworkRequest[];
  onRowClick: (rowId: string, row: NetworkRequest) => void;
  onClear: () => void;
  selectedRowId?: string | null;
  showSingleColumn: boolean;
};

const ClearButton = ({ onClick }: { onClick: () => void }) => (
  <button
    className="z-20 absolute right-2 top-2 h-6 w-6 border-0 p-0 m-0 bg-none opacity-50 outline-none hover:opacity-100"
    onClick={onClick}
    data-testid="clear-network-table"
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
  <div className="flex">
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

const Status = ({ status }: { status?: number }) => {
  const statusColor = getStatusColor(status);
  return (
    <div className="flex items-center">
      <div
        className="w-3 h-3 rounded-full mr-2"
        style={{ backgroundColor: statusColor }}
      ></div>
      {status || "pending"}
    </div>
  );
};

export const NetworkTable = (props: NetworkTableProps) => {
  const { data, onRowClick, onClear, selectedRowId, showSingleColumn } = props;

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
        Header: "URL",
        accessor: (row) => row.url,
      },
      {
        Header: "Status",
        accessor: (row) => <Status status={row.status} />,
      },
    ] as TableProps<NetworkRequest>["columns"];

    return columns.filter((column) => {
      return showSingleColumn ? column.id === "query" : true;
    });
  }, [showSingleColumn]);

  return (
    <div className="w-full relative" data-testid="network-table">
      <ClearButton onClick={onClear} />
      <Table
        columns={columns}
        data={data}
        onRowClick={onRowClick}
        selectedRowId={selectedRowId}
      />
    </div>
  );
};
