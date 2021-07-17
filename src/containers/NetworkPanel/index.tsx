import React from "react";
import { Tabs } from "../../components/Tabs";
import { CloseIcon } from "../../components/Icons/CloseIcon";
import { NetworkRequest } from "../../hooks/useNetworkMonitor";
import { HeaderView } from "./HeaderView";
import { RequestView } from "./RequestView";
import { ResponseView } from "./ResponseView";
import { ResponseRawView } from "./ResponseRawView";

export type NetworkPanelProps = {
  data: NetworkRequest;
  onClose: () => void;
};

export const NetworkPanel = (props: NetworkPanelProps) => {
  const { data, onClose } = props;
  const requestHeaders = data.request.headers;
  const responseHeaders = data.response?.headers || [];
  const requestBody = data.request.body;
  const responseBody = data.response?.body;

  return (
    <Tabs
      testId="network-tabs"
      defaultActiveTab={1}
      leftContent={
        <button
          onClick={onClose}
          className="w-10 flex justify-center items-center opacity-50 hover:opacity-100"
          data-testid="close-side-panel"
        >
          <CloseIcon width="1.5rem" height="1.5rem" />
        </button>
      }
      tabs={[
        {
          title: "Headers",
          component: (
            <HeaderView
              requestHeaders={requestHeaders}
              responseHeaders={responseHeaders}
            />
          ),
        },
        {
          title: "Request",
          component: <RequestView requests={requestBody} />,
        },
        {
          title: "Response",
          component: <ResponseView response={responseBody} />,
        },
        {
          title: "Response (Raw)",
          component: <ResponseRawView response={responseBody} />,
        },
      ]}
    />
  );
};
