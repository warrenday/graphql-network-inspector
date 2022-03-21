import { render, fireEvent } from "@testing-library/react"
import { Table, TableProps } from "./index"

const data = [
  {
    id: 1,
    title: "Batman Begins",
    year: 2005,
    rating: 4,
  },
  {
    id: 2,
    title: "Get Out",
    year: 2017,
    rating: 5,
  },
  {
    id: 3,
    title: "George of the Jungle",
    year: 1997,
    rating: 3,
  },
]

const columns: TableProps<typeof data[0]>["columns"] = [
  {
    accessor: "title",
    Header: "Title",
  },
  {
    accessor: "year",
    Header: "Year",
  },
  {
    accessor: "rating",
    Header: "Rating",
  },
]

test("outputs correct row index and data when a row is clicked", () => {
  const mockOnRowClick = jest.fn()
  const { getByText } = render(
    <Table columns={columns} data={data} onRowClick={mockOnRowClick} />
  )

  fireEvent.click(getByText(/Get Out/i))

  expect(mockOnRowClick).toHaveBeenCalledWith(2, {
    id: 2,
    title: "Get Out",
    year: 2017,
    rating: 5,
  })
})

test("data is empty - empty table message is rendered", () => {
  const { getByText } = render(<Table columns={columns} data={[]} />)

  // ensure the empty table message was rendered
  expect(getByText("No requests have been detected")).toBeInTheDocument()
})

test("data is empty and an error message is provided - error message is rendered", () => {
  const { getByText, queryByText } = render(
    <Table columns={columns} data={[]} error={"someErrorMessage"} />
  )

  // ensure the empty table message was not rendered
  expect(queryByText("No requests have been detected")).not.toBeInTheDocument()

  // ensure the error message was rendered
  expect(getByText("someErrorMessage")).toBeInTheDocument()
})
