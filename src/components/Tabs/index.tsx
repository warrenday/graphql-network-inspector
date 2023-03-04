import { ReactNode } from "react"
import cx from "classnames"
import { Header } from "../Header"

export type Tab = {
  id?: string
  title: string
  component: ReactNode
  bottomComponent?: ReactNode
}

export type TabsProps = {
  tabs: Tab[]
  leftContent?: ReactNode
  activeTab: number
  onTabClick: (activeTab: number) => void
  testId?: string
}

export const Tabs = (props: TabsProps) => {
  const { tabs, leftContent, activeTab, onTabClick, testId } = props

  return (
    <div className="flex flex-col h-full" data-testid={testId}>
      <Header leftContent={leftContent}>
        {tabs.map((tab, i) => {
          const isActive = i === activeTab
          return (
            <button
              key={i}
              className={cx(
                "px-4 py-2 bg-none whitespace-nowrap dark:hover:bg-gray-700",
                {
                  "text-gray-500 dark:text-gray-400": !isActive,
                  "bg-gray-300 dark:bg-gray-700": isActive,
                }
              )}
              onClick={() => onTabClick(i)}
              role="tab"
              aria-selected={isActive}
              data-testid={`tab-button-${tab.id || tab.title}`}
            >
              <h2 className="font-bold">{tab.title}</h2>
            </button>
          )
        })}
      </Header>
      <div className="h-full overflow-y-auto dark:bg-gray-900">
        {tabs[activeTab]?.component}
      </div>
      {tabs[activeTab]?.bottomComponent && (
        <div className="bottom-0 w-full">
          {tabs[activeTab]?.bottomComponent}
        </div>
      )}
    </div>
  )
}
