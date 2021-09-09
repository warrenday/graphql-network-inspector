import React from "react";
import { Checkbox } from "../../components/Checkbox";
import { IconButton } from "../../components/IconButton";
import { BinIcon } from "../../components/Icons/BinIcon";
import { SearchIcon } from "../../components/Icons/SearchIcon";
import { Textfield } from "../../components/Textfield";
import { useSearch } from "../../hooks/useSearch";

interface IToolbarProps {
  filterValue: string;
  onFilterValueChange: (filterValue: string) => void;
  preserveLogs: boolean;
  onPreserveLogsChange: (preserveLogs: boolean) => void;
  onClear: () => void;
}

const ClearButton = ({ onClick }: { onClick: () => void }) => (
  <div className="border-0 rounded-md p-2 dark:bg-gray-700 bg-gray-200 opacity-50 outline-none hover:opacity-100">
    <IconButton
      onClick={onClick}
      testId="clear-network-table"
      icon={<BinIcon />}
    />
  </div>
);

export const Toolbar = (props: IToolbarProps) => {
  const {
    filterValue,
    onFilterValueChange,
    preserveLogs,
    onPreserveLogsChange,
    onClear,
  } = props;
  const { setIsSearchOpen } = useSearch();

  return (
    <div className="flex w-full p-2 border-b dark:bg-gray-800 border-gray-300 dark:border-gray-600 space-x-6">
      <ClearButton onClick={onClear} />
      <Textfield
        value={filterValue}
        onChange={onFilterValueChange}
        placeholder="Filter"
        testId="filter-input"
      />
      <Checkbox
        id="preserveLog"
        label="Preserve Log"
        checked={preserveLogs}
        onChange={onPreserveLogsChange}
        testId="preserve-log-checkbox"
      />
      <IconButton
        icon={<SearchIcon />}
        onClick={() => setIsSearchOpen(true)}
        testId="search-button"
      >
        Search
      </IconButton>
    </div>
  );
};
