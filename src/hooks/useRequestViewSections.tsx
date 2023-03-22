import { useState, createContext, useContext } from "react"

export type RequestViewSectionId = "query" | "variables" | "extensions"

const RequestViewSectionsContext = createContext<{
  collapsedSections: Partial<Record<RequestViewSectionId, boolean>>
  setIsSectionCollapsed: (
    sectionId: RequestViewSectionId,
    isCollapsed: boolean
  ) => void
}>({
  collapsedSections: {},
  setIsSectionCollapsed: () => null,
})

export const RequestViewSectionsProvider: React.FC = ({ children }) => {
  const [collapsedSections, setCollapsedSections] = useState(
    {} as Partial<Record<RequestViewSectionId, boolean>>
  )

  function setIsSectionCollapsed(
    sectionId: RequestViewSectionId,
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
