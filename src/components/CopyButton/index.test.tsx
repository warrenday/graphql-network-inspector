import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyButton } from "./";

const textToCopy = "Hello";

test("renders a <CopyButton/>", () => {
  const { getByTestId } = render(<CopyButton textToCopy={textToCopy} />);
  expect(getByTestId("copy-button")).toHaveTextContent("Copy");
});

test("fires an event when clicked", () => {
  const { getByTestId } = render(<CopyButton textToCopy={textToCopy} />);
  userEvent.click(getByTestId("copy-button"));
  expect(getByTestId("copy-button")).toHaveTextContent("Copied!");
});
