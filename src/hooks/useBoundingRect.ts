import { useLayoutEffect, useRef, useState } from "react";
import { debounce } from '@/helpers/debounce';

export const useBoundingRect = () => {
  const container = useRef<HTMLDivElement>(null)

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    const updateContainerWidth = debounce(() => {
      if (container.current) {
        const { width, height } = container.current.getBoundingClientRect();
        setWidth(width);
        setHeight(height);
      }
    }, 600);

    window.addEventListener('resize', updateContainerWidth);

    return () => window.removeEventListener('resize', updateContainerWidth);
  }, [])

  return {
    container,
    width,
    height,
  }
}