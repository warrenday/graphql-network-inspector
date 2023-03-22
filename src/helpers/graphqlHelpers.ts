import { FieldNode, GraphQLError, OperationDefinitionNode } from "graphql"
import gql from "graphql-tag"

export type OperationType = "query" | "mutation" | "subscription" | "persisted"

export interface IGraphqlRequestBody {
  query: string
  variables?: object
  extensions?: object
}

export type OperationDetails = {
  operationName: string
  operation: OperationType
}

const decodeQueryParam = (param: string): string | null => {
  try {
    return decodeURIComponent(param.replace(/\+/g, " "))
  } catch (e) {
    return null
  }
}

const extractExtensionsFromQueryParam = (param: string): any => {
  try {
    const decodedParam = decodeQueryParam(param)
    if (!decodedParam) {
      return null
    }

    return JSON.parse(decodedParam)
  } catch (e) {
    return null
  }
}

const extractVariablesFromQueryParam = (param: string): any => {
  try {
    const decodedParam = decodeQueryParam(param)
    if (!decodedParam) {
      return null
    }

    return JSON.parse(decodedParam)
  } catch (e) {
    return null
  }
}

const isParsedGraphqlRequestValid = (
  requestPayloads: any[]
): requestPayloads is IGraphqlRequestBody[] => {
  const isValid = requestPayloads.every((payload) => {
    const isQueryValid =
      ("query" in payload && typeof payload.query === "string") ||
      payload.extensions?.persistedQuery
    const isVariablesValid =
      "variables" in payload ? typeof payload.variables === "object" : true
    return isQueryValid && isVariablesValid
  })

  return isValid
}

export const parseGraphqlQuery = (queryString: any) => {
  return gql`
    ${queryString}
  `
}

const parseGraphqlGetRequest = (
  details: chrome.devtools.network.Request
): IGraphqlRequestBody[] | null => {
  const queryParam = details.request.queryString.find(
    (qs) => qs.name === "query"
  )

  const variablesParam = details.request.queryString.find(
    (qs) => qs.name === "variables"
  )

  const extensionsParam = details.request.queryString.find(
    (qs) => qs.name === "extensions"
  )

  const query = queryParam && decodeQueryParam(queryParam.value)
  const variables =
    variablesParam && extractVariablesFromQueryParam(variablesParam.value)

  if (!!query) {
    return [
      {
        query,
        variables,
      },
    ]
  }

  const extensions =
    extensionsParam && extractExtensionsFromQueryParam(extensionsParam.value)
  const isPersistedQuery = !!extensions?.persistedQuery

  if (isPersistedQuery) {
    return [
      {
        query: "",
        extensions,
        variables,
      },
    ]
  }

  return null
}

const parseGraphqlPostRequest = (
  details: chrome.devtools.network.Request
): IGraphqlRequestBody[] | null => {
  const requestBody = details.request.postData?.text

  if (!requestBody) {
    return null
  }

  try {
    const requestPayload = JSON.parse(requestBody)
    const requestPayloads = Array.isArray(requestPayload)
      ? requestPayload
      : [requestPayload]
    if (!isParsedGraphqlRequestValid(requestPayloads)) {
      throw new Error("Parsed requestBody is invalid")
    } else {
      return requestPayloads
    }
  } catch (err) {
    console.error("Unable to parse graphql request body", err)
    return null
  }
}

export const parseGraphqlRequest = (
  details: chrome.devtools.network.Request
): IGraphqlRequestBody[] | null => {
  switch (details.request.method) {
    case "GET":
      return parseGraphqlGetRequest(details)
    case "POST":
      return parseGraphqlPostRequest(details)
    default:
      return null
  }
}

export const getPrimaryOperationForGetRequest = (
  details: chrome.devtools.network.Request
): OperationDetails | null => {
  const operationNameParam = details.request.queryString.find(
    (qs) => qs.name === "operationName"
  )

  const operationName = operationNameParam?.value

  if (!operationName) {
    return null
  }

  const queryParam = details.request.queryString.find(
    (qs) => qs.name === "query"
  )

  const query = queryParam && decodeQueryParam(queryParam.value)

  if (!!query) {
    return {
      operationName: operationNameParam.value,
      operation: "query",
    }
  }

  const extensionsParam = details.request.queryString.find(
    (qs) => qs.name === "extensions"
  )

  const extensions =
    extensionsParam && extractExtensionsFromQueryParam(extensionsParam.value)
  const isPersistedQuery = !!extensions?.persistedQuery

  if (isPersistedQuery) {
    return {
      operationName: operationNameParam.value,
      operation: "persisted",
    }
  }

  return null
}

export const getPrimaryOperationForPostRequest = (
  details: chrome.devtools.network.Request
): OperationDetails | null => {
  const requestBody = details.request.postData?.text

  if (!requestBody) {
    return null
  }

  try {
    const request = JSON.parse(requestBody)
    const postData = Array.isArray(request) ? request : [request]
    let operationName
    let operation: OperationType

    if (postData[0].query) {
      const documentNode = parseGraphqlQuery(postData[0].query)
      const firstOperationDefinition = documentNode.definitions.find(
        (def) => def.kind === "OperationDefinition"
      ) as OperationDefinitionNode
      const field = firstOperationDefinition.selectionSet.selections.find(
        (selection) => selection.kind === "Field"
      ) as FieldNode
      operationName = firstOperationDefinition.name?.value || field?.name.value

      if (!operationName) {
        throw new Error("Operation name could not be determined")
      }

      operation = firstOperationDefinition?.operation

      return {
        operationName,
        operation,
      }
    }

    operationName = postData[0].operationName

    if (!operationName) {
      throw new Error("Operation name could not be determined")
    }

    // Can be either query or mutation here, we don't know
    operation = "persisted"

    return {
      operationName,
      operation,
    }
  } catch (e) {
    return null
  }
}

export const getPrimaryOperation = (
  details: chrome.devtools.network.Request
): OperationDetails | null => {
  switch (details.request.method) {
    case "GET":
      return getPrimaryOperationForGetRequest(details)
    case "POST":
      return getPrimaryOperationForPostRequest(details)
    default:
      return null
  }
}

export const getErrorMessages = (
  responseBody: string | undefined
): string[] | null => {
  if (!responseBody) {
    return null
  }
  try {
    const bodyParsed = JSON.parse(responseBody)
    if ("errors" in bodyParsed) {
      return bodyParsed.errors.map((error: GraphQLError) => error.message || "")
    }
    return []
  } catch (error) {
    return null
  }
}
