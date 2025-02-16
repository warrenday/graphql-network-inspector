import { getErrorMessages, getFirstGraphqlOperation } from './graphqlHelpers'

describe('graphqlHelpers.getErrorMessages', () => {
  it('returns null for invalid JSON', () => {
    const errorMessages = getErrorMessages("{'invalid JSON'}")
    expect(errorMessages).toEqual(null)
  })

  it('returns null when no body', () => {
    const errorMessages = getErrorMessages(undefined)
    expect(errorMessages).toEqual(null)
  })

  it('returns empty array when no errors', () => {
    const errorMessages = getErrorMessages(
      JSON.stringify({
        data: [],
      })
    )
    expect(errorMessages).toEqual([])
  })

  it('parses multiple error messages correctly', () => {
    const errorMessages = getErrorMessages(
      JSON.stringify({
        errors: [{ message: 'First Error' }, { message: 'Second Error' }],
      })
    )
    expect(errorMessages).toEqual(['First Error', 'Second Error'])
  })
})

describe('graphqlHelpers.getFirstGraphqlOperation', () => {
  it('returns the operation name and type from unnamed query', () => {
    const operation = getFirstGraphqlOperation([
      {
        query: 'query { field }',
      },
    ])
    expect(operation).toEqual({
      operationName: 'field',
      operation: 'query',
    })
  })

  it('returns the operation name and type from the query', () => {
    const operation = getFirstGraphqlOperation([
      {
        query: 'query MyQuery { field }',
      },
    ])
    expect(operation).toEqual({
      operationName: 'MyQuery',
      operation: 'query',
    })
  })

  it('returns the operation name and type when operatioName is explicity provided', () => {
    const operation = getFirstGraphqlOperation([
      {
        query: 'query Me { field }',
        operationName: 'MyQuery',
      },
    ])
    expect(operation).toEqual({
      operationName: 'MyQuery',
      operation: 'query',
    })
  })

  it('returns the operation name for persisted queries', () => {
    const operation = getFirstGraphqlOperation([
      {
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash: 'hash',
          },
        },
        operationName: 'MyQuery',
      },
    ])
    expect(operation).toEqual({
      operationName: 'MyQuery',
      operation: 'persisted',
    })
  })

  it('returns undefined if the query is invalid', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    const operation = getFirstGraphqlOperation([
      {
        query: 'invalid query',
      },
    ])
    expect(operation).toEqual(undefined)

    consoleSpy.mockRestore()
  })

  it('should handle invalid query', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const result = getFirstGraphqlOperation([{ query: 'invalid query' }])
    expect(result).toBeUndefined()
    consoleSpy.mockRestore()
  })
})
