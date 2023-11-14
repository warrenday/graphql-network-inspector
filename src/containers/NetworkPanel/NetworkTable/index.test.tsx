import { NetworkTable, NetworkTableDataRow } from "./index"
import { fireEvent, within } from "@testing-library/react"
import { render } from "../../../test-utils"
import { DeepPartial } from "../../../types"

const request: DeepPartial<NetworkTableDataRow> = {
  time: 1000,
  status: 200,
  url: "https://someurl.com/graphql",
  type: "query",
}

const data = [
  {
    id: "1",
    ...request,
  },
  {
    id: "2",
    ...request,
  },
  {
    id: "3",
    ...request,
  },
] as NetworkTableDataRow[]

describe("NetworkTable", () => {
  it("Selects next row when pressing the down arrow", () => {
    const mockOnRowSelect = jest.fn()
    const { getByTestId } = render(
      <NetworkTable
        data={data}
        onRowClick={() => {}}
        onRowSelect={mockOnRowSelect}
        selectedRowId="2"
      />
    )
    const table = getByTestId("network-table")

    fireEvent.keyDown(table, { code: "ArrowDown" })

    expect(mockOnRowSelect).toHaveBeenCalledWith("3")
  })

  it("Selects previous row when pressing the up arrow", () => {
    const mockOnRowSelect = jest.fn()
    const { getByTestId } = render(
      <NetworkTable
        data={data}
        onRowClick={() => {}}
        onRowSelect={mockOnRowSelect}
        selectedRowId="2"
      />
    )
    const table = getByTestId("network-table")

    fireEvent.keyDown(table, { code: "ArrowUp" })

    expect(mockOnRowSelect).toHaveBeenCalledWith("1")
  })

  it("Remains on bottom row when pressing the down arrow", () => {
    const mockOnRowSelect = jest.fn()
    const { getByTestId } = render(
      <NetworkTable
        data={data}
        onRowClick={() => {}}
        onRowSelect={mockOnRowSelect}
        selectedRowId="3"
      />
    )
    const table = getByTestId("network-table")

    fireEvent.keyDown(table, { code: "ArrowDown" })

    expect(mockOnRowSelect).not.toHaveBeenCalled()
  })

  it("Remains on top row when pressing the up arrow", () => {
    const mockOnRowSelect = jest.fn()
    const { getByTestId } = render(
      <NetworkTable
        data={data}
        onRowClick={() => {}}
        onRowSelect={mockOnRowSelect}
        selectedRowId="1"
      />
    )
    const table = getByTestId("network-table")

    fireEvent.keyDown(table, { code: "ArrowUp" })

    expect(mockOnRowSelect).not.toHaveBeenCalled()
  })

  it("data is empty - empty table message is rendered", () => {
    const { getByTestId } = render(
      <NetworkTable data={[]} onRowClick={() => {}} onRowSelect={() => {}} />
    )
    const table = getByTestId("network-table")

    // ensure the empty table message was rendered
    expect(
      within(table).getByText("No requests have been detected")
    ).toBeInTheDocument()
  })

  it("data is empty and an error message is provided - error message is rendered", () => {
    const { getByTestId } = render(
      <NetworkTable
        data={[]}
        error={"someErrorMessage"}
        onRowClick={() => {}}
        onRowSelect={() => {}}
      />
    )
    const table = getByTestId("network-table")

    // ensure the empty table message was not rendered
    expect(
      within(table).queryByText("No requests have been detected")
    ).not.toBeInTheDocument()

    // ensure the error message was rendered
    expect(within(table).getByText("someErrorMessage")).toBeInTheDocument()
  })
})
