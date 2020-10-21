import mergeby from "mergeby";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import {
  getPrimaryOperation,
  parseGraphqlRequest,
  OperationDetails,
} from "../helpers/graphqlHelpers";
import { onRequestFinished } from "../services/networkMonitor";

export type Header = { name: string; value?: string };
export type NetworkRequest = {
  id: string;
  status: number;
  url: string;
  request: {
    primaryOperation: OperationDetails;
    headers: Header[];
    body: {
      query: string;
      variables: object;
    }[];
  };
  response?: {
    headers?: Header[];
    body?: string;
  };
};

export const useNetworkMonitor = (): [NetworkRequest[], () => void] => {
  const [webRequests, setWebRequests] = useState<NetworkRequest[]>([]);

  useEffect(() => {
    const updateRequest = (newWebRequest: Partial<NetworkRequest>) => {
      setWebRequests((webRequests) => {
        const newRequests = mergeby(webRequests, newWebRequest, "id", true);
        return newRequests as NetworkRequest[];
      });
    };

    const handleRequestFinished = (
      details: chrome.devtools.network.Request
    ) => {
      const primaryOperation = getPrimaryOperation(
        details.request.postData?.text
      );
      if (!primaryOperation) {
        return;
      }

      const requestId = uuid();
      const requestBody = parseGraphqlRequest(details.request.postData?.text);

      if (!requestBody) {
        return;
      }

      updateRequest({
        id: requestId,
        status: details.response.status,
        url: details.request.url,
        request: {
          primaryOperation,
          headers: details.request.headers,
          body: requestBody,
        },
        response: {
          headers: details.response.headers,
        },
      });

      details.getContent((responseBody) => {
        updateRequest({
          id: requestId,
          response: {
            body: responseBody || "",
          },
        });
      });
    };

    const removeListeners = [onRequestFinished(handleRequestFinished)];
    return () => {
      removeListeners.forEach((remove) => remove());
    };
  }, []);

  const clearWebRequests = () => {
    setWebRequests([]);
  };

  return [webRequests, clearWebRequests];
};
