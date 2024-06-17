import { DeepPartial } from 'utility-types'
import EventEmitter from 'eventemitter3'
import { IMockRequest, mockRequests } from '../mocks/mock-requests'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Configure an event to add more mock requests
const eventEmitter = new EventEmitter<{
  onBeforeRequest: { data: IMockRequest['webRequestBodyDetails'] }
  onBeforeSendHeaders: { data: IMockRequest['webRequestHeaderDetails'] }
  onRequestFinished: { data: IMockRequest['networkRequest'] }
}>()
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
}

const mockChrome = mockedChrome as typeof chrome

export { mockChrome }
