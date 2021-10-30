import React from "react";
import { IApolloServerTracing } from "@/types";
import { nsToMs } from "../../helpers/nsToMs";
import { ResolverVisualization } from "../ResolverVizualization";

interface ITracingVizualizationProps {
  tracing?: IApolloServerTracing;
}

export const TracingVisualization = (props: ITracingVizualizationProps) => {
  const { tracing } = props;
  const totalTimeNs = tracing?.duration || 0;
  const totalTimeMs = nsToMs(totalTimeNs);
  const ratio = totalTimeNs / 100;

  return (
    <>
      <div>
        Total: {totalTimeMs} ms
      </div>

      <div>
        {tracing?.execution.resolvers.map(a => (
          <ResolverVisualization {...a} ratio={ratio} key={a.path.join('.')} />
        ))}
      </div>
    </>
  )
}
