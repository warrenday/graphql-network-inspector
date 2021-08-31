import React from "react";
import { IconButton } from "../IconButton";
import { CloseIcon } from "../Icons/CloseIcon";

interface ICloseButtonProps {
  onClick: () => void;
  testId?: string;
}

export const CloseButton: React.FC<ICloseButtonProps> = (props) => {
  const { children, onClick, testId } = props;
  return (
    <IconButton
      icon={<CloseIcon />}
      onClick={onClick}
      className="w-10"
      testId={testId}
    >
      {children}
    </IconButton>
  );
};
