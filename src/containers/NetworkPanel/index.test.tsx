import { NetworkPanel } from "./index"
import { render, fireEvent } from "@testing-library/react"

test("Invalid regex is provided, regex mode is on - error message shows", () => {
  const { getByTestId, getByText } = render(
    <NetworkPanel
      selectedRowId={null}
      setSelectedRowId={() => {}}
      networkRequests={[]}
      clearWebRequests={() => {}}
    />
  )
  const filterInput = getByTestId("filter-input")
  const regexCheckbox = getByTestId("regex-checkbox")

  // click the regex checkbox to turn the regex mode on
  fireEvent.click(regexCheckbox)

  // enter an invalid regex expression
  fireEvent.change(filterInput, { target: { value: "++" } })

  expect(
    getByText("Invalid regular expression: /++/: Nothing to repeat")
  ).toBeInTheDocument()
})

test("Invalid regex is provided, regex mode is off - error message does not show", () => {
  const { getByTestId, queryByText } = render(
    <NetworkPanel
      selectedRowId={null}
      setSelectedRowId={() => {}}
      networkRequests={[]}
      clearWebRequests={() => {}}
    />
  )
  const filterInput = getByTestId("filter-input")

  // enter an invalid regex expression
  fireEvent.change(filterInput, { target: { value: "++" } })

  expect(
    queryByText("Invalid regular expression: /++/: Nothing to repeat")
  ).not.toBeInTheDocument()
})
