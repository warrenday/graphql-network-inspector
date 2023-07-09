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
import { useShareMessage } from "../../../hooks/useShareMessage"
import { useMemo } from "react"

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
  const { shareNetworkRequest } = useShareMessage()
  const operation = data.request.primaryOperation.operation
  const isShareable = useMemo(
    () => ["query", "mutation"].includes(operation),
    [operation]
  )

  const handleShare = () => {
    shareNetworkRequest(data)
  }

  return (
    <Tabs
      testId="network-tabs"
      activeTab={activeTab}
      onTabClick={setActiveTab}
      leftContent={
        <div className="flex mr-1 h-full">
          <CloseButton onClick={onClose} testId="close-side-panel" />
        </div>
      }
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
            <RequestView
              onShare={isShareable ? handleShare : undefined}
              requests={requestBody}
              autoFormat={autoFormat}
            />
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
              onShare={isShareable ? handleShare : undefined}
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
