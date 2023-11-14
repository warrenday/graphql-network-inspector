import { render, fireEvent } from "@testing-library/react"
import { Button } from "./"

const testId = "button"

describe("Button", () => {
  it("renders a <Button/>", () => {
    const { getByTestId } = render(<Button testId={testId}>Hello</Button>)
    expect(getByTestId(testId)).toHaveTextContent("Hello")
  })

  it("fires an event when clicked", () => {
    const onClickFn = jest.fn()

    const { getByTestId } = render(
      <Button testId={testId} onClick={onClickFn} />
    )

    fireEvent.click(getByTestId(testId))

    expect(onClickFn).toHaveBeenCalled()
  })

  it("should be of type button", () => {
    const { getByTestId } = render(<Button testId={testId} />)
    expect(getByTestId(testId)).toHaveAttribute("type", "button")
  })
})
