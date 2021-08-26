import { stringify } from "../../helpers/safeJson";
import { Header, NetworkRequest } from "../../hooks/useNetworkMonitor";

const stringifyHeaders = (headers: Header[] = []) => {
  return headers
    .map((header) => {
      return `${header.name}: ${header.value}`;
    })
    .join(", ");
};

export const getHeaderSearchContent = (
  networkRequest: NetworkRequest
): string => {
  const requestHeaderText = stringifyHeaders(networkRequest.request.headers);
  const responseHeaderText = stringifyHeaders(networkRequest.response?.headers);
  return [requestHeaderText, responseHeaderText].join(", ");
};

export const getRequestSearchContent = (
  networkRequest: NetworkRequest
): string => {
  return networkRequest.request.body
    .map((body) => {
      return body.query + " " + body.variables;
    })
    .join(", ");
};

export const getResponseSearchContent = (
  networkRequest: NetworkRequest
): string => {
  return stringify(networkRequest.response?.body);
};
