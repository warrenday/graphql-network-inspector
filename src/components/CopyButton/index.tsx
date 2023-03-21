import { Button } from "../Button"
import useCopy from "../../hooks/useCopy"

type CopyButtonProps = {
  label?: string
  textToCopy: string
  className?: string
}

export const CopyButton = (props: CopyButtonProps) => {
  const { textToCopy, className } = props
  const { isCopied, copy } = useCopy()
  const buttonLabel = props.label || "Copy"

  return (
    <div className={className}>
      <Button
        testId="copy-button"
        variant="primary"
        onClick={() => {
          copy(textToCopy)
        }}
        style={{
          border: "1px solid #797979",
          borderRadius: "2px",
          padding: "1px 5px",
          fontSize: "10px",
        }}
      >
        {isCopied ? "Copied!" : buttonLabel}
      </Button>
    </div>
  )
}
