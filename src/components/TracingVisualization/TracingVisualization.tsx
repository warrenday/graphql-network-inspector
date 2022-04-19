import { IApolloServerTracing, Maybe } from "@/types"
import { TracingVisualizationRow, useTracingVirtualization } from "."

interface ITracingVisualizationProps {
  tracing: Maybe<IApolloServerTracing>;
}

export const TracingVisualization = (props: ITracingVisualizationProps) => {
  const { tracing } = props
  const totalTimeNs = tracing?.duration || 0
  const { ref, resolvers, totalSize, virtualItems } = useTracingVirtualization(tracing)

  return (
    <div
      ref={ref}
      className="relative h-full overflow-y-auto p-4"
    >
      <div
        className="relative w-full"
        style={{ height: `${totalSize}px` }}
      >
        <TracingVisualizationRow
          type="total"
          name="Total"
          total={totalTimeNs}
          duration={totalTimeNs}
        />

        {virtualItems.map(({ key, index, size, start }) => {
          const { parentType, path, startOffset, duration } = resolvers[index];
          return (
            <TracingVisualizationRow
              key={key}
              type={parentType}
              name={path.join(".")}
              total={totalTimeNs}
              offset={startOffset}
              duration={duration}
              style={{
                height: `${size}px`,
                transform: `translateY(${start + size}px)`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
