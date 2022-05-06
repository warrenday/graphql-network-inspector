import { render } from "@testing-library/react"
import { FunctionComponent } from "react"
import { useFormattedCode } from "./useFormattedCode"

const minifiedCode = `query {foo(bar:{baz:"hello world"}){id nested{thing}}}`

const expectedFormattedCode = `query {
  foo(bar: { baz: "hello world" }) {
    id
    nested {
      thing
    }
  }
}
`

export function testSimpleReactHook<Value>(useTest: () => Value) {
  let result: null | Value = null
  const Component: FunctionComponent = () => {
    result = useTest()
    return null
  }
  render(<Component />)
  return result
}

describe("useFormattedCode", () => {
  it("should format GraphQL code", () => {
    const result = testSimpleReactHook(() =>
      useFormattedCode(minifiedCode, "graphql", true)
    )
    expect(result).toBe(expectedFormattedCode)
  })

  it("should return unchanged code when enabled=false", () => {
    const result = testSimpleReactHook(() =>
      useFormattedCode(minifiedCode, "graphql", false)
    )
    expect(result).toBe(minifiedCode)
  })

  it("should return unchanged code when non-graphql language", () => {
    const json = JSON.stringify({ foo: { bar: "baz" } })
    const result = testSimpleReactHook(() =>
      useFormattedCode(json, "json", true)
    )
    expect(result).toBe(json)
  })
})
