import React from "react";
import { NetworkTable } from "./index";
import { render, fireEvent } from "@testing-library/react";

const request = {
  time: 1000,
  status: 200,
  url: "https://someurl.com/graphql",
  request: {
    primaryOperation: {
      operation: "",
      operationName: "",
    },
    body: [],
  },
  response: {
    bodySize: 1000,
  },
};

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
] as any[];

test("Selects next row when pressing the down arrow", () => {
  const mockOnRowSelect = jest.fn();
  const { getByTestId } = render(
    <NetworkTable
      data={data}
      onRowClick={() => {}}
      onRowSelect={mockOnRowSelect}
      onClear={() => {}}
      selectedRowId="2"
    />
  );
  const table = getByTestId("network-table");

  fireEvent.keyDown(table, { code: "ArrowDown" });

  expect(mockOnRowSelect).toHaveBeenCalledWith("3");
});

test("Selects previous row when pressing the up arrow", () => {
  const mockOnRowSelect = jest.fn();
  const { getByTestId } = render(
    <NetworkTable
      data={data}
      onRowClick={() => {}}
      onRowSelect={mockOnRowSelect}
      onClear={() => {}}
      selectedRowId="2"
    />
  );
  const table = getByTestId("network-table");

  fireEvent.keyDown(table, { code: "ArrowUp" });

  expect(mockOnRowSelect).toHaveBeenCalledWith("1");
});

test("Remains on bottom row when pressing the down arrow", () => {
  const mockOnRowSelect = jest.fn();
  const { getByTestId } = render(
    <NetworkTable
      data={data}
      onRowClick={() => {}}
      onRowSelect={mockOnRowSelect}
      onClear={() => {}}
      selectedRowId="3"
    />
  );
  const table = getByTestId("network-table");

  fireEvent.keyDown(table, { code: "ArrowDown" });

  expect(mockOnRowSelect).not.toHaveBeenCalled();
});

test("Remains on top row when pressing the up arrow", () => {
  const mockOnRowSelect = jest.fn();
  const { getByTestId } = render(
    <NetworkTable
      data={data}
      onRowClick={() => {}}
      onRowSelect={mockOnRowSelect}
      onClear={() => {}}
      selectedRowId="1"
    />
  );
  const table = getByTestId("network-table");

  fireEvent.keyDown(table, { code: "ArrowUp" });

  expect(mockOnRowSelect).not.toHaveBeenCalled();
});
