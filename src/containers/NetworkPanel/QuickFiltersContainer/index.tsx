import { Button } from "@/components/Button"
import { OperationType } from "@/helpers/graphqlHelpers"
import { Bar } from "../../../components/Bar"
import theme from "../../../theme"
import { useOperationFilters } from "../../../hooks/useOperationFilters"

interface IPillProps {
  className: string
}

const Pill = (props: IPillProps) => {
  const { className } = props
  return <div className={`h-3 w-3 rounded-full ${className}`} />
}

interface IQuickFilterButtonProps {
  variant: "primary" | "ghost"
  onClick: () => void
  active: boolean
  activeColor: string
  children: React.ReactNode
}

const QuickFilterButton = (props: IQuickFilterButtonProps) => {
  const { children, variant, onClick, active, activeColor } = props

  return (
    <Button
      variant={variant}
      onClick={onClick}
      icon={<Pill className={active ? activeColor : "bg-gray-400"} />}
      className="whitespace-nowrap"
    >
      {children}
    </Button>
  )
}

export const QuickFiltersContainer = () => {
  const { operationFilters, setOperationFilters } = useOperationFilters()

  const handleQuickFilterToggle = (operationType: OperationType) => {
    setOperationFilters((prevState) => {
      return {
        ...prevState,
        [operationType]: !prevState[operationType],
      }
    })
  }

  return (
    <Bar className="border-t pb-3">
      <div className="flex gap-2">
        <QuickFilterButton
          variant={operationFilters.query ? "primary" : "ghost"}
          onClick={() => handleQuickFilterToggle("query")}
          active={operationFilters.query}
          activeColor={theme.operationColors.query.bg}
        >
          Queries
        </QuickFilterButton>
        <QuickFilterButton
          variant={operationFilters.mutation ? "primary" : "ghost"}
          onClick={() => handleQuickFilterToggle("mutation")}
          active={operationFilters.mutation}
          activeColor={theme.operationColors.mutation.bg}
        >
          Mutations
        </QuickFilterButton>
        <QuickFilterButton
          variant={operationFilters.persisted ? "primary" : "ghost"}
          onClick={() => handleQuickFilterToggle("persisted")}
          active={operationFilters.persisted}
          activeColor={theme.operationColors.persisted.bg}
        >
          Persisted
        </QuickFilterButton>
        <QuickFilterButton
          variant={operationFilters.subscription ? "primary" : "ghost"}
          onClick={() => handleQuickFilterToggle("subscription")}
          active={operationFilters.subscription}
          activeColor={theme.operationColors.subscription.bg}
        >
          Subscriptions (Beta)
        </QuickFilterButton>
      </div>
    </Bar>
  )
}
