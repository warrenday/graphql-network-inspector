import { createContext, useContext, useEffect, useState } from "react"
import { nanoid } from "nanoid"
import { chromeProvider } from "../services/chromeProvider"
import { NetworkRequest } from "./useNetworkMonitor"

interface IShareMessageContextType {
  shareNetworkRequest: (networkRequest: NetworkRequest) => void
}

const ShareMessageContext = createContext<IShareMessageContextType>(null!)

interface IShareMessageProviderProps {
  children: React.ReactNode
}

const prepareSharePayload = (networkRequest: NetworkRequest) => {
  const responseBody = networkRequest.response?.body
    ? JSON.parse(networkRequest.response?.body)
    : {}

  const shareableNetworkRequest = {
    url: networkRequest.url,
    status: networkRequest.status,
    method: networkRequest.method,
    time: networkRequest.time,
    request: {
      headers: networkRequest.request.headers,
      body: networkRequest.request.body,
    },
    response: {
      headers: networkRequest.response?.headers,
      body: responseBody,
      size: networkRequest.response?.bodySize,
    },
  }

  return JSON.stringify(shareableNetworkRequest)
}

export const ShareMessageProvider = (props: IShareMessageProviderProps) => {
  const { children } = props
  const chrome = chromeProvider()

  // The sessionId ensures that given multiple instances of
  // graphql inspector, only the correct one will receive the
  // "ready" message.
  const [sessionId] = useState(nanoid())
  const [payload, setPayload] = useState<string | null>(null)

  useEffect(() => {
    const listener = (
      request: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: any) => void
    ) => {
      if (request.message === "ready" && request.sessionId === sessionId) {
        // Once the receiver is ready we can send the draft payload.
        //
        // Note: sendResponse will become invalid after first use.
        // Unless we return "true"
        sendResponse({ message: "draft", payload })
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => {
      chrome.runtime.onMessage.removeListener(listener)
    }
  }, [payload])

  const shareNetworkRequest = (networkRequest: NetworkRequest) => {
    setPayload(prepareSharePayload(networkRequest))

    // We start by creating a new tab. The new tab will send us
    // a ready, which we are listening for above.
    chrome.tabs.create({
      url: `https://www.graphdev.app/draft?sessionId=${sessionId}`,
    })
  }

  return (
    <ShareMessageContext.Provider value={{ shareNetworkRequest }}>
      {children}
    </ShareMessageContext.Provider>
  )
}

export const useShareMessage = () => {
  const context = useContext(ShareMessageContext)

  if (!context) {
    throw new Error(
      "useShareMessage must be used within a ShareMessageProvider"
    )
  }

  return context
}
