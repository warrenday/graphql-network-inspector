import { Checkbox } from "../../components/Checkbox";
import { Button } from "../../components/Button";
import { BinIcon } from "../../components/Icons/BinIcon";
import { SearchIcon } from "../../components/Icons/SearchIcon";
import { Textfield } from "../../components/Textfield";
import { useSearch } from "../../hooks/useSearch";

interface IToolbarProps {
  filterValue: string;
  onFilterValueChange: (filterValue: string) => void;
  preserveLogs: boolean;
  onPreserveLogsChange: (preserveLogs: boolean) => void;
  isInverted: boolean;
  onIsInvertedChange: (isInverted: boolean) => void;
  onClear: () => void;
}

export const Toolbar = (props: IToolbarProps) => {
  const {
    filterValue,
    onFilterValueChange,
    preserveLogs,
    onPreserveLogsChange,
    isInverted,
    onIsInvertedChange,
    onClear,
  } = props;
  const { setIsSearchOpen } = useSearch();

  return (
    <div
      className="flex items-center w-full p-2 border-b dark:bg-gray-800 border-gray-300 dark:border-gray-600 space-x-6"
      data-testid="toolbar"
    >
      <Button
        icon={<BinIcon />}
        onClick={onClear}
        testId="clear-network-table"
        className="-mr-3"
      />
      <Textfield
        value={filterValue}
        onChange={onFilterValueChange}
        placeholder="Filter"
        testId="filter-input"
      />
      <Checkbox
        id="invert"
        label="Invert"
        checked={isInverted}
        onChange={onIsInvertedChange}
        testId="is-inverted-checkbox"
      />
      <Checkbox
        id="preserveLog"
        label="Preserve Log"
        checked={preserveLogs}
        onChange={onPreserveLogsChange}
        testId="preserve-log-checkbox"
      />
      <Button
        icon={<SearchIcon />}
        onClick={() => setIsSearchOpen(true)}
        testId="search-button"
      >
        Search
      </Button>
    </div>
  );
};
