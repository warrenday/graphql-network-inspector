import { mockRequests } from "../mocks/mock-requests";

export const mockChrome = {
  devtools: {
    network: {
      onRequestFinished: {
        addListener: (cb) => {
          for (let i = 0; i < 10; i++) {
            mockRequests.forEach((mockRequest) => {
              cb(mockRequest as any);
            });
          }
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
