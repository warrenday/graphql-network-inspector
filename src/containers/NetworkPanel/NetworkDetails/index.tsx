import { Tabs } from "@/components/Tabs"
import { NetworkRequest } from "@/hooks/useNetworkMonitor"
import { HeaderView } from "./HeaderView"
import { RequestView, RequestViewFooter } from "./RequestView"
import { ResponseView } from "./ResponseView"
import { TracingView } from "./TracingView"
import { ResponseRawView } from "./ResponseRawView"
import { useNetworkTabs } from "@/hooks/useNetworkTabs"
import { CloseButton } from "@/components/CloseButton"
import { useApolloTracing } from "@/hooks/useApolloTracing"
import { useToggle } from "@/hooks/useToggle"

export type NetworkDetailsProps = {
  data: NetworkRequest
  onClose: () => void
}

export const NetworkDetails = (props: NetworkDetailsProps) => {
  const { data, onClose } = props
  const { activeTab, setActiveTab } = useNetworkTabs()
  const requestHeaders = data.request.headers
  const responseHeaders = data.response?.headers || []
  const requestBody = data.request.body
  const responseBody = data.response?.body
  const responseCollapsedCount = requestBody.length > 1 ? 3 : 2
  const tracing = useApolloTracing(responseBody)
  const [autoFormat, toggleAutoFormat] = useToggle()

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
          component: (
            <RequestView requests={requestBody} autoFormat={autoFormat} />
          ),
          bottomComponent: (
            <RequestViewFooter
              autoFormat={autoFormat}
              toggleAutoFormat={toggleAutoFormat}
            />
          ),
        },
        {
          id: "response",
          title: "Response",
          component: (
            <ResponseView
              response={responseBody}
              collapsed={responseCollapsedCount}
            />
          ),
        },
        {
          id: "response-raw",
          title: "Response (Raw)",
          component: <ResponseRawView response={responseBody} />,
        },
        ...(tracing
          ? [
              {
                id: "tracing",
                title: "Tracing",
                component: <TracingView response={responseBody} />,
              },
            ]
          : []),
      ]}
    />
  )
}
