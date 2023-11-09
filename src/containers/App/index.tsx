import { SearchProvider } from "../../hooks/useSearch"
import { NetworkTabsProvider } from "../../hooks/useNetworkTabs"
import { useDarkTheme } from "../../hooks/useTheme"
import { Main } from "../Main"
import { RequestViewSectionsProvider } from "@/hooks/useRequestViewSections"
import { ShareMessageProvider } from "../../hooks/useShareMessage"
import { OperationFiltersProvider } from "../../hooks/useOperationFilters"

export const App = () => {
  const isDarkTheme = useDarkTheme()

  return (
    <ShareMessageProvider>
      <OperationFiltersProvider>
        <NetworkTabsProvider>
          <RequestViewSectionsProvider>
            <SearchProvider>
              <div
                className={isDarkTheme ? "dark" : ""}
                data-color-scheme={isDarkTheme ? "dark" : "light"}
              >
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                  <Main />
                </div>
              </div>
            </SearchProvider>
          </RequestViewSectionsProvider>
        </NetworkTabsProvider>
      </OperationFiltersProvider>
    </ShareMessageProvider>
  )
}
