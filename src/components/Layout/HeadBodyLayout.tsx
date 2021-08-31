import React from "react";

interface IHeadBodyLayoutProps {
  header: React.ReactNode;
  body: React.ReactNode;
}

export const HeadBodyLayout = (props: IHeadBodyLayoutProps) => {
  const { header, body } = props;
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div>{header}</div>
      <div className="flex-1 h-full relative">{body}</div>
    </div>
  );
};
