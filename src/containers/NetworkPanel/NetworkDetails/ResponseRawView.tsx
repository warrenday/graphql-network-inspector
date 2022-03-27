import { useMemo } from "react"
import * as safeJson from "../../../helpers/safeJson"
import { CodeBlock } from "../../../components/CodeBlock"
import { CopyButton } from "../../../components/CopyButton"
import { useSearch } from "@/hooks/useSearch"
import { getSearchLineNumbers } from "@/services/searchService"

interface IResponseRawViewProps {
  response?: string
}

export const ResponseRawView = (props: IResponseRawViewProps) => {
  const { response } = props
  const { searchQuery } = useSearch()
  const formattedJson = useMemo(() => {
    const parsedResponse = safeJson.parse(response) || {}
    return safeJson.stringify(parsedResponse, undefined, 2)
  }, [response])
  const highlightedLines = useMemo(
    () => getSearchLineNumbers(searchQuery, formattedJson),
    [searchQuery, formattedJson]
  )

  return (
    <div className="p-4">
      <CopyButton
        textToCopy={formattedJson}
        className="absolute right-10 top-14 z-10"
      />

      <CodeBlock
        text={formattedJson}
        language={"json"}
        highlight={highlightedLines}
      />
    </div>
  )
}
