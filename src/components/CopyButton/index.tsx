import { Button } from "../Button"
import useCopy from "../../hooks/useCopy"

interface ICopyButtonProps {
  label?: string
  textToCopy: string
  className?: string
}

export const CopyButton = (props: ICopyButtonProps) => {
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
      >
        {isCopied ? "Copied!" : buttonLabel}
      </Button>
    </div>
  )
}
