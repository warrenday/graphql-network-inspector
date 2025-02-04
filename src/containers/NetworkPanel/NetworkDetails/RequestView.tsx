import { FC } from 'react'
import { AutoFormatToggleButton } from '@/components/AutoFormatToggleButton'
import { CodeView } from '@/components/CodeView'
import { CopyButton } from '@/components/CopyButton'
import { IGraphqlRequestBody, OperationType } from '@/helpers/graphqlHelpers'
import * as safeJson from '@/helpers/safeJson'
import { Bar } from '@/components/Bar'
import { Panels, PanelSection } from '../PanelSection'
import {
  RequestViewSectionType,
  useRequestViewSections,
} from '@/hooks/useRequestViewSections'
import { CaretIcon } from '../../../components/Icons/CaretIcon'
import { ShareButton } from '../../../components/ShareButton'
import { ICompleteNetworkRequest } from '@/helpers/networkHelpers'
import { generateCurlCommand } from '@/helpers/curlHelpers'

const isVariablesPopulated = (variables: Record<string, unknown>) => {
  return Object.keys(variables || {}).length > 0
}

const isExtensionsPopulated = (request: IGraphqlRequestBody) => {
  return Object.keys(request.extensions || {}).length > 0
}

const getVariables = ({ variables, extensions }: IGraphqlRequestBody) => {
  if (variables && isVariablesPopulated(variables)) {
    return variables
  }

  if (
    extensions &&
    'variables' in extensions &&
    typeof extensions.variables == 'string'
  ) {
    try {
      return JSON.parse(atob(extensions.variables))
    } catch (e) {
      return null
    }
  }

  return null
}

const getOperationType = (query?: string): OperationType => {
  if (!query) return 'query' as OperationType
  if (query.trim().startsWith('mutation')) return 'mutation' as OperationType
  if (query.trim().startsWith('subscription')) return 'subscription' as OperationType
  return 'query' as OperationType
}

interface IRequestViewProps {
  autoFormat: boolean
  requests: IGraphqlRequestBody[]
  onShare?: () => void
}

export const RequestView = (props: IRequestViewProps) => {
  const { requests, autoFormat, onShare } = props

  const numberOfRequests = requests.length
  const shouldDisplayRequestIndex = numberOfRequests > 1

  return (
    <Panels>
      {requests.map((request, index) => {
        return (
          <SingleRequestView
            key={index}
            request={request}
            autoFormat={autoFormat}
            index={shouldDisplayRequestIndex && index + 1}
            numberOfRequests={numberOfRequests}
            onShare={onShare}
          />
        )
      })}
    </Panels>
  )
}

interface IRequestContainerProps {
  index: number
  totalRequests: number
  children: React.ReactNode
}

const RequestContainer = (props: IRequestContainerProps) => {
  const { totalRequests, index, children } = props

  if (totalRequests > 1) {
    return (
      <RequestViewSection
        type="request"
        index={index}
        title={`Request${index ? ` (${index}/${totalRequests})` : ''}`}
      >
        <div className="-mt-2">{children}</div>
      </RequestViewSection>
    )
  } else {
    return <>{children}</>
  }
}

interface ISingleRequestViewProps {
  request: IGraphqlRequestBody
  autoFormat: boolean
  index: number | false
  numberOfRequests: number
  onShare?: () => void
}

const SingleRequestView = (props: ISingleRequestViewProps) => {
  const { request, autoFormat, index, numberOfRequests, onShare } = props

  const requestIndex = index || 0
  const displayQuery = !!request.query
  const variables = getVariables(request)
  const displayVariables = isVariablesPopulated(variables)
  const displayExtensions = isExtensionsPopulated(request)

  // Convert IGraphqlRequestBody to ICompleteNetworkRequest for cURL generation
  const networkRequest: ICompleteNetworkRequest = {
    id: requestIndex.toString(),
    url: window.location.origin + '/graphql',
    status: 200,
    time: 0,
    method: 'POST',
    request: {
      headers: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Accept', value: 'application/json' }
      ],
      body: [{
        query: request.query,
        variables: variables || undefined,
        operationName: request.operationName,
        extensions: request.extensions
      }],
      primaryOperation: {
        operationName: request.operationName ?? '',
        operation: getOperationType(request.query),
      },
      headersSize: 0,
      bodySize: 0
    },
    response: {
      headers: [],
      body: '',
      bodySize: 0,
      headersSize: 0
    },
    native: {
      webRequest: {} as chrome.webRequest.WebRequestBodyDetails,
      networkRequest: undefined
    },
  }

  return (
    <PanelSection className="relative mb-3">
      <div className="flex items-center gap-2 absolute top-[8px] right-[8px] z-10 transition-opacity">
        {onShare && <ShareButton onClick={onShare} />}
        {displayQuery && (
          <>
            <CopyButton label="Copy Query" textToCopy={request.query || ''} />
            <CopyButton 
              label="Copy as cURL"
              textToCopy={generateCurlCommand(networkRequest)}
            />
          </>
        )}
        {displayVariables && (
          <CopyButton
            label="Copy Vars"
            textToCopy={safeJson.stringify(variables, undefined, 2)}
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
        <RequestContainer index={requestIndex} totalRequests={numberOfRequests}>
          {displayQuery && (
            <RequestViewSection
              type="query"
              title={'Query'}
              index={requestIndex}
              level={1}
            >
              <CodeView
                text={request.query || ''}
                language={'graphql'}
                autoFormat={autoFormat}
                className="px-6"
              />
            </RequestViewSection>
          )}
          {displayVariables && (
            <RequestViewSection
              type="variables"
              title="Variables"
              index={requestIndex}
              level={1}
            >
              <CodeView
                text={safeJson.stringify(variables, undefined, 2)}
                language={'json'}
                className="px-6"
              />
            </RequestViewSection>
          )}
          {displayExtensions && (
            <RequestViewSection
              type="extensions"
              title="Extensions"
              index={requestIndex}
              level={1}
            >
              <CodeView
                text={safeJson.stringify(request.extensions, undefined, 2)}
                language={'json'}
                autoFormat={autoFormat}
                className="px-6"
              />
            </RequestViewSection>
          )}
        </RequestContainer>
      </div>
    </PanelSection>
  )
}

interface IRequestViewSectionProps {
  type: RequestViewSectionType
  title: string
  index: number
  level?: number
}

const RequestViewSection: FC<IRequestViewSectionProps> = (props) => {
  const { type, title, index, children, level } = props
  const { collapsedSections, setIsSectionCollapsed } = useRequestViewSections()
  const keyForMap = `${type}-${index}`

  const isCollapsed = !!collapsedSections[keyForMap]

  const handleToggleView = () => {
    setIsSectionCollapsed(keyForMap, !collapsedSections[keyForMap])
  }
  const classNameForLevel = `ml-${(level ?? 0) * 4}`

  return (
    <div className={classNameForLevel}>
      <button
        className="select-none w-full px-4 py-3 outline-[#2f80ed]"
        onClick={handleToggleView}
      >
        <div className="flex justify-be align-center tween items-center gap-2 text-gray-400">
          <CaretIcon className={'w-2.5 ' + (isCollapsed ? '' : 'rotate-90')} />
          <span>{title}</span>
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
