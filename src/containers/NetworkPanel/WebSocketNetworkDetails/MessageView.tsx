import { CodeView } from "../../../components/CodeView"
import { WebSocketMessage } from "../../../hooks/useWebSocketNetworkMonitor"
import { PanelSection, Panels } from "../PanelSection"

interface MessageViewProps {
  messages: WebSocketMessage[]
}

const MessageView = (props: MessageViewProps) => {
  const { messages } = props

  return (
    <Panels>
      {messages.map((message) => {
        return (
          <PanelSection className="relative p-4">
            <CodeView text={message.data} language={"json"} className="p-4" />
          </PanelSection>
        )
      })}
    </Panels>
  )
}

export default MessageView
