import { useState, createContext, useContext } from "react"

export type RequestViewSectionType = "query" | "variables" | "extensions" | 'request'

const RequestViewSectionsContext = createContext<{
  collapsedSections: Partial<Record<string, boolean>>
  setIsSectionCollapsed: (
    sectionId: string,
    isCollapsed: boolean
  ) => void
}>({
  collapsedSections: {},
  setIsSectionCollapsed: () => null,
})

export const RequestViewSectionsProvider: React.FC = ({ children }) => {
  const [collapsedSections, setCollapsedSections] = useState(
    {} as Partial<Record<string, boolean>>
  )

  function setIsSectionCollapsed(
    sectionId: string,
    isCollapsed: boolean
  ) {
    setCollapsedSections({
      ...collapsedSections,
      [sectionId]: isCollapsed,
    })
  }

  return (
    <RequestViewSectionsContext.Provider
      value={{ collapsedSections, setIsSectionCollapsed }}
    >
      {children}
    </RequestViewSectionsContext.Provider>
  )
}

export const useRequestViewSections = () => {
  return useContext(RequestViewSectionsContext)
}
