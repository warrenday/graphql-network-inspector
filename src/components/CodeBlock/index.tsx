import {
  CodeBlock as ReactCodeBlock,
  atomOneDark,
  atomOneLight,
} from "react-code-blocks"
import { useDarkTheme } from "../../hooks/useTheme"
import classes from "./CodeBlock.module.css"

type CodeBlockProps = {
  text: string
  language: string
  highlight?: number[]
}

export const CodeBlock = (props: CodeBlockProps) => {
  const { text, highlight } = props
  const isDarkTheme = useDarkTheme()

  return (
    <div className={`react-code-block-override ${classes.container}`}>
      <ReactCodeBlock
        text={text}
        language={"graphql"}
        highlight={highlight?.join(",")}
        theme={isDarkTheme ? atomOneDark : atomOneLight}
      />
    </div>
  )
}
