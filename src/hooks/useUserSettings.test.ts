import { renderHook, act } from '@testing-library/react-hooks'
import useUserSettings from './useUserSettings'
import * as userSettingsService from '../services/userSettingsService'

// Mock the userSettingsService module
jest.mock('../services/userSettingsService')

const mockUserSettings = userSettingsService as jest.Mocked<
  typeof userSettingsService
>

describe('useUserSettings', () => {
  it('should initialize with default settings and allow updates', async () => {
    mockUserSettings.getUserSettings.mockImplementation((cb) => {
      cb({ isPreserveLogsActive: true })
    })

    const { result } = renderHook(() => useUserSettings())

    // Expect initial settings to be loaded into state
    expect(result.current[0]).toEqual({
      isPreserveLogsActive: true,
      isInvertFilterActive: false,
      isRegexActive: false,
      filter: '',
    })

    // Update the state
    act(() => {
      result.current[1]({
        isPreserveLogsActive: false,
        isInvertFilterActive: true,
      })
    })

    // Expect state to be updated
    expect(result.current[0]).toEqual({
      isPreserveLogsActive: false,
      isInvertFilterActive: true,
      isRegexActive: false,
      filter: '',
    })

    // Expect setUserSettings was called with the new settings
    expect(userSettingsService.setUserSettings).toHaveBeenCalledWith({
      isPreserveLogsActive: false,
      isInvertFilterActive: true,
      isRegexActive: false,
      filter: '',
    })
  })
})
