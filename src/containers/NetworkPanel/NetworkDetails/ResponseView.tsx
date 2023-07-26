import { useMemo } from "react"
import * as safeJson from "../../../helpers/safeJson"
import { JsonView } from "@/components/CodeView"
import { CopyButton } from "../../../components/CopyButton"
import { Button } from "../../../components/Button"

interface IResponseViewProps {
  response?: string
  collapsed?: number
  onShare?: () => void
}

export const ResponseView = (props: IResponseViewProps) => {
  const { response, collapsed, onShare } = props
  const { formattedJson, parsedResponse } = useMemo(() => {
    const parsedResponse = safeJson.parse(response) || {}
    return {
      formattedJson: safeJson.stringify(parsedResponse, undefined, 2),
      parsedResponse,
    }
  }, [response])

  return (
    <div className="relative p-4">
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        {onShare && <Button onClick={onShare}>Replay</Button>}
        <CopyButton textToCopy={formattedJson} />
      </div>
      <JsonView src={parsedResponse} collapsed={collapsed} />
    </div>
  )
}
