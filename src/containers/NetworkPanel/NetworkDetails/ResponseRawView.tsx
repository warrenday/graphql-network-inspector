import { useMemo } from "react"
import * as safeJson from "@/helpers/safeJson"
import { CopyButton } from "@/components/CopyButton"
import { CodeView } from "@/components/CodeView"
import { ShareButton } from "../../../components/ShareButton"

interface IResponseRawViewProps {
  response?: string
  onShare?: () => void
}

const useFormatResponse = (response?: string): string => {
  return useMemo(() => {
    if (!response) {
      return "{}"
    }

    // We remove the "extensions" prop as this is just meta data
    // for things like "tracing" and can be huge in size.
    const parsedResponse = safeJson.parse<{ extensions?: string }>(response)
    if (!parsedResponse) {
      return ""
    }

    if ("extensions" in parsedResponse) {
      delete parsedResponse["extensions"]
    }

    return safeJson.stringify(parsedResponse, undefined, 2)
  }, [response])
}

export const ResponseRawView = (props: IResponseRawViewProps) => {
  const { response, onShare } = props
  const formattedJson = useFormatResponse(response)

  return (
    <div className="relative p-4">
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        {onShare && <ShareButton onClick={onShare} />}
        <CopyButton textToCopy={formattedJson} />
      </div>
      <CodeView text={formattedJson} language={"json"} className="p-4" />
    </div>
  )
}
