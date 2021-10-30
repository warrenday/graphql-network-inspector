import React from "react";
import { nsToMs } from "../../helpers/nsToMs";

interface ITracingVizualizationRowProps {
  name?: string;
  type?: string;
  color?: 'green' | 'purple' | 'indigo';
  total: number;
  offset?: number;
  duration: number;
}

export const TracingVisualizationRow = (props: ITracingVizualizationRowProps) => {
  const { name, total, offset, duration, type, color } = props;

  const formatting = "flex justify-between pr-2 pl-2 mb-1 whitespace-nowrap"
  const backgroundColors = getBackgroundColors(color || type);
  const style = {
    marginLeft: `${((offset || 0) / total) * 100}%`,
    width: `${(duration / total) * 100}%`,
  }

  return (
    <div className={`${formatting} ${backgroundColors}`} style={style}>
      <span>
        {name || ''}
      </span>

      <span className="pl-2">
        {nsToMs(duration)} ms
      </span>
    </div>
  )
}

const getBackgroundColors = (type: string = "") => {
  switch (type.toUpperCase()) {
    case "GREEN":
    case "TOTAL":
      return "bg-green-300 dark:bg-green-700";
    case "PURPLE":
    case "QUERY":
    case "MUTATION":
    case "SUBSCRIPTION":
      return "bg-purple-300 dark:bg-purple-700";
    default:
    case "INDIGO":
      return "bg-indigo-300 dark:bg-indigo-700";
  }
}
