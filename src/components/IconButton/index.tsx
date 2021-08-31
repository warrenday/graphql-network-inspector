import React from "react";

interface IIconButtonProps {
  icon: React.ReactElement;
  onClick: () => void;
  className?: string;
  testId?: string;
}

export const IconButton: React.FC<IIconButtonProps> = (props) => {
  const { children, icon, onClick, className, testId } = props;

  return (
    <button
      onClick={onClick}
      className={`flex justify-center items-center opacity-70 hover:opacity-100 transition ${className}`}
      data-testid={testId}
    >
      <span>{icon}</span>
      {children && <span className="pl-2">{children}</span>}
    </button>
  );
};
