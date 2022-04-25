import { TracingVisualization } from "@/components/TracingVisualization"
import { useApolloTracing } from "@/hooks/useApolloTracing"
import { useByteSize } from "@/hooks/useBytes"
import { config } from "@/config"
import { Maybe } from '@/types'

interface ITracingViewProps {
  response: Maybe<string>
}

export const TracingView = (props: ITracingViewProps) => {
  const { response } = props
  const tracing = useApolloTracing(response)
  const size = useByteSize(response?.length || 0, { unit: "mb" })

  if (size > config.maxUsableResponseSizeMb) {
    return (
      <div className="p-4 dark:text-white">
        The output is too large to display.
      </div>
    )
  }

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
