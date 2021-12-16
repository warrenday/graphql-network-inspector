import React from "react";
import ReactJson from "react-json-view";
import { useDarkTheme } from "../../hooks/useTheme";

type JsonViewProps = {
  src: object;
  collapsed?: number;
};

export const JsonView = (props: JsonViewProps) => {
  const isDarkTheme = useDarkTheme();

  return (
    <div className="p-4 font-bold">
      <ReactJson
        name={null}
        src={props.src}
        theme={isDarkTheme ? "tomorrow" : "rjv-default"}
        enableClipboard={false}
        displayDataTypes={false}
        displayObjectSize={true}
        collapsed={props.collapsed || 2}
      />
    </div>
  );
};
