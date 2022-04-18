import { useMemo } from "react"
import * as safeJson from "@/helpers/safeJson"
import { IApolloServerTracing, IResponseBody, Maybe } from "@/types"

export const useApolloTracing = (responseBody: Maybe<string>): Maybe<IApolloServerTracing> => {
  const cleanResponseBody = responseBody || '';
  const tracing = useMemo(() => {
    const parsedResponse = safeJson.parse<IResponseBody>(cleanResponseBody) || {}
    const tracing = parsedResponse?.extensions?.tracing
    return tracing
  }, [cleanResponseBody])

  return tracing
}
