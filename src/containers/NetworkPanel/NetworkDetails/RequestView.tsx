import { AutoFormatToggleButton } from "@/components/AutoFormatToggleButton"
import { CodeView } from "@/components/CodeView"
import { CopyButton } from "@/components/CopyButton"
import { IGraphqlRequestBody } from "@/helpers/graphqlHelpers"
import * as safeJson from "@/helpers/safeJson"
import { Bar } from "@/components/Bar"
import { Panels, PanelSection } from "./PanelSection"
import { FC, ReactNode } from "react"

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

  return (
    <Panels>
      {requests.map((request) => {
        return (
          <SingleRequestView
            key={request.query}
            request={request}
            autoFormat={autoFormat}
          />
        )
      })}
    </Panels>
  )
}

type SingleRequestViewProps = {
  request: IGraphqlRequestBody
  autoFormat: boolean
}

const SingleRequestView = (props: SingleRequestViewProps) => {
  const { request, autoFormat } = props

  const displayQuery = !!request.query
  const displayVariables = isVariablesPopulated(request)
  const displayExtensions = isExtensionsPopulated(request)

  return (
    <PanelSection>
      <div className="flex flex-col gap-4">
        {displayQuery && (
          <RequestViewSection
            title="Query"
            actions={<CopyButton label="Copy" textToCopy={request.query} />}
          >
            <CodeView
              text={request.query}
              language={"graphql"}
              autoFormat={autoFormat}
            />
          </RequestViewSection>
        )}
        {displayVariables && (
          <RequestViewSection
            title="Variables"
            actions={
              <CopyButton
                label="Copy"
                textToCopy={safeJson.stringify(request.variables, undefined, 2)}
              />
            }
          >
            <CodeView
              text={safeJson.stringify(request.variables, undefined, 2)}
              language={"json"}
            />
          </RequestViewSection>
        )}
        {displayExtensions && (
          <RequestViewSection
            title="Extensions"
            actions={
              <CopyButton
                label="Copy"
                textToCopy={safeJson.stringify(
                  request.extensions,
                  undefined,
                  2
                )}
              />
            }
          >
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
  title: string
  actions: ReactNode
}

const RequestViewSection: FC<RequestViewSectionProps> = (props) => {
  const { title, actions, children } = props

  return (
    <div>
      <div className="flex justify-between items-center">
        <span className="font-bold mb-4">{title}</span>
        {actions}
      </div>
      <div className="bg-gray-200 dark:bg-gray-800 rounded-lg">{children}</div>
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
