import { mockRequests } from "../mocks/mock-requests";

let removeListeners: Record<string, () => void> = {};

export const mockChrome = {
  devtools: {
    panels: {
      themeName: "dark",
    },
    network: {
      getHAR: (cb) => {
        cb({ entries: mockRequests } as any);
      },
      onRequestFinished: {
        addListener: (cb) => {
          // On press key "1", add more mock requests to app
          const handleKeydown = (e: KeyboardEvent) => {
            if (e.code === "Digit1") {
              mockRequests.forEach((mockRequest) => {
                cb(mockRequest as any);
              });
            }
          };
          window.addEventListener("keydown", handleKeydown);
          removeListeners.onRequestFinished = () =>
            window.removeEventListener("keydown", handleKeydown);
        },
        removeListener: (cb) => {
          removeListeners.onRequestFinished();
        },
      },
      onNavigated: {
        addListener: (cb) => {},
        removeListener: (cb) => {},
      },
    },
  },
} as typeof chrome;
