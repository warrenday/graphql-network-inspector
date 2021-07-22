import { mockRequests } from "../mocks/mock-requests";

export const mockChrome = {
  devtools: {
    network: {
      onRequestFinished: {
        addListener: (cb) => {
          mockRequests.forEach((mockRequest) => {
            cb(mockRequest as any);
          });

          // Test add more requests on space
          window.addEventListener("keydown", (e) => {
            if (e.code === "Digit1") {
              mockRequests.forEach((mockRequest) => {
                cb(mockRequest as any);
              });
            }
          });
        },
        removeListener: (cb) => {},
      },
      onNavigated: {
        addListener: (cb) => {},
        removeListener: (cb) => {},
      },
    },
  },
} as typeof chrome;
