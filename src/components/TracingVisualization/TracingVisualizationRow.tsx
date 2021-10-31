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

  const backgroundColors = getBackgroundColors(color || type);

  const marginLeftPercentage = ((offset || 0) / total) * 100;
  const widthPercentage = (duration / total) * 100;
  const cleanWidthPercentage = widthPercentage < 1 ? 1 : widthPercentage

  const showBeforeDuration = cleanWidthPercentage <= 50 && marginLeftPercentage >= 50;
  const showAllBeforeDuration = showBeforeDuration && marginLeftPercentage > 90;

  return (
    <div className={`w-full mb-1 whitespace-nowrap`}>
      {marginLeftPercentage > 0 && (
        <div className="inline-block text-right" style={{ width: `${marginLeftPercentage}%` }}>
          {showBeforeDuration && (
            <span className="pr-2">
              {name || ''}
            </span>
          )}

          {showAllBeforeDuration && (
            <span className="pr-2">
              {nsToMs(duration)} ms
            </span>
          )}
        </div>
      )}


      <div className={`inline-block ${backgroundColors}`} style={{ width: `${cleanWidthPercentage}%` }}>
        <div className="flex justify-between">
          {!showBeforeDuration && (
            <span className="pl-2">
              {(name || '')}
            </span>
          )}

          {showAllBeforeDuration ? (
            <>&nbsp;</>
          ) : (
            <span className="pr-2 pl-2">
              {nsToMs(duration)} ms
            </span>
          )}
        </div>
      </div>
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
