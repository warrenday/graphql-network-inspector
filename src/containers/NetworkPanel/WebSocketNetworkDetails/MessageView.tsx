import { CodeView } from "../../../components/CodeView"
import { CopyButton } from "../../../components/CopyButton"
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
        const payload = JSON.stringify(message.data, null, 2)

        return (
          <PanelSection className="relative p-4">
            <CopyButton
              textToCopy={payload}
              className="absolute right-3 top-3 z-10"
            />
            <CodeView text={payload} language={"json"} className="p-4" />
          </PanelSection>
        )
      })}
    </Panels>
  )
}

export default MessageView
