import React from "react"

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>

const classes =
  "dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-lg text-lg"

export const TextInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => (
    <input
      type="text"
      {...props}
      ref={ref}
      className={`${props.className ?? ""} ${classes}`}
    />
  )
)
