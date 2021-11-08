import React from "react";
import { IApolloServerTracing } from "@/types";
import { TracingVisualizationRow } from ".";

interface ITracingVisualizationProps {
  tracing?: IApolloServerTracing;
}

export const TracingVisualization = (props: ITracingVisualizationProps) => {
  const { tracing } = props;
  const totalTimeNs = tracing?.duration || 0;

  return (
    <>
      <TracingVisualizationRow
        type="total"
        name="Total"
        total={totalTimeNs}
        duration={totalTimeNs}
      />

      {tracing?.execution.resolvers.map(a => (
        <TracingVisualizationRow
          key={a.path.join('.')}
          type={a.parentType}
          name={a.path.join('.')}
          total={totalTimeNs}
          offset={a.startOffset}
          duration={a.duration}
        />
      ))}
    </>
  )
}
