import gql from "graphql-tag";

export type OperationDetails = {
  operationName: string;
  operation: string;
};

export const parseGraphqlQuery = (queryString: any) => {
  return gql`
    ${queryString}
  `;
};

export const parseGraphqlRequest = (
  requestBody?: string
): { query: string; variables: object }[] => {
  const requestPayload = JSON.parse(requestBody || "");
  const requestPayloads = Array.isArray(requestPayload)
    ? requestPayload
    : [requestPayload];
  return requestPayloads;
};

export const getPrimaryOperation = (
  requestBody?: string
): OperationDetails | null => {
  try {
    const request = JSON.parse(requestBody || "");
    const postData = Array.isArray(request) ? request : [request];
    const documentNode = parseGraphqlQuery(postData[0].query) as any;
    const totalDefinitions = documentNode.definitions.length;
    const lastDefinition = documentNode.definitions[totalDefinitions - 1];
    const operationName =
      lastDefinition?.name?.value ||
      lastDefinition.selectionSet.selections[0].name.value;

    return {
      operationName,
      operation: lastDefinition?.operation,
    };
  } catch (e) {
    return null;
  }
};
