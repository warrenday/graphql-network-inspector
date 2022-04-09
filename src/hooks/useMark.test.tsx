import { render } from "@testing-library/react"
import { useMark } from "./useMark"

const TestComponent = (props: { search: string }) => {
  const ref = useMark(props.search)
  return (
    <div ref={ref} data-testid="target">
      The quick brown fox jumps over the lazy dog again
    </div>
  )
}

describe("useMark", () => {
  it("should mark the searched text within the dom for a single letter", () => {
    const search = "a"

    const { container } = render(<TestComponent search={search} />)

    const markedElements = container.querySelectorAll("mark")

    // There are three "a"s in the test text and they should all be marked
    expect(markedElements).toHaveLength(3)
    markedElements.forEach((element) => {
      expect(element).toHaveTextContent(search)
    })
  })

  it("should mark the searched text within the dom for a whole phrase (case-insensetive)", () => {
    const search = "Brown Fox"

    const { container } = render(<TestComponent search={search} />)

    const markedElements = container.querySelectorAll("mark")

    // There are three "a"s in the test text and they should all be marked
    expect(markedElements).toHaveLength(1)
    markedElements.forEach((element) => {
      expect(element).toHaveTextContent("brown fox")
    })
  })
})
