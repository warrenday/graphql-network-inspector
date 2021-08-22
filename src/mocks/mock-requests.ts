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
    time: 1099.4580000406131,
    request: {
      url,
      headers: [
        {
          name: "Authorization",
          value: "Bearer fe0e8768-3b2f-4f63-983d-1a74c26dde1e",
        },
        {
          name: "access-control-allow-credentials",
          value: true,
        },
        {
          name: "access-control-allow-origin",
          value: "https://www.google.com",
        },
        {
          name: "set-cookie:",
          value:
            "SIDCC=fe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1e; expires=Thu, 14-Apr-2022 08:09:50 GMT; path=/; domain=.google.com; priority=high",
        },
      ],
      postData: {
        text: JSON.stringify(
          request.map(({ query, variables }) => ({
            query: dedent(query),
            variables,
          }))
        ),
      },
      headersSize: 698,
      bodySize: 578,
    },
    response: {
      status: 200,
      headers: [
        {
          name: "cookie",
          value:
            "CONSENT=YES+GB.en+20151113-21-1; ANID=fe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1e",
        },
      ],
      headersSize: 589,
      bodySize: 3364,
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
          query {
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
          query {
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
  createRequest({
    request: [
      {
        query: `
          query actorDetailsQuery($id: String) {
            actorDetails(id: $id) {
              ...actorDetailsData
              __typename
            }
          }
          fragment actorDetailsData on ActorDetail {
            id
            name
            __typename
          }
        `,
        variables: {
          id: "2",
        },
      },
    ],
    response: {
      data: {
        actorDetails: [],
      },
    },
  }),
  createRequest({
    request: [
      {
        query: `
          query actorDetailsQuery($id: String) {
            actorDetails(id: $id) {
              ...actorDetailsData
              __typename
            }
          }
          fragment actorDetailsData on ActorDetail {
            id
            name
            __typename
          }
        `,
        variables: {
          id: "3",
        },
      },
    ],
    response: {
      errors: [
        {
          message: "Details for actor with ID 3 could not be fetched",
        },
      ],
    },
  }),
];
