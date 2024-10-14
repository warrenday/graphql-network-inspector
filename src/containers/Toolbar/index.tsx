import { Checkbox } from '../../components/Checkbox'
import { Button } from '../../components/Button'
import { BinIcon } from '../../components/Icons/BinIcon'
import { SearchIcon } from '../../components/Icons/SearchIcon'
import { useSearch } from '../../hooks/useSearch'
import { Textfield } from '@/components/Textfield'
import { OverflowPopover } from '../../components/OverflowPopover'
import { Bar } from '../../components/Bar'
import { DocsIcon } from '../../components/Icons/DocsIcon'
import { useOperationFilters } from '@/hooks/useOperationFilters'

interface IToolbarProps {
  filterValue: string
  onFilterValueChange: (filterValue: string) => void
  preserveLogs: boolean
  onPreserveLogsChange: (preserveLogs: boolean) => void
  inverted: boolean
  onInvertedChange: (inverted: boolean) => void
  regexActive: boolean
  onRegexActiveChange: (regexActive: boolean) => void
  websocketUrlFilter: string
  onWebsocketUrlFilterChange: (websocketUrlFilter: string) => void
  showFullWebsocketMessage: boolean
  onShowFullWebsocketMessageChange: (showFullWebsocketMessage: boolean) => void
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
    websocketUrlFilter,
    onWebsocketUrlFilterChange,
    showFullWebsocketMessage,
    onShowFullWebsocketMessageChange,
    onClear,
  } = props
  const { setIsSearchOpen } = useSearch()
  const { operationFilters } = useOperationFilters()

  return (
    <div>
      <Bar testId="toolbar" className="border-b">
        <Button
          icon={<BinIcon />}
          onClick={onClear}
          testId="clear-network-table"
          className="-mr-3 dark:text-gray-400 dark:hover:text-white"
          variant="ghost"
        />
        <Textfield
          className="w-80"
          value={filterValue}
          onChange={(event) => onFilterValueChange(event.currentTarget.value)}
          placeholder={regexActive ? '/ab+c/' : 'Filter'}
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
              variant="ghost"
              className="text-gray-500 dark:text-gray-400 -ml-2"
            >
              Search
            </Button>,
            <a
              href="https://www.overstacked.io/docs/graphql-network-inspector"
              target="_blank"
            >
              <Button
                icon={<DocsIcon />}
                testId="docs-button"
                variant="ghost"
                className="text-gray-500 dark:text-gray-400 -ml-2 whitespace-nowrap"
              >
                View Docs
              </Button>
            </a>,
          ]}
        />
      </Bar>
      {operationFilters.subscription &&
        <Bar testId="toolbar-websocket" className="border-b">
          <span className="pl-3 font-bold">Websocket</span>
          <Textfield
            className="w-40"
            value={websocketUrlFilter}
            onChange={(event) =>
              onWebsocketUrlFilterChange(event.currentTarget.value)
            }
            placeholder={'URL Filter'}
            testId="websocket-url-filter-input"
          />
          <Checkbox
            id="showFullWebsocketMessage"
            label="Show Full Message"
            checked={showFullWebsocketMessage}
            onChange={onShowFullWebsocketMessageChange}
            testId="show-full-websocket-message-checkbox"
          />
        </Bar>
      }
    </div>
  )
}
