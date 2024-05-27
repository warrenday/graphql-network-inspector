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
        id: '1',
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
        id: '1',
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
        id: '1',
        query: 'query Me { field }',
        operationName: 'MyQuery',
      },
    ])
    expect(operation).toEqual({
      operationName: 'MyQuery',
      operation: 'query',
    })
  })
})
