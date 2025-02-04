import { Button } from "../Button"
import useCopy from "../../hooks/useCopy"

interface ICopyButtonProps {
  label?: string
  textToCopy?: string
  className?: string
  onClick?: () => void
  isCopied?: boolean
}

export const CopyButton = (props: ICopyButtonProps) => {
  const { textToCopy, className, onClick, label, isCopied: externalIsCopied } = props
  const { isCopied: internalIsCopied, copy } = useCopy()
  const buttonLabel = label ?? "Copy"

  const showCopied = externalIsCopied ?? internalIsCopied

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (textToCopy) {
      copy(textToCopy)
    }
  }

  return (
    <div className={className}>
      <Button
        testId="copy-button"
        variant="primary"
        onClick={handleClick}
      >
        {showCopied ? "Copied!" : buttonLabel}
      </Button>
    </div>
  )
}
