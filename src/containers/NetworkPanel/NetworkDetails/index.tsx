import { Tabs } from "../../../components/Tabs";
import { NetworkRequest } from "../../../hooks/useNetworkMonitor";
import { HeaderView } from "./HeaderView";
import { RequestView } from "./RequestView";
import { ResponseView } from "./ResponseView";
import { ResponseRawView } from "./ResponseRawView";
import { useNetworkTabs } from "../../../hooks/useNetworkTabs";
import { CloseButton } from "../../../components/CloseButton";
import { TracingView } from "./TracingView";

export type NetworkDetailsProps = {
  data: NetworkRequest;
  onClose: () => void;
};

export const NetworkDetails = (props: NetworkDetailsProps) => {
  const { data, onClose } = props;
  const { activeTab, setActiveTab } = useNetworkTabs();
  const requestHeaders = data.request.headers;
  const responseHeaders = data.response?.headers || [];
  const requestBody = data.request.body;
  const responseBody = data.response?.body;

  return (
    <Tabs
      testId="network-tabs"
      activeTab={activeTab}
      onTabClick={setActiveTab}
      rightContent={<CloseButton onClick={onClose} testId="close-side-panel" />}
      tabs={[
        {
          id: "headers",
          title: "Headers",
          component: (
            <HeaderView
              requestHeaders={requestHeaders}
              responseHeaders={responseHeaders}
            />
          ),
        },
        {
          id: "request",
          title: "Request",
          component: <RequestView requests={requestBody} />,
        },
        {
          id: "response",
          title: "Response",
          component: <ResponseView response={responseBody} />,
        },
        {
          id: "response-raw",
          title: "Response (Raw)",
          component: <ResponseRawView response={responseBody} />,
        },
        {
          id: "tracing",
          title: "Tracing",
          component: <TracingView response={responseBody} />,
        },
      ]}
    />
  );
};
