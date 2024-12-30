import { useCallback, useState } from 'react'
import { SplitPaneLayout } from '@/components/Layout'
import {
  IClearWebRequestsOptions,
  useNetworkMonitor,
} from '@/hooks/useNetworkMonitor'
import { useSearch } from '@/hooks/useSearch'
import { useNetworkTabs } from '@/hooks/useNetworkTabs'
import { NetworkPanel } from '../NetworkPanel'
import { SearchPanel } from '../SearchPanel'
import { useWebSocketNetworkMonitor } from '../../hooks/useWebSocketNetworkMonitor'
import { useOperationFilters } from '../../hooks/useOperationFilters'
import useUserSettings from '../../hooks/useUserSettings'
import VersionNumber from '../../components/VersionNumber'

export const Main = () => {
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(
    null
  )
  const { operationFilters } = useOperationFilters()
  const [userSettings, setUserSettings] = useUserSettings()
  const [networkRequests, clearWebRequests] = useNetworkMonitor()
  const [webSocketNetworkRequests, clearWebSocketNetworkRequests] =
    useWebSocketNetworkMonitor({
      isEnabled: operationFilters.subscription,
      urlFilter: userSettings.websocketUrlFilter,
    })
  const { isSearchOpen } = useSearch()
  const { setActiveTab } = useNetworkTabs()

  const clearRequests = useCallback(
    (opts?: IClearWebRequestsOptions) => {
      clearWebRequests(opts)
      clearWebSocketNetworkRequests()
    },
    [clearWebRequests, clearWebSocketNetworkRequests]
  )

  return (
    <>
      <VersionNumber />
      <SplitPaneLayout
        leftPane={
          isSearchOpen ? (
            <SearchPanel
              networkRequests={networkRequests}
              webSocketNetworkRequests={webSocketNetworkRequests}
              onResultClick={(searchResult, networkTab) => {
                setSelectedRowId(searchResult.networkRequest.id)
                setActiveTab(networkTab)
              }}
            />
          ) : undefined
        }
        rightPane={
          <NetworkPanel
            networkRequests={networkRequests}
            webSocketNetworkRequests={webSocketNetworkRequests}
            clearWebRequests={clearRequests}
            selectedRowId={selectedRowId}
            setSelectedRowId={setSelectedRowId}
            userSettings={userSettings}
            setUserSettings={setUserSettings}
          />
        }
      />
    </>
  )
}
