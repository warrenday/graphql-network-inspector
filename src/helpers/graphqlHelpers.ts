import { FieldNode, GraphQLError, OperationDefinitionNode } from 'graphql'
import gql from 'graphql-tag'

export type OperationType = 'query' | 'mutation' | 'subscription' | 'persisted'

export interface IGraphqlRequestBody {
  query?: string
  variables?: Record<string, unknown>
  operationName?: string
  extensions?: Record<string, unknown>
  id?: string
  native?: {
    webRequest: chrome.webRequest.WebRequestBodyDetails
  }
}

export interface IOperationDetails {
  operationName: string
  operation: OperationType
}

/**
 * Validate that the request payloads, including query, variables, and extensions,
 * constitute a valid GraphQL request.
 *
 * @param requestPayloads the request payloads to validate
 * @returns true if all the request payloads are valid
 */
const isParsedGraphqlRequestValid = (
  requestPayloads: any[]
): requestPayloads is IGraphqlRequestBody[] => {
  const isValid = requestPayloads.every((payload) => {
    const isQueryValid =
      ('query' in payload &&
        typeof payload.query === 'string' &&
        isGraphqlQuery(payload.query)) ||
      payload.extensions?.persistedQuery
    const isVariablesValid =
      'variables' in payload ? typeof payload.variables === 'object' : true

    return isQueryValid && isVariablesValid
  })

  return isValid
}

/**
 * Determine if a string is a valid GraphQL query.
 *
 * @param queryString the string to check
 * @returns true if the string is a valid GraphQL query
 */
export const isGraphqlQuery = (queryString: string) => {
  try {
    return !!parseGraphqlQuery(queryString)
  } catch (e) {
    return false
  }
}

/**
 * Parse a string into a GraphQL query.
 *
 * @param queryString the string to parse
 * @returns a GraphQL query
 */
export const parseGraphqlQuery = (queryString: any) => {
  return gql`
    ${queryString}
  `
}

/**
 * Parse the body of a GraphQL request into an array of
 * request payloads.
 *
 * We always return an array of request payloads, even if the
 * request body is not a batch request as it simplifies the
 * handling of the request in the rest of the application.
 *
 * @param body the body of a GraphQL request
 * @returns an array of request payloads
 */
export const parseGraphqlBody = (
  body: string
): IGraphqlRequestBody[] | undefined => {
  try {
    const requestPayload = JSON.parse(body)
    const requestPayloads = Array.isArray(requestPayload)
      ? requestPayload
      : [requestPayload]

    if (!isParsedGraphqlRequestValid(requestPayloads)) {
      throw new Error('Parsed requestBody is invalid')
    } else {
      return requestPayloads
    }
  } catch (error) {
    return undefined
  }
}

/**
 * Get the first operation from a GraphQL request
 * batch.
 *
 * @param graphqlBody array of GraphQL request payloads
 * @returns the first operation name and type
 */
export const getFirstGraphqlOperation = (
  graphqlBody: IGraphqlRequestBody[]
): IOperationDetails | undefined => {
  try {
    if (!graphqlBody.length) {
      return
    }

    if (graphqlBody[0].query) {
      const documentNode = parseGraphqlQuery(graphqlBody[0].query)
      const firstOperationDefinition = documentNode.definitions.find(
        (def) => def.kind === 'OperationDefinition'
      ) as OperationDefinitionNode
      const field = firstOperationDefinition.selectionSet.selections.find(
        (selection) => selection.kind === 'Field'
      ) as FieldNode

      const operationName =
        graphqlBody[0].operationName ||
        firstOperationDefinition.name?.value ||
        field?.name.value
      const operation = firstOperationDefinition?.operation

      if (!operationName) {
        throw new Error('Operation name could not be determined')
      }

      return {
        operationName,
        operation,
      }
    }

    if (graphqlBody[0].extensions?.persistedQuery) {
      return {
        operationName: graphqlBody[0].operationName || 'Persisted Query',
        operation: 'persisted',
      }
    }
  } catch (error) {
    console.error('Error getting first operation', error)
    return
  }
}

/**
 * Get the error messages from a GraphQL response body.
 *
 * @param responseBody the response body from a GraphQL request
 * @returns an array of error messages
 */
export const getErrorMessages = (
  responseBody: string | undefined
): string[] | null => {
  if (!responseBody) {
    return null
  }
  try {
    const bodyParsed = JSON.parse(responseBody)
    if ('errors' in bodyParsed) {
      return bodyParsed.errors.map((error: GraphQLError) => error.message || '')
    }
    return []
  } catch (error) {
    return null
  }
}
