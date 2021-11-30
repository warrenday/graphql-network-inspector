import { useState, useEffect } from "react"
import RegexParser from "regex-parser"
import { SplitPaneLayout } from "../../components/Layout"
import { NetworkTable } from "./NetworkTable"
import { NetworkDetails } from "./NetworkDetails"
import { Toolbar } from "../Toolbar"
import { NetworkRequest } from "../../hooks/useNetworkMonitor"
import { onNavigate } from "../../services/networkMonitor"

interface NetworkPanelProps {
  selectedRowId: string | number | null
  setSelectedRowId: (selectedRowId: string | number | null) => void
  networkRequests: NetworkRequest[]
  clearWebRequests: () => void
}

const filterNetworkRequests = (
  networkRequests: NetworkRequest[],
  filterValue: string,
  options: {
    isInverted: boolean
    isRegex: boolean
  }
) => {
  if (!filterValue?.trim()?.length) {
    return networkRequests
  }

  const regex = RegexParser(filterValue)

  return networkRequests.filter((networkRequest) => {
    const { operationName = "" } = networkRequest.request.primaryOperation
    const isMatch = options.isRegex
      ? operationName.match(regex)
      : operationName.toLowerCase().includes(filterValue.toLowerCase())

    return options.isInverted ? !isMatch : isMatch
  })
}

export const NetworkPanel = (props: NetworkPanelProps) => {
  const { networkRequests, clearWebRequests, selectedRowId, setSelectedRowId } =
    props

  const [filterValue, setFilterValue] = useState("")
  const [isPreserveLogs, setIsPreserveLogs] = useState(false)
  const [isInverted, setIsInverted] = useState(false)
  const [isRegexActive, onIsRegexActiveChange] = useState(false)
  const filteredNetworkRequests = filterNetworkRequests(
    networkRequests,
    filterValue,
    { isInverted, isRegex: isRegexActive }
  )

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
          data={filteredNetworkRequests}
          selectedRowId={selectedRowId}
          onRowClick={setSelectedRowId}
          onRowSelect={setSelectedRowId}
          showSingleColumn={Boolean(selectedRequest)}
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
