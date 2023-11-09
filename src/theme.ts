import { OperationType } from "./helpers/graphqlHelpers"

const operationColors: Record<OperationType, { text: string; bg: string }> = {
  query: {
    text: "text-green-400",
    bg: "bg-green-400",
  },
  mutation: {
    text: "text-indigo-400",
    bg: "bg-indigo-400",
  },
  subscription: {
    text: "text-blue-400",
    bg: "bg-blue-400",
  },
  persisted: {
    text: "text-yellow-400",
    bg: "bg-yellow-400",
  },
}

const theme = {
  operationColors,
}

export default theme
