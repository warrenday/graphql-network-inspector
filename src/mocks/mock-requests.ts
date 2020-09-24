import dedent from "dedent";

const url = "http://graphql-network-monitor.com/graphql";

const createRequest = ({
  request,
  response,
}: {
  request: {
    query: string;
    variables: object;
  }[];
  response: object;
}) => {
  return {
    request: {
      url,
      headers: [],
      postData: {
        text: JSON.stringify(
          request.map(({ query, variables }) => ({
            query: dedent(query),
            variables,
          }))
        ),
      },
    },
    response: {
      status: 200,
      headers: [],
    },
    getContent: (cb: Function) => {
      cb(JSON.stringify(response));
    },
  };
};

export const mockRequests = [
  createRequest({
    request: [
      {
        query: `
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
    ],
    response: {
      data: {
        getMovie: {
          id: "1",
          title: "Batman",
          genre: "Action",
        },
      },
    },
  }),
  createRequest({
    request: [
      {
        query: `
          query searchMovie($title: String) {
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
    ],
    response: {
      data: {
        searchMovie: [
          {
            id: "1",
            title: "Batman",
            genre: "Action",
          },
          {
            id: "2",
            title: "American Psycho",
            genre: "Thriller",
          },
          {
            id: "3",
            title: "The Godfather",
            genre: "Drama",
          },
        ],
      },
    },
  }),
  createRequest({
    request: [
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
    ],
    response: {
      data: {
        createMovie: {
          id: "4",
          title: "Batman Again",
          genre: "Action",
        },
      },
    },
  }),
  createRequest({
    request: [
      {
        query: `
          query listActors {
            listActors {
              id
              name
            }
          }
        `,
        variables: {},
      },
      {
        query: `
          query listCategories {
            listCategories {
              id
              title
            }
          }
        `,
        variables: {},
      },
    ],
    response: {
      data: {
        listActors: [
          {
            id: "1",
            name: "Tom Hanks",
          },
          {
            id: "2",
            name: "Robert De Niro",
          },
          {
            id: "3",
            name: "Brad Pitt",
          },
        ],
        listCategories: [
          {
            id: "1",
            name: "Action",
          },
          {
            id: "2",
            name: "Horror",
          },
        ],
      },
    },
  }),
];
