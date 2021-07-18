import React from "react";
import {
  useTable,
  HeaderGroup,
  TableInstance,
  TableOptions,
  Row,
} from "react-table";

type RowId = string | number;

export type TableProps<T extends {}> = TableOptions<T> & {
  onRowClick?: (rowId: RowId, data: Row<T>["original"]) => void;
  selectedRowId?: RowId | null;
};

type TableBodyProps<T extends {}> = TableInstance<T> & {
  onRowClick?: (data: Row<T>) => void;
  selectedRowId?: RowId | null;
};

type BaseRowData = {
  id: RowId;
};

const TableHead = <T extends {}>({
  headerGroups,
}: {
  headerGroups: HeaderGroup<T>[];
}) => (
  <thead>
    {headerGroups.map(({ getHeaderGroupProps, headers }) => (
      <tr {...getHeaderGroupProps()} className="text-left sticky top-0 z-10">
        {headers.map(({ getHeaderProps, render }) => (
          <th
            {...getHeaderProps()}
            className="bg-gray-800 p-2 border-r border-b border-gray-600 last:border-r-0"
          >
            {render("Header")}
          </th>
        ))}
      </tr>
    ))}
  </thead>
);

const TableBody = <T extends BaseRowData>({
  rows,
  getTableBodyProps,
  prepareRow,
  onRowClick,
  selectedRowId,
}: TableBodyProps<T>) => (
  <tbody {...getTableBodyProps()}>
    {rows.map((row) => {
      prepareRow(row);

      const isSelected = row.original.id === selectedRowId;
      return (
        <tr
          {...row.getRowProps()}
          className={`${
            isSelected
              ? "bg-blue-600"
              : "even:bg-gray-900 odd:bg-gray-800 hover:bg-blue-900"
          } cursor-pointer `}
        >
          {row.cells.map((cell) => (
            <td
              {...cell.getCellProps()}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className="p-2 border-r border-gray-600 last:border-r-0"
            >
              {cell.render("Cell")}
            </td>
          ))}
        </tr>
      );
    })}
  </tbody>
);

export const Table = <T extends BaseRowData>(props: TableProps<T>) => {
  const { columns, data, onRowClick, selectedRowId } = props;
  const tableInstance = useTable({ columns, data });
  const { getTableProps, headerGroups } = tableInstance;

  return (
    <div className="scroll relative h-full overflow-y-scroll">
      <table
        {...getTableProps()}
        className={`w-full whitespace-nowrap border-separate`}
        style={{ borderSpacing: 0 }}
      >
        <TableHead headerGroups={headerGroups} />
        <TableBody
          {...tableInstance}
          onRowClick={(row) => {
            if (onRowClick) {
              onRowClick(row.original.id, row.original);
            }
          }}
          selectedRowId={selectedRowId}
        />
      </table>
      {data.length === 0 && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="p-6 text-center">No requests have been detected</div>
        </div>
      )}
    </div>
  );
};
