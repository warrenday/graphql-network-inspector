import { mockRequests } from "../mocks/mock-requests";

const mockChrome = {
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
    },
  },
} as typeof chrome;

export const chromeProvider = (): typeof chrome => {
  return typeof chrome === "undefined" || !chrome?.devtools
    ? mockChrome
    : chrome;
};
