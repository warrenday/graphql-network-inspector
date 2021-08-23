import React from "react";

interface ISearchPanelProps {
  query: string;
}

export const SearchPanel = (props: ISearchPanelProps) => {
  const { query } = props;

  return <div>search here: {query}</div>;
};
