import { createContext, useContext, useEffect, useState } from "react"
import uniqid from "uniqid"
import { chromeProvider } from "../services/chromeProvider"
import { INetworkRequest } from "./useNetworkMonitor"

interface IShareMessageContext {
  shareNetworkRequest: (networkRequest: INetworkRequest) => void
}

const ShareMessageContext = createContext<IShareMessageContext>(null!)

interface IShareMessageProviderProps {
  children: React.ReactNode
}

const prepareSharePayload = (networkRequest: INetworkRequest) => {
  const responseBody = networkRequest.response?.body
    ? JSON.parse(networkRequest.response?.body)
    : {}

  const shareableNetworkRequest = {
    url: networkRequest.url,
    status: networkRequest.status,
    method: networkRequest.method,
    time: networkRequest.time,
    responseSize: networkRequest.response?.bodySize || 0,
    request: {
      headers: networkRequest.request.headers,
      body: networkRequest.request.body,
    },
    response: {
      headers: networkRequest.response?.headers,
      body: responseBody,
    },
  }

  return JSON.stringify(shareableNetworkRequest)
}

export const ShareMessageProvider = (props: IShareMessageProviderProps) => {
  const { children } = props

  // The sessionId ensures that given multiple instances of
  // graphql inspector, only the correct one will receive the
  // "ready" message.
  const [sessionId] = useState(uniqid())
  const [payload, setPayload] = useState<string | null>(null)

  useEffect(() => {
    const chrome = chromeProvider()

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
  }, [payload, sessionId])

  const shareNetworkRequest = (networkRequest: INetworkRequest) => {
    setPayload(prepareSharePayload(networkRequest))

    // We start by creating a new tab. The new tab will send us
    // a ready message, which we are listening for above.
    window.open(
      `${process.env.REACT_APP_SHARE_TARGET_URL}/draft?sessionId=${sessionId}`,
      "_blank"
    )
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
