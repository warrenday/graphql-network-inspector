import { Button } from "@/components/Button"
import { OperationType } from "@/helpers/graphqlHelpers"
import cx from "classnames"
import { QuickFilters } from ".."

export type QuickFiltersContainerProps = {
  quickFilters: QuickFilters
  onQuickFilterButtonClicked: (filter: OperationType) => void
}

export const QuickFiltersContainer = (props: QuickFiltersContainerProps) => {
  const { quickFilters, onQuickFilterButtonClicked } = props

  return (
    <div className="bg-gray-200 dark:bg-gray-800 p-1.5 max-w-full">
      <div className="flex gap-2">
        <Button
          onClick={() => onQuickFilterButtonClicked("query")}
          className={cx(
            "p-1 px-2.5",
            quickFilters["query"] &&
              "bg-green-400 hover:bg-green-300 !text-gray-800"
          )}
        >
          Queries
        </Button>
        <Button
          onClick={() => onQuickFilterButtonClicked("mutation")}
          className={cx(
            "p-1 px-2.5",
            quickFilters["mutation"] &&
              "bg-indigo-400 hover:bg-indigo-300 !text-gray-800"
          )}
        >
          Mutations
        </Button>
      </div>
    </div>
  )
}
