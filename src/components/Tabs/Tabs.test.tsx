import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Tabs, Tab } from "./index";

const tabs: Tab[] = [
  {
    title: "Tab One",
    component: () => <div>I am tab one</div>,
  },
  {
    title: "Tab Two",
    component: () => <div>I am tab two</div>,
  },
];

test("renders the first tab as the default active tab", () => {
  const { queryByText } = render(<Tabs tabs={tabs} />);

  expect(queryByText(/I am tab one/)).toBeInTheDocument();
  expect(queryByText(/I am tab two/)).not.toBeInTheDocument();
});

test("changes the active tab when button clicked", () => {
  const { getByText, queryByText } = render(<Tabs tabs={tabs} />);

  fireEvent.click(getByText(/Tab Two/));

  expect(queryByText(/I am tab one/)).not.toBeInTheDocument();
  expect(queryByText(/I am tab two/)).toBeInTheDocument();
});
