import { Button } from "@/components/Button"
import { OperationType } from "@/helpers/graphqlHelpers"
import { QuickFilters } from "../"
import { Bar } from "../../../components/Bar"

export type QuickFiltersContainerProps = {
  quickFilters: QuickFilters
  onQuickFilterButtonClicked: (filter: OperationType) => void
}

export const QuickFiltersContainer = (props: QuickFiltersContainerProps) => {
  const { quickFilters, onQuickFilterButtonClicked } = props

  return (
    <Bar className="border-t">
      <div className="flex gap-2">
        <Button
          variant={quickFilters.query ? "primary" : "ghost"}
          onClick={() => onQuickFilterButtonClicked("query")}
        >
          Queries
        </Button>
        <Button
          variant={quickFilters.mutation ? "primary" : "ghost"}
          onClick={() => onQuickFilterButtonClicked("mutation")}
        >
          Mutations
        </Button>
      </div>
    </Bar>
  )
}
