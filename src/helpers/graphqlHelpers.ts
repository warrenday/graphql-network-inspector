import { FieldNode, GraphQLError, OperationDefinitionNode } from "graphql"
import gql from "graphql-tag"

export type OperationType = "query" | "mutation" | "subscription" | "persisted"

export interface IGraphqlRequestBody {
  id: string
  query: string
  variables?: Record<string, unknown>
  extensions?: Record<string, unknown>
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
): Omit<IGraphqlRequestBody, "id">[] | null => {
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
  try {
    const requestPayload = extractGraphQLPayloadFromRequest(details)
    if (!requestPayload) {
      return null
    }

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
): Omit<IGraphqlRequestBody, "id">[] | null => {
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

/**
 * Parse a multipart/form-data request payload
 * and return a map of the form data.
 *
 * Here is an example form data payload:
 *
 * ```text
 * -----------------------------7da24f2e50046
 * Content-Disposition: form-data; name="operations"
 *
 * {"query":"mutation($file: Upload!) { uploadFile(file: $file) { id } }","variables":{"file":null}}
 * -----------------------------7da24f2e50046
 * Content-Disposition: form-data; name="map"
 *
 * {"0":["variables.file"]}
 * -----------------------------7da24f2e50046
 * ```
 *
 * @param boundary boundary value of the multipart/form-data content-type header
 * @param formDataString the form data request payload
 * @returns
 */
export const parseMultipartFormData = (
  boundary: string,
  formDataString: string
) => {
  // Split on the form boundary
  const parts = formDataString.split(boundary)
  const result: Record<string, string> = {}

  // Process each part
  for (let part of parts) {
    // Trim and remove trailing dashes
    const trimmedPart = part.trim().replace(/-+$/, "")

    // Ignore empty parts
    if (trimmedPart === "" || trimmedPart === "--") {
      continue
    }

    // Extract the header and body
    const [header, ...bodyParts] = trimmedPart.split("\n")
    const body = bodyParts.join("\n").trim()

    // Extract the name from the header
    const nameMatch = header.match(/name="([^"]*)"/)
    if (!nameMatch) {
      continue
    }

    const name = nameMatch[1]
    try {
      result[name] = JSON.parse(body.replace(/\n/g, ""))
    } catch (e) {}
  }

  return result
}

/**
 * Extract the GraphQL request from the request payload.
 *
 * This is usually just a stringified JSON object, but in the case
 * of multipart/form-data or application/x-www-form-urlencoded, this
 * will need to be parsed differently.
 *
 * Either way we will end up with an object that contains the GraphQL
 * operationName, query, and variables.
 *
 */
const extractGraphQLPayloadFromRequest = (
  details: chrome.devtools.network.Request
) => {
  const requestBody = details.request.postData?.text
  if (!requestBody) {
    return null
  }

  try {
    // First just assume it's a JSON object
    return JSON.parse(requestBody)
  } catch (e) {
    // Otherwise, check the content-type header to figure out how we proceed
    const contentTypeHeader = details.request.headers.find((header) => {
      return header.name.toLowerCase() === "content-type"
    })
    if (!contentTypeHeader) {
      return
    }

    const isFormData = contentTypeHeader.value.includes("multipart/form-data")
    const boundary = contentTypeHeader.value.split("boundary=")[1]
    if (isFormData && boundary) {
      const formData = parseMultipartFormData(boundary, requestBody)
      return formData.operations
    }
  }
}

export const getPrimaryOperationForPostRequest = (
  details: chrome.devtools.network.Request
): OperationDetails | null => {
  try {
    const request = extractGraphQLPayloadFromRequest(details)
    if (!request) {
      return null
    }

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
