import React from "react";

interface IDotProps {
  title?: string;
}

export const Dot: React.FunctionComponent<IDotProps> = (props) => {
  const { title, children } = props;

  return (
    <span
      title={title}
      data-testid="dot"
      className="h-7 w-7 inline-flex items-center justify-center text-center text-sm font-bold leading-none text-white bg-red-600 rounded-full"
    >
      {children}
    </span>
  );
};
