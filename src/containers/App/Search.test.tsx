import React from "react";
import { render, fireEvent, within, waitFor } from "@testing-library/react";
import { App } from "./index";

describe("App - Search", () => {
  it("search panel is closed by default", async () => {
    const { queryByTestId, getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText(/getMovie/i)).toBeInTheDocument();
    });

    expect(queryByTestId("search-panel")).not.toBeInTheDocument();
  });

  it("opens the search panel when clicking the search button", async () => {
    const { getByTestId, getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText(/getMovie/i)).toBeInTheDocument();
    });

    fireEvent.click(getByTestId("search-button"));
    expect(getByTestId("search-panel")).toBeInTheDocument();
  });

  it("opens the getMovieQuery when clicking the search result", async () => {
    const { getByTestId, getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText(/getMovie/i)).toBeInTheDocument();
    });

    fireEvent.click(getByTestId("search-button"));
    fireEvent.change(getByTestId("search-input"), {
      target: { value: "getmovie" },
    });
    fireEvent.keyDown(window, { key: "Enter", code: "Enter" });

    fireEvent.click(
      within(getByTestId("search-results-0")).getByText("Request")
    );

    const rows = within(getByTestId("network-table")).getAllByRole("row");
    expect(rows[1]).toHaveAttribute("aria-selected", "true");
    expect(rows[1]).toHaveTextContent("getMovieQuery");
  });

  it("open the headers tab when clicking a search result", async () => {
    const { getByTestId, getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText(/getMovie/i)).toBeInTheDocument();
    });

    fireEvent.click(getByTestId("search-button"));

    fireEvent.change(getByTestId("search-input"), {
      target: { value: "auth" },
    });
    fireEvent.keyDown(window, { key: "Enter", code: "Enter" });

    fireEvent.click(
      within(getByTestId("search-results-0")).getByText("Header")
    );

    expect(getByTestId("tab-button-headers")).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("open the request tab when clicking a search result", async () => {
    const { getByTestId, getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText(/getMovie/i)).toBeInTheDocument();
    });

    fireEvent.click(getByTestId("search-button"));

    fireEvent.change(getByTestId("search-input"), {
      target: { value: "getmovie" },
    });
    fireEvent.keyDown(window, { key: "Enter", code: "Enter" });

    fireEvent.click(
      within(getByTestId("search-results-0")).getByText("Request")
    );

    expect(getByTestId("tab-button-request")).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("open the response (raw) tab when clicking a search result", async () => {
    const { getByTestId, getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText(/getMovie/i)).toBeInTheDocument();
    });

    fireEvent.click(getByTestId("search-button"));

    fireEvent.change(getByTestId("search-input"), {
      target: { value: "batman" },
    });
    fireEvent.keyDown(window, { key: "Enter", code: "Enter" });

    fireEvent.click(
      within(getByTestId("search-results-0")).getByText("Response")
    );

    expect(getByTestId("tab-button-response-raw")).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
});
