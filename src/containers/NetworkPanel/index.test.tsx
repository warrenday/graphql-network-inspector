import { fireEvent } from "@testing-library/react"
import { NetworkPanel } from "./index"
import { render } from "../../test-utils"

jest.mock("@/hooks/useHighlight", () => ({
  useHighlight: () => ({
    markup: "<div>hi</div>",
    loading: false,
  }),
}))

describe("NetworkPanel", () => {
  it("invalid regex is provided, regex mode is on - error message is rendered", () => {
    const { getByTestId, getByText } = render(
      <NetworkPanel
        selectedRowId={null}
        setSelectedRowId={() => {}}
        networkRequests={[]}
        webSocketNetworkRequests={[]}
        clearWebRequests={() => {}}
      />
    )
    const filterInput = getByTestId("filter-input")
    const regexCheckbox = getByTestId("regex-checkbox")

    // click the regex checkbox to turn the regex mode on
    fireEvent.click(regexCheckbox)

    // enter an invalid regex into the filter input
    fireEvent.change(filterInput, { target: { value: "++" } })

    // ensure the error message related to the invalid regex was rendered
    expect(
      getByText("Invalid regular expression: /++/: Nothing to repeat")
    ).toBeInTheDocument()
  })

  it("invalid regex is provided, regex mode is off - error message is not rendered", () => {
    const { getByTestId, queryByText } = render(
      <NetworkPanel
        selectedRowId={null}
        setSelectedRowId={() => {}}
        networkRequests={[]}
        webSocketNetworkRequests={[]}
        clearWebRequests={() => {}}
      />
    )
    const filterInput = getByTestId("filter-input")

    // enter an invalid regex into the filter input
    fireEvent.change(filterInput, { target: { value: "++" } })

    // ensure the error message related to the invalid regex was not rendered
    expect(
      queryByText("Invalid regular expression: /++/: Nothing to repeat")
    ).not.toBeInTheDocument()
  })
})
