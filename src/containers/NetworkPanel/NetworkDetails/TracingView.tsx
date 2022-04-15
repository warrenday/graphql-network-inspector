import { TracingVisualization } from "@/components/TracingVisualization"
import { useApolloTracing } from "@/hooks/useApolloTracing"

interface ITracingViewProps {
  response?: string
}

export const TracingView = (props: ITracingViewProps) => {
  const { response } = props
  const tracing = useApolloTracing(response)

  return (
    <div className="relative h-full">
      {tracing ? (
        <TracingVisualization tracing={tracing} />
      ) : (
        <p>No tracing found.</p>
      )}
    </div>
  )
}
