import { TracingVisualization } from "@/components/TracingVisualization";
import { IResponseBody } from "@/types";
import React, { useMemo } from "react";
import * as safeJson from "@/helpers/safeJson";

interface ITracingViewProps {
  response?: string;
}

export const TracingView = (props: ITracingViewProps) => {
  const { response } = props;
  const tracing = useMemo(() => {
    const parsedResponse = safeJson.parse<IResponseBody>(response) || {};
    const tracing = parsedResponse?.extensions?.tracing;
    return tracing;
  }, [response]);

  return (
    <div className="relative p-4">
      {tracing ? (
        <TracingVisualization tracing={tracing} />
      ) : (
        <p>No tracing found.</p>
      )}
    </div >
  );
};
