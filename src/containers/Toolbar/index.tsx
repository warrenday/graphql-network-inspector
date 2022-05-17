import { Checkbox } from "../../components/Checkbox"
import { Button } from "../../components/Button"
import { BinIcon } from "../../components/Icons/BinIcon"
import { SearchIcon } from "../../components/Icons/SearchIcon"
import { useSearch } from "../../hooks/useSearch"
import { Textfield } from "@/components/Textfield"
import { InterceptButton } from "../../components/InterceptPopover"
import { OverflowPopover } from "../../components/OverflowPopover"
import { useOperatingSystem } from "../../hooks/useOperatingSystem"
import { Bar } from "../../components/Bar"

interface IToolbarProps {
  filterValue: string
  onFilterValueChange: (filterValue: string) => void
  preserveLogs: boolean
  onPreserveLogsChange: (preserveLogs: boolean) => void
  inverted: boolean
  onInvertedChange: (inverted: boolean) => void
  regexActive: boolean
  onRegexActiveChange: (regexActive: boolean) => void
  onClear: () => void
}

export const Toolbar = (props: IToolbarProps) => {
  const {
    filterValue,
    onFilterValueChange,
    preserveLogs,
    onPreserveLogsChange,
    inverted,
    onInvertedChange,
    regexActive,
    onRegexActiveChange,
    onClear,
  } = props
  const { setIsSearchOpen } = useSearch()
  const os = useOperatingSystem()
  const isMac = os === "mac"

  return (
    <Bar testId="toolbar" className="border-b">
      <Button
        icon={<BinIcon />}
        onClick={onClear}
        testId="clear-network-table"
        className="-mr-3"
      />
      <Textfield
        className="w-80"
        value={filterValue}
        onChange={(event) => onFilterValueChange(event.currentTarget.value)}
        placeholder={regexActive ? "/ab+c/" : "Filter"}
        testId="filter-input"
      />
      <OverflowPopover
        className="flex-1 space-x-6"
        items={[
          <Checkbox
            id="invert"
            label="Invert"
            checked={inverted}
            onChange={onInvertedChange}
            testId="inverted-checkbox"
          />,
          <Checkbox
            id="regex"
            label="Regex"
            checked={regexActive}
            onChange={onRegexActiveChange}
            testId="regex-checkbox"
          />,
          <Checkbox
            id="preserveLog"
            label="Preserve Log"
            checked={preserveLogs}
            onChange={onPreserveLogsChange}
            testId="preserve-log-checkbox"
          />,
          <Button
            icon={<SearchIcon />}
            onClick={() => setIsSearchOpen(true)}
            testId="search-button"
          >
            Search
          </Button>,
          ...(isMac ? [<InterceptButton />] : []),
        ]}
      />
    </Bar>
  )
}
