import {
  getPrimaryOperation,
  getErrorMessages,
  parseGraphqlRequest,
} from "./graphqlHelpers"

describe("GraphQL Helpers", () => {
  describe("getPrimaryOperation", () => {
    it("Gets the primary operation name for a query", () => {
      const request = {
        request: {
          method: "POST",
          postData: {
            text: JSON.stringify([
              {
                query: `
                    query searchMovieQuery($title: String) {
                      searchMovie(title: $title) {
                        id
                        title
                        genre
                      }
                    }
                  `,
                variables: {
                  title: "Batman",
                },
              },
            ]),
          },
        },
      } as chrome.devtools.network.Request

      const operation = getPrimaryOperation(request)

      expect(operation).toEqual({
        operationName: "searchMovieQuery",
        operation: "query",
      })
    })

    it("Gets the primary operation name for a mutation", () => {
      const request = {
        request: {
          method: "POST",
          postData: {
            text: JSON.stringify([
              {
                query: `
                  mutation createMovieMutation($title: String, $genre: String) {
                    createMovie(title: $title, genre: $genre) {
                      id
                      title
                      genre
                    }
                  }
                `,
                variables: {
                  title: "Batman",
                },
              },
            ]),
          },
        },
      } as chrome.devtools.network.Request

      const operation = getPrimaryOperation(request)

      expect(operation).toEqual({
        operationName: "createMovieMutation",
        operation: "mutation",
      })
    })

    it("Gets the primary operation name for a query with fragments", () => {
      const request = {
        request: {
          method: "POST",
          postData: {
            text: JSON.stringify([
              {
                query: `
                  fragment NameParts on Person {
                    firstName
                    lastName
                  }

                  query getMovieQuery($title: String) {
                    getMovie(title: $title) {
                      id
                      title
                      genre
                    }
                  }
                `,
                variables: {
                  title: "Batman",
                },
              },
            ]),
          },
        },
      } as chrome.devtools.network.Request

      const operation = getPrimaryOperation(request)

      expect(operation).toEqual({
        operationName: "getMovieQuery",
        operation: "query",
      })
    })

    it("Gets the primary operation name for an unnamed query", () => {
      const request = {
        request: {
          method: "POST",
          postData: {
            text: JSON.stringify([
              {
                query: `
                  query {
                    getTopMovie {
                      id
                      title
                      genre
                    }
                  }
                `,
              },
            ]),
          },
        },
      } as chrome.devtools.network.Request

      const operation = getPrimaryOperation(request)

      expect(operation).toEqual({
        operationName: "getTopMovie",
        operation: "query",
      })
    })

    it("Returns null if operation could not be determined", () => {
      const request = {
        request: {
          method: "POST",
          postData: {
            text: JSON.stringify([
              {
                query: ``,
                variables: {},
              },
            ]),
          },
        },
      } as chrome.devtools.network.Request

      const operation = getPrimaryOperation(request)

      expect(operation).toEqual(null)
    })

    it("gets the primary operation name for a GET persisted query", () => {
      const request = {
        request: {
          method: "GET",
          queryString: [
            {
              name: "query",
              value:
                "query+getTopMovie+%7B+getTopMovie+%7B+id+title+genre+%7D%20%7D",
            },
            {
              name: "operationName",
              value: "getTopMovie",
            },
          ],
        },
      } as chrome.devtools.network.Request

      const operation = getPrimaryOperation(request)

      expect(operation).toEqual({
        operationName: "getTopMovie",
        operation: "query",
      })
    })

    it("gets the primary operation name for a POST persisted query", () => {
      const request = {
        request: {
          method: "POST",
          postData: {
            text: JSON.stringify([
              {
                operationName: "createMovie",
                extensions: {
                  persistedQuery: {
                    version: 1,
                    sha256Hash:
                      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
                  },
                },
              },
            ]),
          },
        },
      } as chrome.devtools.network.Request

      const operation = getPrimaryOperation(request)

      expect(operation).toEqual({
        operationName: "createMovie",
        operation: "unknown",
      })
    })

    it("gets the primary operation name for a persisted query using Hash", () => {
      const request = {
        request: {
          method: "GET",
          queryString: [
            {
              name: "operationName",
              value: "getTopMovie",
            },
            {
              name: "extensions",
              value: encodeURIComponent(
                JSON.stringify({
                  persistedQuery: {
                    version: 1,
                    sha256Hash:
                      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
                  },
                })
              ),
            },
          ],
        },
      } as chrome.devtools.network.Request

      const operation = getPrimaryOperation(request)

      expect(operation).toEqual({
        operationName: "getTopMovie",
        operation: "query",
      })
    })

    it("returns null if PUT request", () => {
      const request = {
        request: {
          method: "PUT",
          postData: {
            text: JSON.stringify([
              {
                query: `
                  query {
                    getTopMovie {
                      id
                      title
                      genre
                    }
                  }
                `,
              },
            ]),
          },
        },
      } as chrome.devtools.network.Request

      const operation = getPrimaryOperation(request)

      expect(operation).toBeNull()
    })

    it("returns null if DELETE request", () => {
      const request = {
        request: {
          method: "DELETE",
          queryString: [
            {
              name: "operationName",
              value: "getTopMovie",
            },
            {
              name: "extensions",
              value: encodeURIComponent(
                JSON.stringify({
                  persistedQuery: {
                    version: 1,
                    sha256Hash:
                      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
                  },
                })
              ),
            },
          ],
        },
      } as chrome.devtools.network.Request

      const operation = getPrimaryOperation(request)

      expect(operation).toBeNull()
    })
  })

  describe("parseGraphqlRequest", () => {
    it("returns an array of objects when the string given parses to an array", () => {
      const request = {
        request: {
          method: "POST",
          postData: {
            text: JSON.stringify([
              {
                query: "",
                variables: {},
              },
              {
                query: "",
                variables: {},
              },
            ]),
          },
        },
      } as chrome.devtools.network.Request

      const res = parseGraphqlRequest(request)

      expect(res).toMatchObject([
        {
          query: "",
          variables: {},
        },
        {
          query: "",
          variables: {},
        },
      ])
    })

    it("returns an array of objects when the string given parses to a single object", () => {
      const request = {
        request: {
          method: "POST",
          postData: {
            text: JSON.stringify({
              query: "",
              variables: {},
            }),
          },
        },
      } as chrome.devtools.network.Request

      const res = parseGraphqlRequest(request)

      expect(res).toMatchObject([
        {
          query: "",
          variables: {},
        },
      ])
    })

    it("returns null if the parsed string does not contain the query key", () => {
      const consoleError = jest.spyOn(console, "error")
      consoleError.mockImplementationOnce(() => {})

      const request = {
        request: {
          method: "POST",
          postData: {
            text: JSON.stringify({
              variables: {},
            }),
          },
        },
      } as chrome.devtools.network.Request

      const res = parseGraphqlRequest(request)

      expect(res).toBeNull()

      consoleError.mockRestore()
    })

    it("returns null if the parsed string does not contain a bad variables key", () => {
      const consoleError = jest.spyOn(console, "error")
      consoleError.mockImplementationOnce(() => {})

      const request = {
        request: {
          method: "POST",
          postData: {
            text: JSON.stringify({
              query: "",
              variables: 2,
            }),
          },
        },
      } as chrome.devtools.network.Request

      const res = parseGraphqlRequest(request)

      expect(res).toBeNull()

      consoleError.mockRestore()
    })

    it("returns null if the parsed string is malformed", () => {
      const consoleError = jest.spyOn(console, "error")
      consoleError.mockImplementationOnce(() => {})

      const request = {
        request: {
          method: "POST",
          postData: {
            text: "bad json",
          },
        },
      } as chrome.devtools.network.Request

      const res = parseGraphqlRequest(request)

      expect(res).toBeNull()

      consoleError.mockRestore()
    })

    it("gets an array of objects for a GET persisted query", () => {
      const request = {
        request: {
          method: "GET",
          queryString: [
            {
              name: "query",
              value:
                "query+getTopMovie+%7B+getTopMovie+%7B+id+title+genre+%7D%20%7D",
            },
            {
              name: "operationName",
              value: "getTopMovie",
            },
          ],
        },
      } as chrome.devtools.network.Request

      const res = parseGraphqlRequest(request)

      expect(res).toEqual([
        {
          query: "query getTopMovie { getTopMovie { id title genre } }",
        },
      ])
    })

    it("gets an array of objects for a POST persisted query", () => {
      const request = {
        request: {
          method: "POST",
          postData: {
            text: JSON.stringify([
              {
                operationName: "createMovie",
                extensions: {
                  persistedQuery: {
                    version: 1,
                    sha256Hash:
                      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
                  },
                },
              },
            ]),
          },
        },
      } as chrome.devtools.network.Request

      const res = parseGraphqlRequest(request)

      expect(res).toEqual([
        {
          operationName: "createMovie",
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash:
                "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
            },
          },
        },
      ])
    })

    it("gets an array of objects for a persisted query using Hash", () => {
      const request = {
        request: {
          method: "GET",
          queryString: [
            {
              name: "operationName",
              value: "getTopMovie",
            },
            {
              name: "extensions",
              value: encodeURIComponent(
                JSON.stringify({
                  persistedQuery: {
                    version: 1,
                    sha256Hash:
                      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
                  },
                })
              ),
            },
          ],
        },
      } as chrome.devtools.network.Request

      const res = parseGraphqlRequest(request)

      expect(res).toEqual([
        {
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash:
                "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
            },
          },
          query: "",
        },
      ])
    })

    it("Returns null if PUT request", () => {
      const request = {
        request: {
          method: "PUT",
          postData: {
            text: JSON.stringify([
              {
                query: `
                  query {
                    getTopMovie {
                      id
                      title
                      genre
                    }
                  }
                `,
              },
            ]),
          },
        },
      } as chrome.devtools.network.Request

      const res = parseGraphqlRequest(request)

      expect(res).toBeNull()
    })

    it("Returns null if DELETE request", () => {
      const request = {
        request: {
          method: "DELETE",
          queryString: [
            {
              name: "operationName",
              value: "getTopMovie",
            },
            {
              name: "extensions",
              value: encodeURIComponent(
                JSON.stringify({
                  persistedQuery: {
                    version: 1,
                    sha256Hash:
                      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
                  },
                })
              ),
            },
          ],
        },
      } as chrome.devtools.network.Request

      const res = parseGraphqlRequest(request)

      expect(res).toBeNull()
    })
  })

  describe("getErrorMessages", () => {
    it("Returns null for invalid JSON", () => {
      const errorMessages = getErrorMessages("{'invalid JSON'}")
      expect(errorMessages).toEqual(null)
    })

    it("Returns null when no body", () => {
      const errorMessages = getErrorMessages(undefined)
      expect(errorMessages).toEqual(null)
    })

    it("Returns empty array when no errors", () => {
      const errorMessages = getErrorMessages(
        JSON.stringify({
          data: [],
        })
      )
      expect(errorMessages).toEqual([])
    })

    it("Parses multiple error messages correctly", () => {
      const errorMessages = getErrorMessages(
        JSON.stringify({
          errors: [{ message: "First Error" }, { message: "Second Error" }],
        })
      )
      expect(errorMessages).toEqual(["First Error", "Second Error"])
    })
  })
})
