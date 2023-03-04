import { useState, useEffect } from "react"
import RegexParser from "regex-parser"
import { SplitPaneLayout } from "../../components/Layout"
import { NetworkTable } from "./NetworkTable"
import { NetworkDetails } from "./NetworkDetails"
import { Toolbar } from "../Toolbar"
import { NetworkRequest } from "../../hooks/useNetworkMonitor"
import { onNavigate } from "../../services/networkMonitor"
import { OperationType } from "@/helpers/graphqlHelpers"

interface NetworkPanelProps {
  selectedRowId: string | number | null
  setSelectedRowId: (selectedRowId: string | number | null) => void
  networkRequests: NetworkRequest[]
  clearWebRequests: () => void
}

export type QuickFilters = {
  [key in OperationType]: boolean
}

const getRegex = (str: string) => {
  try {
    const regex = RegexParser(str)
    return { regex, errorMessage: null }
  } catch (error) {
    let message = "Invalid Regex"
    if (error instanceof Error) message = error.message
    return { regex: null, errorMessage: message }
  }
}

const filterNetworkRequests = (
  networkRequests: NetworkRequest[],
  filterValue: string,
  options: {
    isInverted: boolean
    isRegex: boolean
    quickFilters: QuickFilters
  }
): { results: NetworkRequest[]; errorMessage?: string } => {
  const regexResult = options.isRegex ? getRegex(filterValue) : null
  if (regexResult?.errorMessage) {
    return { results: [], errorMessage: regexResult.errorMessage }
  }

  const results = networkRequests.filter((networkRequest) => {
    const { operationName = "", operation } =
      networkRequest.request.primaryOperation

    if (!options.quickFilters[operation]) {
      return false
    }

    const isMatch = options.isRegex
      ? operationName.match(regexResult?.regex as RegExp)
      : operationName.toLowerCase().includes(filterValue.toLowerCase())

    return options.isInverted ? !isMatch : isMatch
  })

  return { results }
}

export const NetworkPanel = (props: NetworkPanelProps) => {
  const { networkRequests, clearWebRequests, selectedRowId, setSelectedRowId } =
    props

  const [filterValue, setFilterValue] = useState("")
  const [isPreserveLogs, setIsPreserveLogs] = useState(false)
  const [isInverted, setIsInverted] = useState(false)
  const [isRegexActive, onIsRegexActiveChange] = useState(false)
  const [quickFilters, setQuickFilters] = useState<QuickFilters>({
    query: true,
    mutation: true,
    subscription: false,
  })

  const { results: filterResults, errorMessage: filterError } =
    filterNetworkRequests(networkRequests, filterValue, {
      isInverted,
      isRegex: isRegexActive,
      quickFilters,
    })

  const selectedRequest = networkRequests.find(
    (request) => request.id === selectedRowId
  )

  useEffect(() => {
    return onNavigate(() => {
      if (!isPreserveLogs) {
        clearWebRequests()
      }
    })
  }, [isPreserveLogs, clearWebRequests])

  const handleQuickFilterButtonClicked = (filter: OperationType) => {
    setQuickFilters({
      ...quickFilters,
      [filter]: !quickFilters[filter],
    })
  }

  return (
    <SplitPaneLayout
      header={
        <Toolbar
          filterValue={filterValue}
          onFilterValueChange={setFilterValue}
          preserveLogs={isPreserveLogs}
          onPreserveLogsChange={setIsPreserveLogs}
          inverted={isInverted}
          onInvertedChange={setIsInverted}
          regexActive={isRegexActive}
          onRegexActiveChange={onIsRegexActiveChange}
          onClear={() => {
            setSelectedRowId(null)
            clearWebRequests()
          }}
        />
      }
      leftPane={
        <NetworkTable
          data={filterResults}
          error={filterError}
          selectedRowId={selectedRowId}
          onRowClick={setSelectedRowId}
          onRowSelect={setSelectedRowId}
          showSingleColumn={Boolean(selectedRequest)}
          quickFilters={quickFilters}
          onQuickFilterButtonClicked={handleQuickFilterButtonClicked}
        />
      }
      rightPane={
        selectedRequest && (
          <div
            className="dark:bg-gray-900 border-l border-gray-300 dark:border-gray-600 h-full"
            style={{ minWidth: 200 }}
          >
            <NetworkDetails
              data={selectedRequest}
              onClose={() => {
                setSelectedRowId(null)
              }}
            />
          </div>
        )
      }
    />
  )
}
