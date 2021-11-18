import { TracingVisualization } from "@/components/TracingVisualization";
import { IResponseBody } from "@/types";
import { useMemo } from "react";
import * as safeJson from "@/helpers/safeJson";
import { useApolloTracing } from "@/hooks/useApolloTracing";

interface ITracingViewProps {
  response?: string;
}

export const TracingView = (props: ITracingViewProps) => {
  const { response } = props;
  const tracing = useApolloTracing(response);

  return (
    <div className="relative p-4">
      {tracing ? (
        <TracingVisualization tracing={tracing} />
      ) : (
        <p>No tracing found.</p>
      )}
    </div>
  );
};
