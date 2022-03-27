import React, { useCallback, useEffect, useRef, useState } from "react"
import { useWindowEvent } from "../../hooks/useWindowEvent"

interface ResizableSplitProps {
  minWidth: number
  initialWidth: number
  children: [React.ReactNode, React.ReactNode]
}

const KEYBOARD_RESIZE_STEP = 10

const ResizableSplit: React.FC<ResizableSplitProps> = ({
  children,
  initialWidth,
  minWidth,
}) => {
  const draggedWidthRef = useRef(initialWidth)
  const containerRef = useRef<HTMLDivElement>(undefined!)
  const [isDragging, setIsDragging] = useState(false)

  const updateVisualWidth = useCallback(() => {
    containerRef.current.style.setProperty(
      "--panel-width",
      `${Math.max(minWidth, draggedWidthRef.current)}px`
    )
  }, [minWidth])

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!isDragging) return
      if (!event.isPrimary) return
      draggedWidthRef.current += event.movementX
      updateVisualWidth()
    },
    [isDragging, updateVisualWidth]
  )

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (!event.isPrimary) return
      setIsDragging(false)
      draggedWidthRef.current = Math.max(draggedWidthRef.current, minWidth)
      updateVisualWidth()
    },
    [minWidth, updateVisualWidth]
  )

  useEffect(() => {
    updateVisualWidth()
  }, [updateVisualWidth])

  useWindowEvent("pointerup", handlePointerUp)
  useWindowEvent("pointermove", handlePointerMove)

  const [leftChild, rightChild] = children
  const hasBothPanels = Boolean(leftChild && rightChild)
  return (
    <div
      ref={containerRef}
      className="w-full h-full grid"
      style={{
        gridTemplateColumns: hasBothPanels
          ? `var(--panel-width) 1rem 1fr`
          : `1fr`,
      }}
    >
      {leftChild && <div className="grid overflow-x-hidden">{leftChild}</div>}

      {hasBothPanels && (
        <button
          className="resize-split__resize-handle"
          aria-label="Resize handle"
          onPointerDown={(event) => {
            if (!event.isPrimary) return
            setIsDragging(true)
          }}
          onKeyDown={(event) => {
            switch (event.key) {
              case "ArrowLeft":
                draggedWidthRef.current -= KEYBOARD_RESIZE_STEP
                updateVisualWidth()
                break
              case "ArrowRight":
                draggedWidthRef.current += KEYBOARD_RESIZE_STEP
                updateVisualWidth()
                break
            }
          }}
        />
      )}

      {rightChild && <div className="grid overflow-x-hidden">{rightChild}</div>}
    </div>
  )
}

export default ResizableSplit
