import { useHighlight } from "@/hooks/useHighlight"
import { useByteSize } from "@/hooks/useBytes"
import { DelayedLoader } from "../DelayedLoader"
import { Spinner } from "../Spinner"
import { config } from "../../config"
import classes from "./CodeView.module.css"
import "highlight.js/styles/atom-one-dark.css"

type CodeViewProps = {
  text: string
  language: "graphql" | "json"
}

const LoadingIndicator = () => {
  return (
    <div className="flex items-center">
      <Spinner />
      <div className="text-white ml-4 mt-0.5">Formatting...</div>
    </div>
  )
}

const CodeTooLargeMessage = () => {
  return (
    <div className="text-white">
      The response payload is too large to display.
    </div>
  )
}

const CodeRenderer = (props: CodeViewProps) => {
  const { text, language } = props
  const { markup: jsonMarkup, loading } = useHighlight(language, text)

  return (
    <DelayedLoader loading={loading} loader={<LoadingIndicator />} delay={300}>
      <pre>
        <code
          dangerouslySetInnerHTML={{ __html: jsonMarkup }}
          className={classes.container}
        />
      </pre>
    </DelayedLoader>
  )
}

export const CodeView = (props: CodeViewProps) => {
  const { text, language } = props
  const size = useByteSize(text.length, { unit: "mb" })

  return (
    <div className="p-4">
      {size > config.maxUsableResponseSizeMb ? (
        <CodeTooLargeMessage />
      ) : (
        <CodeRenderer text={text} language={language} />
      )}
    </div>
  )
}
