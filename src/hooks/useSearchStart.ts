import { useEffect } from "react";

export const useSearchStart = (cb: () => void) => {
  useEffect(() => {
    let commandKeyPressed = false;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "MetaLeft") {
        commandKeyPressed = true;
      } else if (event.code === "KeyF" && commandKeyPressed) {
        event.preventDefault();
        event.stopPropagation();
        cb();
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "MetaLeft") {
        commandKeyPressed = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [cb]);
};
