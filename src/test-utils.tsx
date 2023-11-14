import { RenderOptions, render } from "@testing-library/react"
import { ReactElement } from "react"
import { OperationFiltersProvider } from "./hooks/useOperationFilters"
import { ShareMessageProvider } from "./hooks/useShareMessage"

interface ITestRenderWrapperProps {
  children: ReactElement
}

const TestRenderWrapper: React.FC<ITestRenderWrapperProps> = (props) => {
  const { children } = props

  return (
    <ShareMessageProvider>
      <OperationFiltersProvider>{children}</OperationFiltersProvider>
    </ShareMessageProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => {
  return render(ui, { wrapper: TestRenderWrapper, ...options })
}

export { customRender as render }
