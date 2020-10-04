import React from "react";
import { render, fireEvent, within } from "@testing-library/react";
import { App } from "./index";

test("renders the table only by default", () => {
  const { queryByTestId } = render(<App />);

  expect(queryByTestId("network-table")).toBeInTheDocument();
  expect(queryByTestId("network-tabs")).not.toBeInTheDocument();
});

test("opens the side panel when clicking a table row", () => {
  const { getAllByText, getByTestId } = render(<App />);

  fireEvent.click(getAllByText(/getMovie/i)[0]);

  expect(getByTestId("network-tabs")).toBeInTheDocument();
});

test("closes the side panel when clicking the 'x' button", () => {
  const { queryByTestId, getByTestId, getAllByText } = render(<App />);

  fireEvent.click(getAllByText(/getMovie/i)[0]);
  fireEvent.click(getByTestId("close-side-panel"));

  expect(queryByTestId("network-tabs")).not.toBeInTheDocument();
});

test("renders all network data within the table", () => {
  const { queryByTestId } = render(<App />);
  const table = queryByTestId("network-table");
  if (!table) {
    throw new Error("Table not found in dom");
  }
  const { queryAllByRole } = within(table);

  expect(queryAllByRole("row")).toHaveLength(41);
});

test("clears the table of all network data when clicking the bin button", () => {
  const { queryByTestId } = render(<App />);
  const table = queryByTestId("network-table");
  if (!table) {
    throw new Error("Table not found in dom");
  }
  const { getByTestId, queryAllByRole } = within(table);

  fireEvent.click(getByTestId("clear-network-table"));

  expect(queryAllByRole("row")).toHaveLength(1);
});
