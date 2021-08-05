import mergeby from "mergeby";
import { useCallback, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import {
  getPrimaryOperation,
  parseGraphqlRequest,
  OperationDetails,
} from "../helpers/graphqlHelpers";
import { onRequestFinished, getHAR } from "../services/networkMonitor";
import { DeepPartial } from "../types";

export type Header = { name: string; value?: string };
export type NetworkRequest = {
  id: string;
  status: number;
  url: string;
  time: number;
  request: {
    primaryOperation: OperationDetails;
    headers: Header[];
    body: {
      query: string;
      variables: object;
    }[];
    headersSize: number;
    bodySize: number;
  };
  response?: {
    headers?: Header[];
    body?: string;
    headersSize: number;
    bodySize: number;
  };
};

export const useNetworkMonitor = (): [NetworkRequest[], () => void] => {
  const [webRequests, setWebRequests] = useState<NetworkRequest[]>([]);

  const upsertRequest = useCallback(
    (newWebRequest: DeepPartial<NetworkRequest>) => {
      setWebRequests((webRequests) => {
        const newRequests = mergeby(webRequests, newWebRequest, "id", true);
        return newRequests as NetworkRequest[];
      });
    },
    []
  );

  const handleRequestFinished = useCallback(
    (details: chrome.devtools.network.Request) => {
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

      upsertRequest({
        id: requestId,
        status: details.response.status,
        url: details.request.url,
        time: details.time,
        request: {
          primaryOperation,
          headers: details.request.headers,
          body: requestBody,
          headersSize: details.request.headersSize,
          bodySize: details.request.bodySize,
        },
        response: {
          headers: details.response.headers,
          headersSize: details.response.headersSize,
          bodySize: details.response.bodySize,
        },
      });

      details.getContent((responseBody) => {
        upsertRequest({
          id: requestId,
          response: {
            body: responseBody || "",
          },
        });
      });
    },
    [upsertRequest]
  );

  const clearWebRequests = () => {
    setWebRequests([]);
  };

  useEffect(() => {
    const fetchHistoricWebRequests = async () => {
      const HARLog = await getHAR();
      for (const entry of HARLog.entries) {
        if ("getContent" in entry) {
          handleRequestFinished(entry as chrome.devtools.network.Request);
        }
      }
    };

    clearWebRequests();
    fetchHistoricWebRequests();
  }, [handleRequestFinished]);

  useEffect(() => {
    return onRequestFinished(handleRequestFinished);
  }, [handleRequestFinished]);

  return [webRequests, clearWebRequests];
};
