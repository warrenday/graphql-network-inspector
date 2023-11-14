import React from "react"
import { CodeView } from "../../../components/CodeView"
import { CopyButton } from "../../../components/CopyButton"
import { IWebSocketMessage } from "../../../hooks/useWebSocketNetworkMonitor"
import { PanelSection, Panels } from "../PanelSection"

interface IMessageViewProps {
  messages: IWebSocketMessage[]
}

/**
 * Returns a string representing the time elapsed since the given time
 *
 * @param time time in milliseconds
 * @returns
 */
const getTimeElapsed = (time: number): string => {
  const now = Date.now()
  const elapsed = now - time * 1000
  const seconds = Math.floor(elapsed / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours} hours ago`
  } else if (minutes > 0) {
    return `${minutes} minutes ago`
  } else if (seconds > 0) {
    return `${seconds} seconds ago`
  } else {
    return `just now`
  }
}

const MessageView = React.memo((props: IMessageViewProps) => {
  const { messages } = props

  return (
    <Panels>
      {messages.map((message, i) => {
        const payload = JSON.stringify(message.data, null, 2)

        return (
          <PanelSection key={i} className="relative p-4">
            <CopyButton
              textToCopy={payload}
              className="absolute right-3 top-3 z-10"
            />
            <div className="text-gray-500 dark:text-gray-400">
              {getTimeElapsed(message.time)}
            </div>
            <CodeView text={payload} language={"json"} className="p-4" />
          </PanelSection>
        )
      })}
    </Panels>
  )
})

export default MessageView
