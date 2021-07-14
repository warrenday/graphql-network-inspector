import React from "react";

interface ICheckboxProps {
  id?: string;
  label: string;
  className?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export const Checkbox = (props: ICheckboxProps) => {
  const { id, label, className, onChange, checked } = props;
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={() => onChange(!checked)}
        className="bg-gray-900 form-checkbox"
      />
      <label htmlFor={id} className="pl-2">
        {label}
      </label>
    </div>
  );
};
