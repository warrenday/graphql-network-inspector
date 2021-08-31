import React from "react";

interface ITextfieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  testId?: string;
}

export const Textfield = (props: ITextfieldProps) => {
  const { value, onChange, placeholder, autoFocus, className, testId } = props;

  return (
    <input
      className={`dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-1 w-80 rounded-lg ${className}`}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      placeholder={placeholder}
      data-testid={testId}
      autoFocus={autoFocus}
    />
  );
};
