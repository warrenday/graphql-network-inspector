import {
  getPrimaryOperation,
  getErrorMessages,
  parseGraphqlRequest,
} from "./graphqlHelpers";

describe("GraphQL Helpers", () => {
  describe("getPrimaryOperation", () => {
    it("Gets the primary operation name for a query", () => {
      const operation = getPrimaryOperation(
        JSON.stringify([
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
        ])
      );

      expect(operation).toEqual({
        operationName: "searchMovieQuery",
        operation: "query",
      });
    });

    it("Gets the primary operation name for a mutation", () => {
      const operation = getPrimaryOperation(
        JSON.stringify([
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
        ])
      );

      expect(operation).toEqual({
        operationName: "createMovieMutation",
        operation: "mutation",
      });
    });

    it("Gets the primary operation name for a query with fragments", () => {
      const operation = getPrimaryOperation(
        JSON.stringify([
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
        ])
      );

      expect(operation).toEqual({
        operationName: "getMovieQuery",
        operation: "query",
      });
    });

    it("Gets the primary operation name for an unnamed query", () => {
      const operation = getPrimaryOperation(
        JSON.stringify([
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
        ])
      );

      expect(operation).toEqual({
        operationName: "getTopMovie",
        operation: "query",
      });
    });

    it("Returns null if operation could not be determined", () => {
      const operation = getPrimaryOperation(
        JSON.stringify([
          {
            query: ``,
            variables: {},
          },
        ])
      );

      expect(operation).toEqual(null);
    });
  });

  describe("parseGraphqlRequest", () => {
    it("returns an array of objects when the string given parses to an array", () => {
      const res = parseGraphqlRequest(
        JSON.stringify([
          {
            query: "",
            variables: {},
          },
          {
            query: "",
            variables: {},
          },
        ])
      );

      expect(res).toMatchObject([
        {
          query: "",
          variables: {},
        },
        {
          query: "",
          variables: {},
        },
      ]);
    });

    it("returns an array of objects when the string given parses to a single object", () => {
      const res = parseGraphqlRequest(
        JSON.stringify({
          query: "",
          variables: {},
        })
      );

      expect(res).toMatchObject([
        {
          query: "",
          variables: {},
        },
      ]);
    });

    it("returns null if the parsed string does not contain the query key", () => {
      const res = parseGraphqlRequest(
        JSON.stringify({
          variables: {},
        })
      );

      expect(res).toBeNull();
    });

    it("returns null if the parsed string does not contain a bad variables key", () => {
      const res = parseGraphqlRequest(
        JSON.stringify({
          query: "",
          variables: 2,
        })
      );

      expect(res).toBeNull();
    });

    it("returns null if the parsed string is malformed", () => {
      const res = parseGraphqlRequest("bad json");

      expect(res).toBeNull();
    });
  });

  describe("getErrorMessages", () => {
    it("Returns null for invalid JSON", () => {
      const errorMessages = getErrorMessages("{'invalid JSON'}");
      expect(errorMessages).toEqual(null);
    });

    it("Returns null when no body", () => {
      const errorMessages = getErrorMessages(undefined);
      expect(errorMessages).toEqual(null);
    });

    it("Returns empty array when no errors", () => {
      const errorMessages = getErrorMessages(
        JSON.stringify({
          data: [],
        })
      );
      expect(errorMessages).toEqual([]);
    });

    it("Parses multiple error messages correctly", () => {
      const errorMessages = getErrorMessages(
        JSON.stringify({
          errors: [{ message: "First Error" }, { message: "Second Error" }],
        })
      );
      expect(errorMessages).toEqual(["First Error", "Second Error"]);
    });
  });
});
