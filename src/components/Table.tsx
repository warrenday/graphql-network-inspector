import React from "react";
import {
  useTable,
  HeaderGroup,
  TableInstance,
  TableOptions,
  Row,
} from "react-table";
import classes from "./Table.module.css";

export interface ContainerProps {
  hasShadow: boolean;
}
export type TableProps<T extends {}> = TableOptions<T> & {
  onRowClick?: (rowId: string, data: Row<T>["original"]) => void;
  selectedRowId?: string | null;
};
export type TableBodyProps<T extends {}> = TableInstance<T> & {
  onRowClick?: (data: Row<T>) => void;
  selectedRowId?: string | null;
};
export interface TableCellProps {
  evenRow: boolean;
}

const TableHead = <T extends {}>({
  headerGroups,
}: {
  headerGroups: HeaderGroup<T>[];
}) => (
  <thead>
    {headerGroups.map(({ getHeaderGroupProps, headers }) => (
      <tr {...getHeaderGroupProps()}>
        {headers.map(({ getHeaderProps, render }) => (
          <th {...getHeaderProps()}>{render("Header")}</th>
        ))}
      </tr>
    ))}
  </thead>
);

const TableBody = <T extends {}>({
  rows,
  getTableBodyProps,
  prepareRow,
  onRowClick,
  selectedRowId,
}: TableBodyProps<T>) => (
  <tbody {...getTableBodyProps()}>
    {rows.map((row, index) => {
      prepareRow(row);
      return (
        <tr
          {...row.getRowProps()}
          className={row.id === selectedRowId ? classes.selected : ""}
        >
          {row.cells.map((cell) => (
            <td
              {...cell.getCellProps()}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {cell.render("Cell")}
            </td>
          ))}
        </tr>
      );
    })}
  </tbody>
);

export const Table = <T extends {}>(props: TableProps<T>) => {
  const { columns, data, onRowClick, selectedRowId } = props;
  const tableInstance = useTable({ columns, data });
  const { getTableProps, headerGroups } = tableInstance;

  return (
    <table {...getTableProps()} className={classes.table}>
      <TableHead headerGroups={headerGroups} />
      <TableBody
        {...tableInstance}
        onRowClick={(row) => {
          if (onRowClick) {
            onRowClick(row.id, row.original);
          }
        }}
        selectedRowId={selectedRowId}
      />
    </table>
  );
};
