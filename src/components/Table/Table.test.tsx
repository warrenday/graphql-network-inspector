import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Table, TableProps } from "./index";

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
];

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
];

test("outputs correct row index and data when a row is clicked", () => {
  const mockOnRowClick = jest.fn();
  const { getByText } = render(
    <Table columns={columns} data={data} onRowClick={mockOnRowClick} />
  );

  fireEvent.click(getByText(/Get Out/i));

  expect(mockOnRowClick).toHaveBeenCalledWith(2, {
    id: 2,
    title: "Get Out",
    year: 2017,
    rating: 5,
  });
});
