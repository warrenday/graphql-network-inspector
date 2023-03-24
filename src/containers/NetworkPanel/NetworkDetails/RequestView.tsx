import { AutoFormatToggleButton } from "@/components/AutoFormatToggleButton"
import { CodeView } from "@/components/CodeView"
import { CopyButton } from "@/components/CopyButton"
import { IGraphqlRequestBody } from "@/helpers/graphqlHelpers"
import * as safeJson from "@/helpers/safeJson"
import { Bar } from "@/components/Bar"
import { Panels, PanelSection } from "./PanelSection"
import { FC } from "react"
import {
  RequestViewSectionType,
  useRequestViewSections,
} from "@/hooks/useRequestViewSections"
import { CaretIcon } from "../../../components/Icons/CaretIcon"

const isVariablesPopulated = (request: IGraphqlRequestBody) => {
  return Object.keys(request.variables || {}).length > 0
}

const isExtensionsPopulated = (request: IGraphqlRequestBody) => {
  return Object.keys(request.extensions || {}).length > 0
}

interface IRequestViewProps {
  autoFormat: boolean
  requests: IGraphqlRequestBody[]
}

export const RequestView = (props: IRequestViewProps) => {
  const { requests, autoFormat } = props

  const numberOfRequests = requests.length
  const shouldDisplayRequestIndex = numberOfRequests > 1

  return (
    <Panels>
      {requests.map((request, index) => {
        return (
          <SingleRequestView
            key={request.query}
            request={request}
            autoFormat={autoFormat}
            index={shouldDisplayRequestIndex && index + 1}
            numberOfRequests={numberOfRequests}
          />
        )
      })}
    </Panels>
  )
}

type SingleRequestViewProps = {
  request: IGraphqlRequestBody
  autoFormat: boolean
  index: number | false
  numberOfRequests: number
}

const SingleRequestView = (props: SingleRequestViewProps) => {
  const { request, autoFormat, index, numberOfRequests } = props

  const displayQuery = !!request.query
  const displayVariables = isVariablesPopulated(request)
  const displayExtensions = isExtensionsPopulated(request)

  return (
    <PanelSection className="relative">
      <div className="flex items-center gap-2 absolute top-[3px] right-[3px] z-10 transition-opacity">
        {displayQuery && (
          <CopyButton label="Copy Query" textToCopy={request.query} />
        )}
        {displayVariables && (
          <CopyButton
            label="Copy Vars"
            textToCopy={safeJson.stringify(request.variables, undefined, 2)}
          />
        )}
        {displayExtensions && (
          <CopyButton
            label="Copy Extensions"
            textToCopy={safeJson.stringify(request.extensions, undefined, 2)}
          />
        )}
      </div>

      <div className="flex flex-col">
        {displayQuery && (
          <RequestViewSection
            type="query"
            title={"Query" + (index ? ` (${index}/${numberOfRequests})` : "")}
          >
            <CodeView
              text={request.query}
              language={"graphql"}
              autoFormat={autoFormat}
            />
          </RequestViewSection>
        )}
        {displayVariables && (
          <RequestViewSection type="variables" title="Variables">
            <CodeView
              text={safeJson.stringify(request.variables, undefined, 2)}
              language={"json"}
            />
          </RequestViewSection>
        )}
        {displayExtensions && (
          <RequestViewSection type="extensions" title="Extensions">
            <CodeView
              text={safeJson.stringify(request.extensions, undefined, 2)}
              language={"json"}
              autoFormat={autoFormat}
            />
          </RequestViewSection>
        )}
      </div>
    </PanelSection>
  )
}

type RequestViewSectionProps = {
  type: RequestViewSectionType
  title: string
}

const RequestViewSection: FC<RequestViewSectionProps> = (props) => {
  const { type, title, children } = props
  const { collapsedSections, setIsSectionCollapsed } = useRequestViewSections()

  const handleToggleView = () => {
    setIsSectionCollapsed(type, !collapsedSections[type])
  }

  const isCollapsed = !!collapsedSections[type]

  return (
    <div>
      <button
        className="select-none w-full px-3 py-1.5 bg-[#333] border-b-[#666] outline-[#2f80ed]"
        onClick={handleToggleView}
      >
        <div className="flex justify-be align-center tween items-center gap-2">
          <CaretIcon className={"w-2.5 " + (isCollapsed ? "" : "rotate-90")} />
          <span className="font-bold">{title}</span>
        </div>
      </button>
      {!isCollapsed && <div className="rounded-lg">{children}</div>}
    </div>
  )
}

interface IRequestViewFooterProps {
  autoFormat: boolean
  toggleAutoFormat: React.DispatchWithoutAction
}

export const RequestViewFooter = (props: IRequestViewFooterProps) => {
  const { autoFormat, toggleAutoFormat } = props

  return (
    <Bar className="mt-auto absolute border-t">
      <AutoFormatToggleButton active={autoFormat} onToggle={toggleAutoFormat} />
    </Bar>
  )
}
