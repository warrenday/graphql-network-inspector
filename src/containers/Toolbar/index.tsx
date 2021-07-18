import React from "react";
import { Checkbox } from "../../components/Checkbox";

interface IToolbarProps {
  searchValue: string;
  onSearchValueChange: (searchValue: string) => void;
  preserveLogs: boolean;
  onPreserveLogsChange: (preserveLogs: boolean) => void;
}

export const Toolbar = (props: IToolbarProps) => {
  const {
    searchValue,
    onSearchValueChange,
    preserveLogs,
    onPreserveLogsChange,
  } = props;

  return (
    <div className="flex w-full p-2 dark:bg-gray-800 dark:border-gray-600 border-b">
      <input
        className="dark:bg-gray-900 px-2 py-1 w-80"
        value={searchValue}
        onChange={(event) => {
          onSearchValueChange(event.target.value);
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
