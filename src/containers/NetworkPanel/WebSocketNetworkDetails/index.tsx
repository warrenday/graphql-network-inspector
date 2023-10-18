import { CloseButton } from "../../../components/CloseButton"
import { Tabs } from "../../../components/Tabs"
import { useNetworkTabs } from "../../../hooks/useNetworkTabs"
import { WebSocketNetworkRequest } from "../../../hooks/useWebSocketNetworkMonitor"
import { HeaderView } from "../HeaderView"
import MessageView from "./MessageView"

interface WebSocketNetworkDetailsProps {
  data: WebSocketNetworkRequest
  onClose: () => void
}

const WebSocketNetworkDetails = (props: WebSocketNetworkDetailsProps) => {
  const { data, onClose } = props
  const { activeTab, setActiveTab } = useNetworkTabs()
  const requestHeaders = data.request.headers
  const responseHeaders = data.response?.headers || []

  return (
    <Tabs
      testId="websocket-network-tabs"
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
          id: "messages",
          title: "Messages",
          component: <MessageView messages={data.messages} />,
        },
      ]}
    />
  )
}

export default WebSocketNetworkDetails
