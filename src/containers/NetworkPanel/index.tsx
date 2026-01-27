import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import RegexParser from 'regex-parser'
import { SplitPaneLayout } from '@/components/Layout'
import { onNavigate } from '@/services/networkMonitor'
import { ISubscriptionRequest } from '@/hooks/useGraphqlSubscriptions'
import { ICompleteNetworkRequest } from '@/helpers/networkHelpers'
import { NetworkTable, INetworkTableDataRow } from './NetworkTable'
import { NetworkDetails } from './NetworkDetails'
import { Toolbar } from '../Toolbar'
import WebSocketNetworkDetails from './WebSocketNetworkDetails'
import {
  IOperationFilters,
  useOperationFilters,
} from '../../hooks/useOperationFilters'
import { IClearWebRequestsOptions } from '../../hooks/useNetworkMonitor'
import { IUserSettings } from '@/services/userSettingsService'

/** Debounce delay in ms for filter input */
const FILTER_DEBOUNCE_MS = 150

interface NetworkPanelProps {
  selectedRowId: string | number | null
  setSelectedRowId: (selectedRowId: string | number | null) => void
  networkRequests: ICompleteNetworkRequest[]
  webSocketNetworkRequests: ISubscriptionRequest[]
  clearWebRequests: (opts?: IClearWebRequestsOptions) => void
  userSettings: IUserSettings
  setUserSettings: (userSettings: Partial<IUserSettings>) => void
}

/** Cache for compiled regex patterns to avoid recompilation */
const regexCache = new Map<string, { regex: RegExp | null; errorMessage: string | null }>()

/**
 * Parse a regex pattern string with memoization.
 * Results are cached to prevent recompilation of the same pattern.
 */
const getRegex = (str: string) => {
  const cached = regexCache.get(str)
  if (cached) {
    return cached
  }

  try {
    const regex = RegexParser(str)
    const result = { regex, errorMessage: null }
    regexCache.set(str, result)
    // Limit cache size to prevent memory issues
    if (regexCache.size > 100) {
      const firstKey = regexCache.keys().next().value
      if (firstKey) regexCache.delete(firstKey)
    }
    return result
  } catch (error) {
    let message = 'Invalid Regex'
    if (error instanceof Error) message = error.message
    const result = { regex: null, errorMessage: message }
    regexCache.set(str, result)
    return result
  }
}

const filterNetworkRequests = (
  networkRequests: ICompleteNetworkRequest[],
  filterValue: string,
  options: {
    isInverted: boolean
    isRegex: boolean
    operationFilters: IOperationFilters
  }
): { results: ICompleteNetworkRequest[]; errorMessage?: string } => {
  const regexResult =
    options.isRegex && filterValue ? getRegex(filterValue) : null
  if (regexResult?.errorMessage) {
    return { results: [], errorMessage: regexResult.errorMessage }
  }

  const results = networkRequests.filter((networkRequest) => {
    const { operationName = '', operation } =
      networkRequest.request.primaryOperation

    if (!options.operationFilters[operation]) {
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
    userSettings,
    setUserSettings,
  } = props

  const { operationFilters } = useOperationFilters()

  // Debounced filter value for performance with large datasets
  const [debouncedFilter, setDebouncedFilter] = useState(userSettings.filter)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Update debounced filter with delay
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedFilter(userSettings.filter)
    }, FILTER_DEBOUNCE_MS)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [userSettings.filter])

  // Memoize filter results to avoid recomputation on unrelated state changes
  const { results: filteredNetworkRequests, errorMessage: filterError } = useMemo(
    () =>
      filterNetworkRequests(networkRequests, debouncedFilter, {
        isInverted: userSettings.isInvertFilterActive,
        isRegex: userSettings.isRegexActive,
        operationFilters,
      }),
    [networkRequests, debouncedFilter, userSettings.isInvertFilterActive, userSettings.isRegexActive, operationFilters]
  )

  const filteredWebsocketNetworkRequests = useMemo(() => {
    if (operationFilters.subscription) {
      return webSocketNetworkRequests
    } else {
      return []
    }
  }, [operationFilters.subscription, webSocketNetworkRequests])

  const selectedRequest = networkRequests.find(
    (request) => request.id === selectedRowId
  )

  const selectedWebSocketRequest = webSocketNetworkRequests.find(
    (request) => request.id === selectedRowId
  )

  const isRequestSelected = Boolean(selectedRequest || selectedWebSocketRequest)

  useEffect(() => {
    return onNavigate(() => {
      // When navigating to a new page, we always want to clear
      // pending requests as they could never complete once
      // the page has changed.
      //
      // We only want to clear all requests if the user has
      // disabled the preserve logs feature.
      clearWebRequests({
        clearPending: true,
        clearAll: !userSettings.isPreserveLogsActive,
      })
    })
  }, [userSettings.isPreserveLogsActive, clearWebRequests])

  const networkTableData = useMemo((): INetworkTableDataRow[] => {
    return filteredNetworkRequests.map((networkRequest) => {
      const { operationName = '', operation } =
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
        responseBody: networkRequest.response?.body || '',
      }
    })
  }, [filteredNetworkRequests])

  const websocketTableData = useMemo((): INetworkTableDataRow[] => {
    return filteredWebsocketNetworkRequests.map((websocketRequest) => {
      return {
        id: websocketRequest.id,
        type: 'subscription',
        name: 'subscription',
        total: 1,
        status: websocketRequest.status,
        size: 0,
        time: 0,
        url: websocketRequest.url,
        responseBody: '',
      }
    })
  }, [filteredWebsocketNetworkRequests])

  const combinedTableData = useMemo(() => {
    return [...websocketTableData, ...networkTableData]
  }, [networkTableData, websocketTableData])

  return (
    <SplitPaneLayout
      header={
        <Toolbar
          filterValue={userSettings.filter}
          onFilterValueChange={(newFilter) => {
            setUserSettings({ filter: newFilter })
          }}
          preserveLogs={userSettings.isPreserveLogsActive}
          onPreserveLogsChange={(isPreserveLogsActive) => {
            setUserSettings({ isPreserveLogsActive })
          }}
          inverted={userSettings.isInvertFilterActive}
          onInvertedChange={(isInvertFilterActive) => {
            setUserSettings({ isInvertFilterActive })
          }}
          regexActive={userSettings.isRegexActive}
          onRegexActiveChange={(isRegexActive) => {
            setUserSettings({ isRegexActive })
          }}
          websocketUrlFilter={userSettings.websocketUrlFilter}
          onWebsocketUrlFilterChange={(websocketUrlFilter) => {
            setUserSettings({ websocketUrlFilter })
          }}
          showFullWebsocketMessage={userSettings.shouldShowFullWebsocketMessage}
          onShowFullWebsocketMessageChange={(shouldShowFullWebsocketMessage) => {
            setUserSettings({ shouldShowFullWebsocketMessage })
          }}
          newestFirst={userSettings.isNewestFirstActive}
          onNewestFirstChange={(isNewestFirstActive) => {
            setUserSettings({ isNewestFirstActive })
          }}
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
                showFullMessage={userSettings.shouldShowFullWebsocketMessage}
                newestFirst={userSettings.isNewestFirstActive}
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
