import { TextEncoder } from 'util'

const url = 'http://graphql-network-monitor.com/graphql'

interface IMockRequestInput {
  request: {
    query?: string
    operationName?: string
    variables?: Record<string, unknown>
    extensions?: Record<string, unknown>
  }[]
  response: Record<string, unknown>
}

export interface IMockRequest {
  webRequestBodyDetails: chrome.webRequest.WebRequestBodyDetails
  webRequestHeaderDetails: chrome.webRequest.WebRequestHeadersDetails
  networkRequest: chrome.devtools.network.Request
}

const createRequest = (args: IMockRequestInput): IMockRequest => {
  const { request, response } = args

  const webRequestBodyDetails: chrome.webRequest.WebRequestBodyDetails = {
    frameId: 0,
    parentFrameId: -1,
    tabId: 1,
    type: 'xmlhttprequest',
    timeStamp: 1699975911.862162,
    requestId: '1',
    url,
    method: 'POST',
    requestBody: {
      raw: [
        {
          bytes: new TextEncoder().encode(JSON.stringify(request)),
        },
      ],
    },
  }

  const webRequestHeaderDetails: chrome.webRequest.WebRequestHeadersDetails = {
    documentId: '1',
    documentLifecycle: 'active',
    frameId: 0,
    frameType: 'sub_frame',
    method: 'POST',
    parentFrameId: -1,
    requestId: '1',
    tabId: 1,
    timeStamp: 1699975911.862162,
    type: 'xmlhttprequest',
    url,
    requestHeaders: [],
  }

  const networkRequest: chrome.devtools.network.Request = {
    cache: {},
    startedDateTime: '2021-01-01T00:00:00.000Z',
    time: 1099.4580000406131,
    timings: {
      receive: 0.1,
      wait: 0.1,
    },
    request: {
      url,
      httpVersion: 'HTTP/1.1',
      queryString: [],
      cookies: [],
      bodySize: 100,
      postData: {
        mimeType: 'application/json',
        text: JSON.stringify(
          request.map(({ query, variables, extensions, operationName }) => ({
            query: query,
            operationName,
            variables,
            extensions,
          }))
        ),
      },
      method: 'POST',
      headersSize: 100,
      headers: [],
    },
    response: {
      status: 200,
      statusText: 'OK',
      httpVersion: 'HTTP/1.1',
      cookies: [],
      content: {
        size: 100,
        mimeType: 'application/json',
      },
      redirectURL: '',
      headersSize: 100,
      bodySize: 100,
      headers: [],
    },
    getContent: (cb: Function) => {
      cb(JSON.stringify(response))
    },
  }

  return {
    webRequestBodyDetails,
    webRequestHeaderDetails,
    networkRequest,
  }
}

export const mockRequests: IMockRequest[] = [
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
          title: 'Batman',
        },
      },
    ],
    response: {
      data: {
        getMovie: {
          id: '1',
          title: 'Batman',
          genre: 'Action',
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
          title: 'Batman',
        },
      },
    ],
    response: {
      data: {
        searchMovie: [
          {
            id: '1',
            title: 'Batman',
            genre: 'Action',
          },
          {
            id: '2',
            title: 'American Psycho',
            genre: 'Thriller',
          },
          {
            id: '3',
            title: 'The Godfather',
            genre: 'Drama',
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
          title: 'Batman',
        },
      },
    ],
    response: {
      data: {
        createMovie: {
          id: '4',
          title: 'Batman Again',
          genre: 'Action',
        },
      },
      extensions: {
        tracing: {
          version: 1,
          startTime: '2021-01-01T00:00:00.000Z',
          endTime: '2021-01-01T00:00:00.100Z',
          duration: 100 * 1000000,
          execution: {
            resolvers: [
              {
                path: ['createMovie'],
                parentType: 'Mutation',
                fieldName: 'createMovie',
                returnType: 'Movie',
                startOffset: 10 * 1000000,
                duration: 5 * 1000000,
              },
              {
                path: ['createMovie', 'id'],
                parentType: 'Movie',
                fieldName: 'id',
                returnType: 'ID!',
                startOffset: 15 * 1000000,
                duration: 15 * 1000000,
              },
              {
                path: ['createMovie', 'title'],
                parentType: 'Movie',
                fieldName: 'title',
                returnType: 'String',
                startOffset: 15 * 1000000,
                duration: 75 * 1000000,
              },
              {
                path: ['createMovie', 'genre'],
                parentType: 'Movie',
                fieldName: 'genre',
                returnType: 'String',
                startOffset: 15 * 1000000,
                duration: 80 * 1000000,
              },
            ],
          },
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
            id: '1',
            name: 'Tom Hanks',
          },
          {
            id: '2',
            name: 'Robert De Niro',
          },
          {
            id: '3',
            name: 'Brad Pitt',
          },
        ],
        listCategories: [
          {
            id: '1',
            name: 'Action',
          },
          {
            id: '2',
            name: 'Horror',
          },
        ],
      },
      extensions: {
        tracing: {
          version: 1,
          startTime: '2021-01-01T00:00:00.000Z',
          endTime: '2021-01-01T00:00:00.100Z',
          duration: 100 * 1000000,
          execution: {
            resolvers: [
              {
                path: ['listActors'],
                parentType: 'Query',
                fieldName: 'listActors',
                returnType: 'Actor',
                startOffset: 10 * 1000000,
                duration: 88 * 1000000,
              },
              {
                path: ['listCategories'],
                parentType: 'Query',
                fieldName: 'listCategories',
                returnType: 'Category',
                startOffset: 10 * 1000000,
                duration: 75 * 1000000,
              },
              {
                path: ['listCategories', 0, 'id'],
                parentType: 'Category',
                fieldName: 'id',
                returnType: 'ID!',
                startOffset: 85 * 1000000,
                duration: 1 * 10000,
              },
              {
                path: ['listCategories', 0, 'name'],
                parentType: 'Category',
                fieldName: 'name',
                returnType: 'String',
                startOffset: 85 * 1000000,
                duration: 1 * 10000,
              },
              {
                path: ['listCategories', 1, 'id'],
                parentType: 'Category',
                fieldName: 'id',
                returnType: 'ID!',
                startOffset: 85 * 1000000,
                duration: 1 * 1000000,
              },
              {
                path: ['listCategories', 1, 'name'],
                parentType: 'Category',
                fieldName: 'name',
                returnType: 'String',
                startOffset: 85 * 1000000,
                duration: 1 * 1000000,
              },
              {
                path: ['listActors', 0, 'id'],
                parentType: 'Actor',
                fieldName: 'id',
                returnType: 'ID!',
                startOffset: 98 * 1000000,
                duration: 1 * 1000000,
              },
              {
                path: ['listActors', 0, 'name'],
                parentType: 'Actor',
                fieldName: 'name',
                returnType: 'String',
                startOffset: 98 * 1000000,
                duration: 1 * 1000000,
              },
              {
                path: ['listActors', 1, 'id'],
                parentType: 'Actor',
                fieldName: 'id',
                returnType: 'ID!',
                startOffset: 98 * 1000000,
                duration: 1 * 1000000,
              },
              {
                path: ['listActors', 1, 'name'],
                parentType: 'Actor',
                fieldName: 'name',
                returnType: 'String',
                startOffset: 98 * 1000000,
                duration: 1 * 1000000,
              },
              {
                path: ['listActors', 2, 'id'],
                parentType: 'Actor',
                fieldName: 'id',
                returnType: 'ID!',
                startOffset: 98 * 1000000,
                duration: 2 * 1000000,
              },
              {
                path: ['listActors', 2, 'name'],
                parentType: 'Actor',
                fieldName: 'name',
                returnType: 'String',
                startOffset: 98 * 1000000,
                duration: 2 * 1000000,
              },
            ],
          },
        },
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
          id: '2',
        },
      },
    ],
    response: {
      data: {
        actorDetails: [],
      },
      extensions: {
        tracing: {
          version: 1,
          startTime: '2021-01-01T00:00:00.000Z',
          endTime: '2021-01-01T00:00:00.010Z',
          duration: 1173.12 * 1000000,
          execution: {
            resolvers: [
              {
                path: ['actorDetails'],
                parentType: 'Query',
                fieldName: 'actorDetails',
                returnType: 'ActorDetail',
                startOffset: 1.187133 * 1000000,
                duration: 1171.787124 * 1000000,
              },
              {
                path: ['actorDetails', 'test'],
                parentType: 'ActorDetail',
                fieldName: 'test',
                returnType: 'string',
                startOffset: 1172.974257 * 1000000,
                duration: 0.02 * 1000000,
              },
            ],
          },
        },
      },
    },
  }),
  createRequest({
    request: [
      {
        operationName: 'hasUnseenAnnouncements',
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash:
              'ecf4edb46db40b5132295c0291d62fb65d6759a9eedfa4d5d612dd5ec54a6b38',
          },
          variables: btoa('{"language":"pt"}'),
        },
      },
    ],
    response: {
      data: {
        hasUnseenAnnouncements: true,
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
          id: '3',
        },
      },
    ],
    response: {
      errors: [
        {
          message: 'Details for actor with ID 3 could not be fetched',
        },
      ],
    },
  }),
  // WebSocket (GraphQL subscription)
  // {
  //   startedDateTime: '2021-01-01T00:00:00.000Z',
  //   time: 1099.4580000406131,
  //   request: {
  //     url: 'ws://graphql-network-monitor.com/graphql',
  //     method: 'GET',
  //     headers: [
  //       {
  //         name: 'Authorization',
  //         value: 'Bearer fe0e8768-3b2f-4f63-983d-1a74c26dde1e',
  //       },
  //     ],
  //   },
  //   response: {
  //     status: 101,
  //     headers: [
  //       {
  //         name: 'Authorization',
  //         value: 'Bearer fe0e8768-3b2f-4f63-983d-1a74c26dde1e',
  //       },
  //     ],
  //   },
  //   _resourceType: 'websocket',
  //   _webSocketMessages: [
  //     {
  //       data: JSON.stringify({
  //         payload: {
  //           query: 'subscription { reviewAdded { stars episode } }',
  //           variables: {},
  //         },
  //       }),
  //       opcode: 1,
  //       time: 1699975911.862162,
  //       type: 'send',
  //     },
  //     {
  //       data: JSON.stringify({
  //         payload: {
  //           data: { reviewAdded: { stars: 4, episode: 'CLONE_WARS' } },
  //         },
  //       }),
  //       opcode: 1,
  //       time: 1699975911.862162,
  //       type: 'receive',
  //     },
  //     {
  //       data: JSON.stringify({
  //         payload: {
  //           data: { reviewAdded: { stars: 4, episode: 'NEWHOPE' } },
  //         },
  //       }),
  //       opcode: 1,
  //       time: 1699975982.2748342,
  //       type: 'receive',
  //     },
  //   ],
  // },
]
