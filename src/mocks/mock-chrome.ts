import { mockRequests } from "../mocks/mock-requests"
import { DeepPartial } from "utility-types"

const removeListeners: Record<string, () => void> = {}

const mockedChrome: DeepPartial<typeof chrome> = {
  devtools: {
    panels: {
      themeName: "dark",
    },
    network: {
      getHAR: (cb) => {
        cb({ entries: mockRequests } as any)
      },
      onRequestFinished: {
        addListener: (cb) => {
          // On press key "1", add more mock requests to app
          const handleKeydown = (e: KeyboardEvent) => {
            if (e.code === "Digit1") {
              mockRequests.forEach((mockRequest) => {
                cb(mockRequest as any)
              })
            }
          }
          window.addEventListener("keydown", handleKeydown)
          removeListeners.onRequestFinished = () =>
            window.removeEventListener("keydown", handleKeydown)
        },
        removeListener: () => {
          removeListeners.onRequestFinished()
        },
      },
      onNavigated: {
        addListener: () => {},
        removeListener: () => {},
      },
    },
  },
  runtime: {
    getPlatformInfo: ((cb) => {
      const platformInfo: chrome.runtime.PlatformInfo = {
        arch: "x86-64",
        nacl_arch: "x86-64",
        os: "mac",
      }
      cb(platformInfo)
    }) as typeof chrome.runtime.getPlatformInfo,
    onMessage: {
      addListener: () => {},
      removeListener: () => {},
    },
  },
}

const mockChrome = mockedChrome as typeof chrome

export { mockChrome }
