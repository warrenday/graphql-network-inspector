import React from "react";
import { Checkbox } from "../../components/Checkbox";

interface IToolbarProps {
  filterValue: string;
  onFilterValueChange: (filterValue: string) => void;
  preserveLogs: boolean;
  onPreserveLogsChange: (preserveLogs: boolean) => void;
}

export const Toolbar = (props: IToolbarProps) => {
  const {
    filterValue,
    onFilterValueChange,
    preserveLogs,
    onPreserveLogsChange,
  } = props;

  return (
    <div className="flex w-full p-2 border-b dark:bg-gray-800 border-gray-300 dark:border-gray-600">
      <input
        className="dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-1 w-80 rounded-lg"
        value={filterValue}
        onChange={(event) => {
          onFilterValueChange(event.target.value);
        }}
        placeholder="Filter"
        data-testid="filter-input"
      />
      <Checkbox
        id="preserveLog"
        label="Preserve Log"
        className="pl-4"
        checked={preserveLogs}
        onChange={onPreserveLogsChange}
        testId="preserve-log-checkbox"
      />
    </div>
  );
};
