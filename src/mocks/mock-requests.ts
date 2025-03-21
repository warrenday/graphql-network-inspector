const url = 'http://graphql-network-monitor.com/graphql'

interface IMockRequestInput {
  request: {
    query?: string
    operationName?: string
    variables?: Record<string, unknown>
    extensions?: Record<string, unknown>
  }[]
  response: Record<string, unknown>
  headers?: chrome.webRequest.HttpHeader[]
}

interface IMockWebsocketRequestInput {
  url: string
  webSocketMessages: ISubscriptionPayload[]
}

export interface IMockRequest {
  webRequestBodyDetails: chrome.webRequest.WebRequestBodyDetails
  webRequestHeaderDetails: chrome.webRequest.WebRequestHeadersDetails
  networkRequest: (
    | chrome.devtools.network.Request
    | chrome.devtools.network.HAREntry
  ) & {
    native?: {
      webRequest: chrome.webRequest.WebRequestBodyDetails
      networkRequest: chrome.devtools.network.Request
    }
  }
}

interface ISubscriptionPayload {
  data: string
  opcode: number
  time: number
  type: 'send' | 'receive'
}

interface IDefaultSubscriptionInput {
  data: Record<string, unknown>
  opcode: number
  time: number
  type: 'send' | 'receive'
}

interface IRailsChannelSubscriptionInput {
  query: string
  variables: Record<string, unknown>
  operationName: string
  opcode: number
  time: number
  type: 'send' | 'receive'
}

const defaultSubscriptionPayload = ({
  data,
  opcode,
  time,
  type,
}: IDefaultSubscriptionInput): ISubscriptionPayload => {
  return {
    data: JSON.stringify(data),
    opcode,
    time,
    type,
  }
}

const railsChannelSubscriptionPayload = ({
  query,
  variables,
  operationName,
  opcode,
  time,
  type,
}: IRailsChannelSubscriptionInput): ISubscriptionPayload => {
  const payload = {
    command: 'message',
    identifier: '{"channel":"GraphqlChannel","channelId":"1932245fcc6"}',
    data: JSON.stringify({
      query,
      variables,
      operationName,
      action: 'execute',
    }),
  }

  return defaultSubscriptionPayload({ data: payload, opcode, time, type })
}

const createWebsocketRequest = (
  args: IMockWebsocketRequestInput
): IMockRequest => {
  const requestHeaders = [
    {
      name: 'Authorization',
      value: 'Bearer fe0e8768-3b2f-4f63-983d-1a74c26dde1e',
    },
  ]

  const webRequestBodyDetails: chrome.webRequest.WebRequestBodyDetails = {
    frameId: 0,
    parentFrameId: -1,
    tabId: 1,
    type: 'xmlhttprequest',
    timeStamp: 1699975911.862162,
    requestId: '1',
    url: args.url,
    method: 'GET',
    requestBody: null,
  }

  const webRequestHeaderDetails: chrome.webRequest.WebRequestHeadersDetails = {
    documentId: '1',
    documentLifecycle: 'active',
    frameId: 0,
    frameType: 'sub_frame',
    method: 'GET',
    parentFrameId: -1,
    requestId: '1',
    tabId: 1,
    timeStamp: 1699975911.862162,
    type: 'xmlhttprequest',
    url: args.url,
    requestHeaders,
  }

  const networkRequest: chrome.devtools.network.HAREntry = {
    cache: {},
    startedDateTime: '2021-01-01T00:00:00.000Z',
    time: 1099.4580000406131,
    timings: {
      receive: 0.1,
      wait: 0.1,
    },
    request: {
      url: args.url,
      httpVersion: 'HTTP/1.1',
      queryString: [],
      cookies: [],
      bodySize: 0,
      method: 'GET',
      headersSize: 100,
      headers: requestHeaders as Array<{ name: string; value: string }>,
    },
    response: {
      status: 101,
      statusText: 'Switching Protocols',
      httpVersion: 'HTTP/1.1',
      cookies: [],
      content: {
        size: 100,
        mimeType: 'application/json',
      },
      redirectURL: '',
      headersSize: 100,
      bodySize: 3360,
      headers: [],
    },
    _resourceType: 'websocket',
    _webSocketMessages: args.webSocketMessages,
  }

  return {
    webRequestBodyDetails,
    webRequestHeaderDetails,
    networkRequest,
  }
}

const createRequest = (args: IMockRequestInput): IMockRequest => {
  const { request, response, headers } = args

  const requestHeaders = [
    {
      name: 'Authorization',
      value:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    },
    {
      name: 'access-control-allow-credentials',
      value: 'true',
    },
    {
      name: 'access-control-allow-origin',
      value: 'https://www.google.com',
    },
    {
      name: 'set-cookie:',
      value:
        'SIDCC=fe0e8768-3b2f-4f63-983d-1a74c26dde1efe0e8768-3b2f-4f63-983d-1a74c26dde1e; expires=Thu, 14-Apr-2022 08:09:50 GMT; path=/; domain=.google.com; priority=high',
    },
    { name: 'x-request-id', value: 'f94bd6d9-8d7a-4d53-a9b5-a3dc0d7e8a2b' },
    { name: 'x-api-key', value: 'pk_test_123456' },
    { name: 'x-correlation-id', value: '2023-11-15T12:34:56.789Z' },
    { name: 'x-client-version', value: '1.2.3' },
    ...(headers || []),
  ]

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
    requestHeaders,
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
      headers: requestHeaders as Array<{ name: string; value: string }>,
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
      bodySize: 3360,
      headers: [],
    },
    getContent: (cb: Function) => {
      cb(JSON.stringify(response))
    },
  }

  return {
    webRequestBodyDetails,
    webRequestHeaderDetails,
    networkRequest: {
      ...networkRequest,
      native: {
        webRequest: webRequestBodyDetails,
        networkRequest: networkRequest,
      },
    },
  }
}

export const mockRequests: IMockRequest[] = [
  createRequest({
    request: [
      {
        query: `
          fragment MovieDetails on Movie {
            id
            title
            genre
          }

          query getMovieQuery($title: String) {
            getMovie(title: $title) {
              ...MovieDetails
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
              score
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
            score: 8.5,
          },
          {
            id: '2',
            title: 'American Psycho',
            genre: 'Thriller',
            score: 7.5,
          },
          {
            id: '3',
            title: 'The Godfather',
            genre: 'Drama',
            score: 0.0000007,
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
  createRequest({
    request: [
      {
        query: `
          subscription reviewAddedForPostSubscription($id: String) {
            reviewAddedForPost(postId: $id) {
              stars
              episode
            }
          }
        `,
        variables: {
          id: '3',
        },
      },
    ],
    response: {
      data: {
        subscriptionId: '123',
      },
    },
  }),
  createWebsocketRequest({
    url: 'ws://graphql-network-monitor.com/graphql',
    webSocketMessages: [
      defaultSubscriptionPayload({
        data: {
          payload: {
            query: 'subscription { reviewAdded { stars episode } }',
            variables: {},
          },
          metadata: {},
        },
        opcode: 1,
        time: 1699975911.862162,
        type: 'send',
      }),
      defaultSubscriptionPayload({
        data: {
          payload: {
            data: { reviewAdded: { stars: 4, episode: 'CLONE_WARS' } },
          },
          metadata: {},
        },
        opcode: 1,
        time: 1699975911.862162,
        type: 'receive',
      }),
      defaultSubscriptionPayload({
        data: {
          payload: {
            data: { reviewAdded: { stars: 4, episode: 'NEWHOPE' } },
          },
          metadata: {},
        },
        opcode: 1,
        time: 1699975982.2748342,
        type: 'receive',
      }),
    ],
  }),
  createWebsocketRequest({
    url: 'ws://some-network-monitor.com/alternative',
    webSocketMessages: [
      defaultSubscriptionPayload({
        data: {
          payload: {
            query: 'subscription { reviewAdded { stars episode } }',
            variables: {},
          },
          metadata: {},
        },
        opcode: 1,
        time: 1699975911.862162,
        type: 'send',
      }),
      defaultSubscriptionPayload({
        data: {
          payload: {
            data: { reviewAdded: { stars: 4, episode: 'CLONE_WARS' } },
          },
          metadata: {},
        },
        opcode: 1,
        time: 1699975911.862162,
        type: 'receive',
      }),
      defaultSubscriptionPayload({
        data: {
          payload: {
            data: { reviewAdded: { stars: 4, episode: 'NEWHOPE' } },
          },
          metadata: {},
        },
        opcode: 1,
        time: 1699975982.2748342,
        type: 'receive',
      }),
    ],
  }),
  createWebsocketRequest({
    url: 'ws://some-network-monitor.com/rails-cable',
    webSocketMessages: [
      railsChannelSubscriptionPayload({
        query: 'subscription { reviewAdded { stars episode } }',
        variables: {},
        operationName: 'ReviewAdded',
        opcode: 1,
        time: 1699975911.862162,
        type: 'send',
      }),
      defaultSubscriptionPayload({
        data: {
          identifier: '{"channel":"GraphqlChannel","channelId":"1932245fcc6"}',
          message: {
            reviewAdded: { stars: 4, episode: 'CLONE_WARS' },
          },
        },
        opcode: 1,
        time: 1699975911.862162,
        type: 'receive',
      }),
    ],
  }),
  createRequest({
    request: [
      {
        query: `
        query ComplexMovieQuery($id: ID!, $includeReviews: Boolean!) {
          movie(id: $id) {
            id
            title
            releaseDate
            rating
            reviews @include(if: $includeReviews) {
              id
              text
              score
              author {
                name
                email
              }
            }
          }
        }
      `,
        variables: {
          id: 'tt0468569',
          includeReviews: true,
        },
        operationName: 'ComplexMovieQuery',
      },
    ],
    response: {
      data: {
        movie: {
          id: 'tt0468569',
          title: 'The Dark Knight',
          releaseDate: '2008-07-18',
          rating: 9.0,
          reviews: [
            {
              id: '1',
              text: 'A masterpiece of modern cinema',
              score: 10,
              author: {
                name: 'Film Critic',
                email: 'critic@movies.com',
              },
            },
          ],
        },
      },
    },
    headers: [
      { name: 'content-type', value: 'application/json; charset=utf-8' },
      {
        name: 'authorization',
        value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
      { name: 'x-request-id', value: 'f94bd6d9-8d7a-4d53-a9b5-a3dc0d7e8a2b' },
      { name: 'x-api-key', value: 'pk_test_123456' },
      {
        name: 'user-agent',
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
      { name: 'accept', value: 'application/json' },
      { name: 'origin', value: 'https://movies.example.com' },
      { name: 'referer', value: 'https://movies.example.com/movie/tt0468569' },
      { name: 'x-correlation-id', value: '2023-11-15T12:34:56.789Z' },
      { name: 'x-client-version', value: '1.2.3' },
    ],
  }),
]
