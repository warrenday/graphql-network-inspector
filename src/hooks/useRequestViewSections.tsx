import { useState, createContext, useContext } from "react"

export type RequestViewSectionType = "query" | "variables" | "extensions"

const RequestViewSectionsContext = createContext<{
  collapsedSections: Partial<Record<RequestViewSectionType, boolean>>
  setIsSectionCollapsed: (
    sectionId: RequestViewSectionType,
    isCollapsed: boolean
  ) => void
}>({
  collapsedSections: {},
  setIsSectionCollapsed: () => null,
})

export const RequestViewSectionsProvider: React.FC = ({ children }) => {
  const [collapsedSections, setCollapsedSections] = useState(
    {} as Partial<Record<RequestViewSectionType, boolean>>
  )

  function setIsSectionCollapsed(
    sectionId: RequestViewSectionType,
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
