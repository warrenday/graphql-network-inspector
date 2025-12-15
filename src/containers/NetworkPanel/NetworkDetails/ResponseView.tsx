import { useMemo, useState } from "react"
import * as safeJson from "../../../helpers/safeJson"
import { JsonView } from "@/components/CodeView"
import { CopyButton } from "../../../components/CopyButton"
import { ShareButton } from "../../../components/ShareButton"
import { IResponseChunk } from "@/helpers/networkHelpers"
import { mergeResponseChunks, formatIncrementalResponseTimeline } from "@/helpers/incrementalResponseHelpers"

interface IResponseViewProps {
  response?: string
  collapsed?: number
  onShare?: () => void
  chunks?: IResponseChunk[]
  isStreaming?: boolean
}

export const ResponseView = (props: IResponseViewProps) => {
  const { response, collapsed, onShare, chunks, isStreaming } = props
  const [viewMode, setViewMode] = useState<'merged' | 'timeline'>('merged')

  const { formattedJson, parsedResponse, hasIncrementalData } = useMemo(() => {
    // If we have chunks, merge them
    if (chunks && chunks.length > 0) {
      const { mergedData, hasIncrementalData } = mergeResponseChunks(chunks)

      // Remove hasNext from the display (it's internal to incremental delivery)
      const displayData = mergedData ? { ...mergedData } : {}
      if (displayData.hasNext !== undefined) {
        delete displayData.hasNext
      }

      return {
        formattedJson: safeJson.stringify(displayData, undefined, 2),
        parsedResponse: displayData,
        hasIncrementalData,
      }
    }

    // Otherwise, use the single response
    const parsedResponse = safeJson.parse(response) || {}
    return {
      formattedJson: safeJson.stringify(parsedResponse, undefined, 2),
      parsedResponse,
      hasIncrementalData: false,
    }
  }, [response, chunks])

  const timeline = useMemo(() => {
    if (chunks && chunks.length > 0) {
      return formatIncrementalResponseTimeline(chunks)
    }
    return []
  }, [chunks])

  return (
    <div className="relative p-4">
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        {hasIncrementalData && (
          <>
            <button
              onClick={() => setViewMode('merged')}
              className={`py-1.5 px-2.5 text-md font-semibold rounded-md ${
                viewMode === 'merged'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-white'
              }`}
            >
              Merged
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`py-1.5 px-2.5 text-md font-semibold rounded-md ${
                viewMode === 'timeline'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-white'
              }`}
            >
              Timeline ({chunks?.length || 0} chunks)
            </button>
          </>
        )}
        {onShare && <ShareButton onClick={onShare} />}
        <CopyButton textToCopy={formattedJson} />
      </div>

      {isStreaming && (
        <div className="mb-3 px-2 py-1 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded text-xs text-blue-800 dark:text-blue-200 w-fit z-10 relative">
          Incremental Response (@defer/@stream) - {chunks?.length || 0} chunk(s)
        </div>
      )}

      {viewMode === 'merged' ? (
        <JsonView src={parsedResponse} collapsed={collapsed} />
      ) : (
        <div className="space-y-4">
          {timeline.map((item, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <div className="flex justify-between items-center mb-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="font-semibold">
                  Chunk {item.chunkIndex + 1}
                  {item.isIncremental && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                      Incremental
                    </span>
                  )}
                </span>
              </div>
              <JsonView src={item.data || {}} collapsed={1} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
