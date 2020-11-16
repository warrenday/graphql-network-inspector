import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { CopyButton } from "./";

const textToCopy = "Hello";

jest.mock("copy-to-clipboard", () => {
  return jest.fn();
});

test("renders a <CopyButton/>", () => {
  const { getByTestId } = render(<CopyButton textToCopy={textToCopy} />);
  expect(getByTestId("copy-button")).toHaveTextContent("Copy");
});

test("fires an event when clicked", () => {
  const { getByTestId } = render(<CopyButton textToCopy={textToCopy} />);
  fireEvent.click(getByTestId("copy-button"));
  expect(getByTestId("copy-button")).toHaveTextContent("Copied!");
});
