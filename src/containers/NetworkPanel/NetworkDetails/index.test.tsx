import { render } from "@testing-library/react"
import { TracingView } from "./TracingView"
import * as safeJson from "@/helpers/safeJson"

jest.mock("@/hooks/useHighlight", () => ({
  useHighlight: () => ({
    markup: "<div>hi</div>",
    loading: false,
  }),
}))

describe("NetworkDetails - TracingView", () => {
  it("show 'No tracing' message when the tracing object is null", async () => {
    const noTracingResponse = safeJson.stringify({
      data: {
        signedInUser: {
          id: "1",
          firstName: "Test",
          lastName: "User",
        },
      },
    })

    const { queryByText } = render(<TracingView response={noTracingResponse} />)

    expect(queryByText("No tracing found.")).toBeVisible()
  })

  it("show total request time", async () => {
    const withTracingResponse = safeJson.stringify({
      extensions: {
        tracing: {
          startTime: "2021-01-01T00:00:00.000Z",
          endTime: "2021-01-01T00:00:00.025Z",
          duration: 24085701,
          execution: {
            resolvers: [],
          },
        },
      },
    })

    const { getByText } = render(<TracingView response={withTracingResponse} />)

    expect(getByText("Total")).toBeVisible()
    expect(getByText("24.09 ms")).toBeVisible()
  })

  it("visualize the execution trace", async () => {
    const withTracingResponse = safeJson.stringify({
      extensions: {
        tracing: {
          duration: 1000000,
          execution: {
            resolvers: [
              {
                path: ["signedInUser"],
                parentType: "Query",
                fieldName: "signedInUser",
                returnType: "User",
                startOffset: 50000,
                duration: 150000,
              },
              {
                path: ["signedInUser", "id"],
                parentType: "Query",
                fieldName: "id",
                returnType: "ID!",
                startOffset: 200000,
                duration: 100000,
              },
              {
                path: ["signedInUser", "firstName"],
                parentType: "User",
                fieldName: "firstName",
                returnType: "String",
                startOffset: 200000,
                duration: 700000,
              },
              {
                path: ["signedInUser", "lastName"],
                parentType: "User",
                fieldName: "lastName",
                returnType: "String",
                startOffset: 200000,
                duration: 750000,
              },
            ],
          },
        },
      },
    })

    const { getByText } = render(<TracingView response={withTracingResponse} />)

    expect(getByText("signedInUser")).toBeVisible()
    expect(getByText("0.15 ms")).toBeVisible()

    expect(getByText("signedInUser.id")).toBeVisible()
    expect(getByText("0.1 ms")).toBeVisible()

    expect(getByText("signedInUser.firstName")).toBeVisible()
    expect(getByText("0.7 ms")).toBeVisible()

    expect(getByText("signedInUser.lastName")).toBeVisible()
    expect(getByText("0.75 ms")).toBeVisible()
  })
})
