import { useMemo } from "react"
import * as safeJson from "../../../helpers/safeJson"
import { JsonView } from "../../../components/JsonView"
import { CopyButton } from "../../../components/CopyButton"

interface IResponseViewProps {
  response?: string
  collapsed?: number
}

export const ResponseView = (props: IResponseViewProps) => {
  const { response, collapsed } = props
  const { formattedJson, parsedResponse } = useMemo(() => {
    const parsedResponse = safeJson.parse(response) || {}
    return {
      formattedJson: safeJson.stringify(parsedResponse, undefined, 2),
      parsedResponse,
    }
  }, [response])

  return (
    <div className="p-4">
      <CopyButton
        textToCopy={formattedJson}
        className="absolute right-10 top-14 z-10"
      />
      <JsonView src={parsedResponse} collapsed={collapsed} />
    </div>
  )
}
