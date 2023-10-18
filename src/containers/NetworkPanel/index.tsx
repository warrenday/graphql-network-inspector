import { useState, useEffect, useMemo } from "react"
import RegexParser from "regex-parser"
import { SplitPaneLayout } from "@/components/Layout"
import { NetworkRequest } from "@/hooks/useNetworkMonitor"
import { onNavigate } from "@/services/networkMonitor"
import { OperationType } from "@/helpers/graphqlHelpers"
import { WebSocketNetworkRequest } from "@/hooks/useWebSocketNetworkMonitor"
import { NetworkTable, NetworkTableDataRow } from "./NetworkTable"
import { NetworkDetails } from "./NetworkDetails"
import { Toolbar } from "../Toolbar"
import WebSocketNetworkDetails from "./WebSocketNetworkDetails"

interface NetworkPanelProps {
  selectedRowId: string | number | null
  setSelectedRowId: (selectedRowId: string | number | null) => void
  networkRequests: NetworkRequest[]
  webSocketNetworkRequests: WebSocketNetworkRequest[]
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
  const {
    networkRequests,
    webSocketNetworkRequests,
    clearWebRequests,
    selectedRowId,
    setSelectedRowId,
  } = props

  const [filterValue, setFilterValue] = useState("")
  const [isPreserveLogs, setIsPreserveLogs] = useState(false)
  const [isInverted, setIsInverted] = useState(false)
  const [isRegexActive, onIsRegexActiveChange] = useState(false)
  const [quickFilters, setQuickFilters] = useState<QuickFilters>({
    query: true,
    mutation: true,
    persisted: true,
    subscription: true,
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

  const selectedWebSocketRequest = webSocketNetworkRequests.find(
    (request) => request.id === selectedRowId
  )

  const isRequestSelected = Boolean(selectedRequest || selectedWebSocketRequest)

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

  const networkTableData = useMemo((): NetworkTableDataRow[] => {
    return filterResults.map((networkRequest) => {
      const { operationName = "", operation } =
        networkRequest.request.primaryOperation
      return {
        id: networkRequest.id,
        type: operation,
        name: operationName,
        total: networkRequest.request.body.length,
        status: networkRequest.status,
        size: networkRequest.response?.bodySize || 0,
        time: networkRequest.time,
        url: networkRequest.url,
        responseBody: networkRequest.response?.body || "",
      }
    })
  }, [filterResults])

  const websocketTableData = useMemo((): NetworkTableDataRow[] => {
    return webSocketNetworkRequests.map((websocketRequest) => {
      return {
        id: websocketRequest.id,
        type: "subscription",
        name: "subscription",
        total: 1,
        status: websocketRequest.status,
        size: 0,
        time: 0,
        url: websocketRequest.url,
        responseBody: "",
      }
    })
  }, [webSocketNetworkRequests])

  const combinedTableData = useMemo(() => {
    return [...websocketTableData, ...networkTableData]
  }, [networkTableData, websocketTableData])

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
          data={combinedTableData}
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
        isRequestSelected ? (
          <div
            className="dark:bg-gray-900 border-l border-gray-300 dark:border-gray-600 h-full"
            style={{ minWidth: 200 }}
          >
            {selectedRequest && (
              <NetworkDetails
                data={selectedRequest}
                onClose={() => {
                  setSelectedRowId(null)
                }}
              />
            )}
            {selectedWebSocketRequest && (
              <WebSocketNetworkDetails
                data={selectedWebSocketRequest}
                onClose={() => {
                  setSelectedRowId(null)
                }}
              />
            )}
          </div>
        ) : undefined
      }
    />
  )
}
