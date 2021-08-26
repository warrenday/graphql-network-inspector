import React, { useMemo } from "react";

interface IHighlightedTextProps {
  text: string;
  highlight: string;
  buffer?: number;
}

const searchString = ({
  text,
  highlight,
  buffer = 12,
}: IHighlightedTextProps) => {
  const searchRegex = new RegExp(highlight, "i");
  const matchPosition = text.search(searchRegex);
  const highlightLength = highlight.length;
  const matchPositionEnd = matchPosition + highlightLength;

  const start = text.slice(Math.max(0, matchPosition - buffer), matchPosition);
  const match = text.slice(matchPosition, matchPositionEnd);
  const end = text.slice(matchPositionEnd, matchPositionEnd + buffer);

  return {
    start,
    match,
    end,
  };
};

export const HighlightedText = (props: IHighlightedTextProps) => {
  const { text, highlight, buffer } = props;
  const { start, match, end } = useMemo(
    () => searchString({ text, highlight, buffer }),
    [text, highlight, buffer]
  );

  return (
    <>
      {start}
      <span className="bg-blue-900">{match}</span>
      {end}
    </>
  );
};
