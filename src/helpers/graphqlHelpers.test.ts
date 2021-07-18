import { getPrimaryOperation } from "./graphqlHelpers";

describe("GraphQL Helpers", () => {
  it("Gets the primary operation name for a query", () => {
    const operation = getPrimaryOperation(
      JSON.stringify([
        {
          query: `
            query searchMovie($title: String) {
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
      operationName: "searchMovie",
      operation: "query",
    });
  });

  it("Gets the primary operation name for a mutation", () => {
    const operation = getPrimaryOperation(
      JSON.stringify([
        {
          query: `
            mutation createMovie($title: String, $genre: String) {
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
      operationName: "createMovie",
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

            query getMovie($title: String) {
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
      operationName: "getMovie",
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
