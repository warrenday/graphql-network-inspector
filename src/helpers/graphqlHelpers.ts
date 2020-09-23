import gql from "graphql-tag";

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

export const getIsGraphqlRequest = (requestBody?: string) => {
  try {
    const request = JSON.parse(requestBody || "");
    const postData = Array.isArray(request) ? request : [request];
    return parseGraphqlQuery(postData[0].query);
  } catch (e) {
    return false;
  }
};
