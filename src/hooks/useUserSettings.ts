import { useEffect, useState } from 'react'
import {
  getUserSettings,
  IUserSettings,
  setUserSettings,
} from '../services/userSettingsService'

const useUserSettings = () => {
  const [settings, setSettings] = useState<IUserSettings>({
    isPreserveLogsActive: false,
    isInvertFilterActive: false,
    isRegexActive: false,
    filter: '',
    websocketUrlFilter: '',
    shouldShowFullWebsocketMessage: true,
  })

  // Load initial settings on component mount
  useEffect(() => {
    getUserSettings((userSettings) => {
      setSettings((prevSettings) => {
        return { ...prevSettings, ...userSettings }
      })
    })
  }, [])

  const setSettingsProxy = (newSettings: Partial<IUserSettings>) => {
    setUserSettings({ ...settings, ...newSettings })
    setSettings({ ...settings, ...newSettings })
  }

  return [settings, setSettingsProxy] as const
}

export default useUserSettings
