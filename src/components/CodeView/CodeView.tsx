import { useHighlight } from "@/hooks/useHighlight"
import { useByteSize } from "@/hooks/useBytes"
import { useMarkSearch } from "@/hooks/useMark"
import { useFormattedCode } from "../../hooks/useFormattedCode"
import { DelayedLoader } from "../DelayedLoader"
import { Spinner } from "../Spinner"
import { config } from "../../config"
import classes from "./CodeView.module.css"

interface ICodeViewProps {
  text: string
  language: "graphql" | "json"
  autoFormat?: boolean
  className?: string
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

const CodeRenderer = (props: ICodeViewProps) => {
  const { text, language, autoFormat } = props
  const formattedText = useFormattedCode(text, language, autoFormat)

  const { markup: jsonMarkup, loading } = useHighlight(language, formattedText)
  const ref = useMarkSearch(jsonMarkup)

  // TODO
  // When mark returns results. Show a component to jump to the next/previous
  // When the component renders also jump to the first result.

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

export const CodeView = (props: ICodeViewProps) => {
  const { text, language, autoFormat, className } = props
  const size = useByteSize(text.length, { unit: "mb" })

  return (
    <div className={className}>
      {size > config.maxUsableResponseSizeMb ? (
        <CodeTooLargeMessage />
      ) : (
        <CodeRenderer autoFormat={autoFormat} text={text} language={language} />
      )}
    </div>
  )
}
