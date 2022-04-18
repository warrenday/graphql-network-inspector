import { IApolloServerTracing, Maybe } from "@/types"
import { TracingVisualizationRow, useTracingVirtualization } from "."

interface ITracingVisualizationProps {
  tracing: Maybe<IApolloServerTracing>;
}

export const TracingVisualization = (props: ITracingVisualizationProps) => {
  const { tracing } = props
  const totalTimeNs = tracing?.duration || 0
  const { ref, resolvers, totalSize, virtualItems, height } = useTracingVirtualization(tracing)

  return (
    <div
      ref={ref}
      className="relative h-full overflow-y-auto p-4"
    >
      <div
        className="relative w-full"
        style={{
          height: `${totalSize}px`,
        }}
      >
        <TracingVisualizationRow
          type="total"
          name="Total"
          total={totalTimeNs}
          duration={totalTimeNs}
        />

        {virtualItems.map(({ key, index, size, start }) => (
          <TracingVisualizationRow
            key={key}
            type={resolvers[index].parentType}
            name={resolvers[index].path.join(".")}
            total={totalTimeNs}
            offset={resolvers[index].startOffset}
            duration={resolvers[index].duration}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: `${size}px`,
              transform: `translateY(${start + height}px)`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
