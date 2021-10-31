import { useLayoutEffect, useRef, useState } from "react";

export const useContainerDimensions = () => {
  const container = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    x: 0,
    y: 0,
  });

  useLayoutEffect(() => {
    function updateMinimalPixel() {
      if (container.current) {
        setDimensions(container.current?.getBoundingClientRect())
      }
    }

    window.addEventListener('resize', updateMinimalPixel);

    return () => window.removeEventListener('resize', updateMinimalPixel);
  }, [])

  return {
    container,
    ...dimensions,
  }
}