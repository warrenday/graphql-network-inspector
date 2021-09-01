import { useEffect } from "react";

export const useSearchStart = (cb: () => void) => {
  useEffect(() => {
    // Attaching event to body allows stopPropagation
    // to block inbuilt search bar from appearing
    const body = document.querySelector("body");
    if (!body) {
      return;
    }

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
    body.addEventListener("keydown", handleKeyDown);
    body.addEventListener("keyup", handleKeyUp);

    return () => {
      body.removeEventListener("keydown", handleKeyDown);
      body.removeEventListener("keyup", handleKeyUp);
    };
  }, [cb]);
};
