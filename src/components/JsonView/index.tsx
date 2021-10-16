import React, { useRef } from "react";
import ReactJson from "@notdutzi/react-json-view";
import { useDarkTheme } from "../../hooks/useTheme";
import { useAutoFocusResponse } from "../../hooks/useAutoFocusResponse";
import { useKeyDown } from "../../hooks/useKeyDown";

type JsonViewProps = {
  src: object;
};

export const JsonView = (props: JsonViewProps) => {
  const isDarkTheme = useDarkTheme();
  const { autoFocusResponse, setAutoFocusResponse } = useAutoFocusResponse();

  const clearFocusRef = useRef<HTMLDivElement>(null);

  useKeyDown("Escape", () => {
    setAutoFocusResponse(false);
    clearFocusRef.current?.focus();
  });

  return (
    <div className="p-4 font-bold">
      <div ref={clearFocusRef} tabIndex={0} />
      <ReactJson
        name={null}
        src={props.src}
        theme={isDarkTheme ? "tomorrow" : "rjv-default"}
        enableClipboard={false}
        displayDataTypes={false}
        displayObjectSize={true}
        collapsed={2}
        autoFocus={autoFocusResponse}
      />
    </div>
  );
};
