import { useMemo, CSSProperties } from "react"
import { nsToMs } from "@/helpers/nsToMs"
import { useBoundingRect } from "@/hooks/useBoundingRect"

interface ITracingVisualizationRowProps {
  name?: string
  type?: string
  color?: "green" | "purple" | "indigo"
  total: number
  offset?: number
  duration: number
  style?: CSSProperties
}

export const TracingVisualizationRow = (
  props: ITracingVisualizationRowProps
) => {
  const { name, total, offset, duration, type, color, style } = props

  const backgroundColorCss = getBackgroundColors(color || type)

  const { container, width } = useBoundingRect()
  const {
    marginLeftPercentage,
    marginLeftCss,
    showBeforeDuration,
    showAllBeforeDuration,
    widthPercentageCss,
  } = useMemo(() => {
    const percentage = 100 / (width || 1)
    const marginLeftPercentage = ((offset || 0) / total) * 100
    const widthPercentage = (duration / total) * 100
    const isAt100 = marginLeftPercentage + percentage >= 100
    const marginLeftCss = isAt100
      ? `calc(${marginLeftPercentage}% - 1px)`
      : `${marginLeftPercentage}%`
    const widthPercentageCss =
      widthPercentage <= percentage ? "1px" : `${widthPercentage}%`

    const showBeforeDuration =
      widthPercentage <= 50 && marginLeftPercentage >= 50
    const showAllBeforeDuration =
      showBeforeDuration && marginLeftPercentage > 90

    return {
      marginLeftPercentage,
      marginLeftCss,
      showBeforeDuration,
      showAllBeforeDuration,
      widthPercentageCss,
    }
  }, [width, duration, offset, total])

  return (
    <div
      ref={container}
      className="w-full whitespace-nowrap absolute top-0 left-0"
      style={style}
    >
      {marginLeftPercentage > 0 && (
        <div
          className="inline-block text-right"
          style={{ width: marginLeftCss }}
        >
          {showBeforeDuration && <span className="pr-2">{name || ""}</span>}

          {showAllBeforeDuration && (
            <span className="pr-2">{nsToMs(duration)} ms</span>
          )}
        </div>
      )}

      <div
        className={`inline-block ${backgroundColorCss}`}
        style={{ width: widthPercentageCss }}
      >
        <div className="flex justify-between">
          {!showBeforeDuration && <span className="pl-2">{name || ""}</span>}

          {showAllBeforeDuration ? (
            <>&nbsp;</>
          ) : (
            <span className="pr-2 pl-2">{nsToMs(duration)} ms</span>
          )}
        </div>
      </div>
    </div>
  )
}

const getBackgroundColors = (type: string = "") => {
  switch (type.toUpperCase()) {
    case "GREEN":
    case "TOTAL":
      return "bg-green-400 dark:bg-green-700"
    case "PURPLE":
    case "QUERY":
    case "MUTATION":
    case "SUBSCRIPTION":
      return "bg-purple-400 dark:bg-purple-700"
    default:
    case "INDIGO":
      return "bg-indigo-400 dark:bg-indigo-700"
  }
}
