import { useCallback, useMemo, useState } from "react"
import { SplitPaneLayout } from "@/components/Layout"
import { useNetworkMonitor } from "@/hooks/useNetworkMonitor"
import { useSearch } from "@/hooks/useSearch"
import { useNetworkTabs } from "@/hooks/useNetworkTabs"
import { NetworkPanel } from "../NetworkPanel"
import { SearchPanel } from "../SearchPanel"
import { SupportPopover } from "../../components/SupportPopover"
import { useWebSocketNetworkMonitor } from "../../hooks/useWebSocketNetworkMonitor"

export const Main = () => {
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(
    null
  )
  const [networkRequests, clearWebRequests] = useNetworkMonitor()
  const [webSocketNetworkRequests, clearWebSocketNetworkRequests] =
    useWebSocketNetworkMonitor()
  const { isSearchOpen } = useSearch()
  const { setActiveTab } = useNetworkTabs()

  const clearRequests = useCallback(() => {
    clearWebRequests()
    clearWebSocketNetworkRequests()
  }, [clearWebRequests, clearWebSocketNetworkRequests])

  return (
    <>
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
          />
        }
      />
      <SupportPopover />
    </>
  )
}
