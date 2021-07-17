import { mockChrome } from "../mocks/mock-chrome";

export const chromeProvider = (): typeof chrome => {
  return typeof chrome === "undefined" || !chrome?.devtools
    ? mockChrome
    : chrome;
};
