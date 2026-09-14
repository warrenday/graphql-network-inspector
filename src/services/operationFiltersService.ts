import { chromeProvider } from './chromeProvider'
import type { OperationType } from '../helpers/graphqlHelpers'

export type IOperationFilters = Record<OperationType, boolean>

const STORAGE_KEY = 'operationFilters'

const DEFAULT_FILTERS: IOperationFilters = {
  query: true,
  mutation: true,
  subscription: false,
  persisted: true,
}

export const getOperationFilters = (
  cb: (filters: IOperationFilters) => void
): void => {
  const chrome = chromeProvider()
  chrome.storage.local.get(STORAGE_KEY, (result) => {
    const stored = result[STORAGE_KEY] as Partial<IOperationFilters> | undefined
    cb({
      ...DEFAULT_FILTERS,
      ...(stored && typeof stored === 'object' ? stored : {}),
    })
  })
}

export const setOperationFilters = (filters: IOperationFilters): void => {
  const chrome = chromeProvider()
  chrome.storage.local.set({ [STORAGE_KEY]: filters })
}
