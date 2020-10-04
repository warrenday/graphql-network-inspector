import React, { useMemo } from "react";
import classes from "./NetworkTable.module.css";
import { Table, TableProps } from "../../components/Table";
import { BinIcon } from "../../components/Icons/BinIcon";
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
    className={classes.clearButton}
    onClick={onClick}
    data-testid="clear-network-table"
  >
    <BinIcon />
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
  <div className={classes.query}>
    <span
      className={`${classes.queryType} ${
        queryType === "query"
          ? classes.queryTypeQuery
          : classes.queryTypeMutation
      }`}
    >
      {queryType === "query" ? "Q" : "M"}
    </span>
    <span>{operationName}</span>
    {totalQueries > 1 && (
      <span className={classes.queryTotal}>+{totalQueries - 1}</span>
    )}
  </div>
);

const Status = ({ status }: { status?: number }) => {
  const statusColor = getStatusColor(status);
  return (
    <div className={classes.status}>
      <div
        className={classes.statusColor}
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
    <div className={classes.container} data-testid="network-table">
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
