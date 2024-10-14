import { chromeProvider } from './chromeProvider'

export interface IUserSettings {
  isPreserveLogsActive: boolean
  isInvertFilterActive: boolean
  isRegexActive: boolean
  filter: string
  websocketUrlFilter: string
  shouldShowFullWebsocketMessage: boolean
}

export const getUserSettings = (
  cb: (settings: Partial<IUserSettings>) => void
) => {
  const chrome = chromeProvider()
  chrome.storage.local.get('userSettings', (result) => {
    cb(result.userSettings || {})
  })
}

export const setUserSettings = (userSettings: Partial<IUserSettings>): void => {
  const chrome = chromeProvider()
  chrome.storage.local.set({ userSettings })
}
