import { ReactElement } from "react"
import ResizableSplit from "../ResizableSplit"

interface ISplitPaneLayoutProps {
  header?: ReactElement
  leftPane?: ReactElement
  rightPane?: ReactElement
}

export const SplitPaneLayout = (props: ISplitPaneLayoutProps) => {
  const { header, rightPane, leftPane } = props

  return (
    <div
      className="h-screen overflow-hidden"
      style={{ gridTemplateRows: "auto 1fr" }}
    >
      <div>{header}</div>
      <ResizableSplit initialWidth={210} minWidth={130}>
        {leftPane}
        {rightPane}
      </ResizableSplit>
    </div>
  )
}
