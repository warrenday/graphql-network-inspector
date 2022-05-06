import { Button } from "../Button"

type AutoFormatToggleButtonProps = {
  active?: boolean
  onToggle?: (value: boolean) => void
  className?: string
}

export const AutoFormatToggleButton = (props: AutoFormatToggleButtonProps) => {
  const { active, onToggle, className } = props

  return (
    <div className={className}>
      <Button
        testId="auto-format-toggle-button"
        variant="contained"
        onClick={() => {
          onToggle?.(!active)
        }}
      >
        {active ? "AutoFormat on" : "AutoFormat off"}
      </Button>
    </div>
  )
}
