import React from "react"
import { CodeView } from "../../../components/CodeView"
import { CopyButton } from "../../../components/CopyButton"
import { IWebSocketMessage } from "../../../hooks/useWebSocketNetworkMonitor"
import { PanelSection, Panels } from "../PanelSection"
import * as safeJson from "@/helpers/safeJson"

interface IMessageViewProps {
  messages: IWebSocketMessage[]
  showFullMessage: boolean
}

/**
 * Returns the time the message was sent in a human readable format
 *
 * @param time time in milliseconds
 * @returns
 */
const getReadableTime = (time: number): string => {
  const date = new Date(time * 1000)
  return date.toLocaleTimeString()
}

const MessageView = React.memo((props: IMessageViewProps) => {
  const { messages, showFullMessage } = props

  return (
    <Panels>
      {messages.map((message, i) => {
        const payload = JSON.stringify(showFullMessage ? message.data : message.data.payload, null, 2)
        const isGraphQLQuery = message.type === "send" && message.data?.query

        return (
          <PanelSection key={i} className="relative p-4">
            <CopyButton
              textToCopy={payload}
              className="absolute right-3 top-3 z-10"
            />
            <div className="text-gray-500 dark:text-gray-400">
              {getReadableTime(message.time)} | {message.type}
            </div>

            {isGraphQLQuery ? (
              <div className="flex flex-col">
                <CodeView
                  text={message.data.query}
                  language={"graphql"}
                  className="p-4"
                />
                {message.data.variables && (
                  <CodeView
                    text={safeJson.stringify(
                      message.data.variables,
                      undefined,
                      2
                    )}
                    language={"json"}
                    className="p-4"
                  />
                )}
              </div>
            ) : (
              <CodeView text={payload} language={"json"} className="p-4" />
            )}
          </PanelSection>
        )
      })}
    </Panels>
  )
})

export default MessageView
