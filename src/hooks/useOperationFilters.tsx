import { createContext, useContext, useState } from "react"
import { OperationType } from "../helpers/graphqlHelpers"

export type IOperationFilters = Record<OperationType, boolean>

interface IOperationFilterContext {
  operationFilters: IOperationFilters
  setOperationFilters: React.Dispatch<React.SetStateAction<IOperationFilters>>
}

const OperationFilersContext = createContext<IOperationFilterContext>(null!)

export const OperationFiltersProvider: React.FC<{}> = ({ children }) => {
  const [operationFilters, setOperationFilters] = useState<IOperationFilters>({
    query: true,
    mutation: true,
    subscription: false,
    persisted: true,
  })

  return (
    <OperationFilersContext.Provider
      value={{ operationFilters, setOperationFilters }}
    >
      {children}
    </OperationFilersContext.Provider>
  )
}

export const useOperationFilters = () => {
  const context = useContext(OperationFilersContext)

  if (!context) {
    throw new Error(
      "useOperationFilters must be used within a OperationFiltersProvider"
    )
  }

  return context
}
