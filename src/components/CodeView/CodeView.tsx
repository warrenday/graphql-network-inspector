import { useHighlight } from "@/hooks/useHighlight"
import { useByteSize } from "@/hooks/useBytes"
import { useMarkSearch } from "@/hooks/useMark"
import { useFormattedCode } from "../../hooks/useFormattedCode"
import { DelayedLoader } from "../DelayedLoader"
import { Spinner } from "../Spinner"
import { config } from "../../config"
import classes from "./CodeView.module.css"

type CodeViewProps = {
  text: string
  language: "graphql" | "json"
  autoFormat?: boolean
}

const LoadingIndicator = () => {
  return (
    <div className="flex items-center">
      <Spinner />
      <div className="dark:text-white ml-4 mt-0.5">Formatting...</div>
    </div>
  )
}

const CodeTooLargeMessage = () => {
  return (
    <div className="dark:text-white">
      The response payload is too large to display.
    </div>
  )
}

const CodeRenderer = (props: CodeViewProps) => {
  const { text, language, autoFormat } = props
  const formattedText = useFormattedCode(text, language, autoFormat)

  const { markup: jsonMarkup, loading } = useHighlight(language, formattedText)
  const ref = useMarkSearch(jsonMarkup)

  return (
    <DelayedLoader loading={loading} loader={<LoadingIndicator />}>
      <pre>
        <code
          dangerouslySetInnerHTML={{ __html: jsonMarkup }}
          className={classes.container}
          ref={ref}
        />
      </pre>
    </DelayedLoader>
  )
}

export const CodeView = (props: CodeViewProps) => {
  const { text, language, autoFormat } = props
  const size = useByteSize(text.length, { unit: "mb" })

  return (
    <div className="p-4">
      {size > config.maxUsableResponseSizeMb ? (
        <CodeTooLargeMessage />
      ) : (
        <CodeRenderer autoFormat={autoFormat} text={text} language={language} />
      )}
    </div>
  )
}
