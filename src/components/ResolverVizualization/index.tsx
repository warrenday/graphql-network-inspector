import { nsToMs } from "../../helpers/nsToMs";
import { IApolloServerTracingResolvers } from "@/types";
import React, { Fragment, useMemo } from "react";

interface IResolverVisualizationProps extends IApolloServerTracingResolvers {
  ratio: number;
}

export const ResolverVisualization = (props: IResolverVisualizationProps) => {
  const { duration, startOffset, path, ratio } = props;

  const { offsetSpaces, durationDashes } = useMemo(() => {
    const offsetDashesLength = Math.floor(startOffset / ratio);
    const offsetSpaces = Array.from({ length: offsetDashesLength }, () => ' ');

    const durationMs = nsToMs(duration);
    const durationDashesLength = Math.floor(duration / ratio) - path.join('.').length - durationMs.toString().length;
    const cleanDurationDashesLength = durationDashesLength < 0 ? 1 : durationDashesLength;
    const durationDashes = Array.from({ length: cleanDurationDashesLength }, () => '-').join('');

    return {
      offsetSpaces,
      durationDashes,
    }
  }, [duration, startOffset, path, ratio])

  return (
    <div>
      {offsetSpaces.map((a, index) => (
        <Fragment key={index}>
          &nbsp;
        </Fragment>
      ))}{path.join('.')}{durationDashes}{nsToMs(duration)} ms
    </div>
  )
}