import { twMerge } from "tailwind-merge"
import { ReactElement } from "react"

const baseStyle = `
  py-1.5 px-2.5 text-md font-semibold rounded-md text-gray-600 dark:text-white z-10
`

const styles = {
  primary: `
    bg-gray-200 dark:bg-gray-700
    hover:bg-gray-300 dark:hover:bg-gray-600
  `,
  ghost: ``,
}

interface IButtonProps {
  onClick?: () => void
  className?: string
  variant?: "primary" | "ghost"
  size?: "sm" | "md" | "lg"
  children?: React.ReactNode
  icon?: ReactElement
  testId?: string
}

export const Button = (props: IButtonProps) => {
  const {
    children,
    onClick,
    variant = "primary",
    className,
    icon,
    testId,
  } = props

  const computedClassName = twMerge(baseStyle, [styles[variant]], className)

  return (
    <button
      type="button"
      onClick={onClick}
      className={computedClassName}
      data-testid={testId}
    >
      <div className="flex items-center">
        {icon && <span className={children ? "pr-2" : ""}>{icon}</span>}
        {children}
      </div>
    </button>
  )
}
