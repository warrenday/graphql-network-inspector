import { useHighlight } from "@/hooks/useHighlight"
import { useByteSize } from "@/hooks/useBytes"
import { useMarkSearch } from "@/hooks/useMark"
import { DelayedLoader } from "../DelayedLoader"
import { Spinner } from "../Spinner"
import { config } from "../../config"
import classes from "./CodeView.module.css"

type CodeViewProps = {
  text: string
  language: "graphql" | "json"
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
  const { text, language } = props
  const { markup: jsonMarkup, loading } = useHighlight(language, text)
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
