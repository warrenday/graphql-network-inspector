import React from "react";

export const Panels: React.FunctionComponent = (props) => {
  const { children } = props;

  return (
    <div className="divide-y divide-solid dark:divide-gray-600">{children}</div>
  );
};

interface IPanelSectionProps {
  title?: string;
  className?: string;
}

export const PanelSection: React.FunctionComponent<IPanelSectionProps> = (
  props
) => {
  const { title, children, className } = props;

  return (
    <div className={`p-4 ${className}`}>
      {title && <div className="font-bold mb-4">{title}</div>}
      <div>{children}</div>
    </div>
  );
};
