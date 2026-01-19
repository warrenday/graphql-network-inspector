import { DeepPartial } from 'utility-types'
import EventEmitter from 'eventemitter3'
import { IMockRequest, mockRequests } from '../mocks/mock-requests'

let mockStorage = {}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Configure an event to add more mock requests
const eventEmitter = new EventEmitter<{
  onBeforeRequest: { data: IMockRequest['webRequestBodyDetails'] }
  onBeforeSendHeaders: { data: IMockRequest['webRequestHeaderDetails'] }
  onRequestFinished: { data: IMockRequest['networkRequest'] }
}>()

// Debugger event emitter for WebSocket/SSE monitoring
type DebuggerEventCallback = (
  source: chrome.debugger.Debuggee,
  method: string,
  params?: object
) => void
const debuggerEventEmitter = new EventEmitter<{
  debuggerEvent: [chrome.debugger.Debuggee, string, object | undefined]
}>()
const debuggerEventListeners: DebuggerEventCallback[] = []

export const emitDebuggerEvent = (
  source: chrome.debugger.Debuggee,
  method: string,
  params?: object
) => {
  debuggerEventListeners.forEach((listener) => listener(source, method, params))
}

export const clearDebuggerListeners = () => {
  debuggerEventListeners.length = 0
}
const handleKeydown = (e: KeyboardEvent) => {
  if (e.code === 'Digit1') {
    mockRequests.forEach(async (request) => {
      eventEmitter.emit('onBeforeRequest', {
        data: request.webRequestBodyDetails,
      })
      await wait(100)
      eventEmitter.emit('onBeforeSendHeaders', {
        data: request.webRequestHeaderDetails,
      })
      await wait(100)
      eventEmitter.emit('onRequestFinished', { data: request.networkRequest })
    })
  }
}
window.addEventListener('keydown', handleKeydown)

const mockedChrome: DeepPartial<typeof chrome> = {
  devtools: {
    inspectedWindow: {
      tabId: 1,
    },
    panels: {
      themeName: 'dark',
    },
    network: {
      getHAR: (cb) => {
        cb({
          entries: mockRequests.map(
            (mockRequest) => mockRequest.networkRequest
          ),
        } as any)
      },
      onRequestFinished: {
        addListener: (cb) => {
          eventEmitter.on('onRequestFinished', (event) => {
            cb(event.data)
          })
        },
        removeListener: () => {
          eventEmitter.off('onRequestFinished')
        },
      },
      onNavigated: {
        addListener: () => {},
        removeListener: () => {},
      },
    },
  },
  webRequest: {
    onBeforeSendHeaders: {
      addListener: (cb) => {
        eventEmitter.on('onBeforeSendHeaders', (event) => {
          cb(event.data)
        })
      },
      removeListener: () => {
        eventEmitter.off('onBeforeSendHeaders')
      },
    },
    onBeforeRequest: {
      addListener: (cb) => {
        eventEmitter.on('onBeforeRequest', (event) => {
          cb(event.data)
        })
      },
      removeListener: () => {
        eventEmitter.off('onBeforeRequest')
      },
    },
  },
  runtime: {
    getPlatformInfo: ((cb) => {
      const platformInfo: chrome.runtime.PlatformInfo = {
        arch: 'x86-64',
        nacl_arch: 'x86-64',
        os: 'mac',
      }
      cb(platformInfo)
    }) as typeof chrome.runtime.getPlatformInfo,
    onMessage: {
      addListener: () => {},
      removeListener: () => {},
    },
  },
  storage: {
    local: {
      get: ((keys, cb) => {
        return cb({ ...mockStorage })
      }) as typeof chrome.storage.local.get,
      set: async (items: Record<string, any>) => {
        mockStorage = { ...mockStorage, ...items }
      },
    },
  },
  debugger: {
    attach: ((_target: chrome.debugger.Debuggee, _version: string, callback?: () => void) => {
      if (callback) callback()
      else return Promise.resolve()
    }) as typeof chrome.debugger.attach,
    detach: ((_target: chrome.debugger.Debuggee, callback?: () => void) => {
      if (callback) callback()
      else return Promise.resolve()
    }) as typeof chrome.debugger.detach,
    sendCommand: ((
      _target: chrome.debugger.Debuggee,
      _method: string,
      _commandParams?: object,
      callback?: (result?: object) => void
    ) => {
      if (callback) callback()
      else return Promise.resolve({})
    }) as typeof chrome.debugger.sendCommand,
    onEvent: {
      addListener: (callback: DebuggerEventCallback) => {
        debuggerEventListeners.push(callback)
      },
      removeListener: (callback: DebuggerEventCallback) => {
        const index = debuggerEventListeners.indexOf(callback)
        if (index > -1) {
          debuggerEventListeners.splice(index, 1)
        }
      },
    },
  },
}

const mockChrome = mockedChrome as typeof chrome

export { mockChrome }
