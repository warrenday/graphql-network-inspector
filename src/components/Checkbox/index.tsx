import React from "react";

interface ICheckboxProps {
  id?: string;
  label: string;
  className?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  testId?: string;
}

export const Checkbox = (props: ICheckboxProps) => {
  const { id, label, className, onChange, checked, testId } = props;

  return (
    <label
      htmlFor={id}
      className={`flex items-center ${className}`}
      data-testid={testId}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={() => onChange(!checked)}
        onKeyPress={(e) => e.key === "Enter" && onChange(!checked)}
        className="dark:bg-gray-900 form-checkbox rounded-md w-5 h-5"
      />
      <span className="pl-3 dark:text-gray-300">{label}</span>
    </label>
  );
};
