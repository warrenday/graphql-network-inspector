import React from "react";

interface ILayoutMainProps {
  header: React.ReactNode;
  body: React.ReactNode;
}

export const LayoutMain = (props: ILayoutMainProps) => {
  const { header, body } = props;
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div>{header}</div>
      <div className="flex-1 h-full relative">{body}</div>
    </div>
  );
};
