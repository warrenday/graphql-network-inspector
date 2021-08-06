import { useEffect } from "react";

type Code = "ArrowDown" | "ArrowUp";

export const useKeyPress = (code: Code, cb: () => void) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === code) {
        cb();
      }
    };
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [code, cb]);
};
