import { render, fireEvent } from "@testing-library/react"
import { CopyButton } from "./"

const textToCopy = "Hello"

jest.mock("copy-to-clipboard", () => {
  return jest.fn()
})

describe("CopyButton", () => {
  it("renders a <CopyButton/>", () => {
    const { getByTestId } = render(<CopyButton textToCopy={textToCopy} />)
    expect(getByTestId("copy-button")).toHaveTextContent("Copy")
  })

  it("fires an event when clicked", () => {
    const { getByTestId } = render(<CopyButton textToCopy={textToCopy} />)
    fireEvent.click(getByTestId("copy-button"))
    expect(getByTestId("copy-button")).toHaveTextContent("Copied!")
  })
})
