import React from 'react'
import { Button } from '../Button'

interface ErrorInfoProps {
  error: Error
  onReload: () => void
}

const GitHubIssueLink: React.FC<ErrorInfoProps> = (props) => {
  const { error, onReload } = props

  const title = encodeURIComponent(`Bug report: ${error.message}`)
  const body = encodeURIComponent(`I encountered an error: ${error.message}`)
  const githubUrl = `https://github.com/warrenday/graphql-network-inspector/issues/new?title=${title}&body=${body}`

  return (
    <div className="w-screen h-screen flex flex-col flex-1 items-center justify-center">
      <div className="p-6 flex flex-col text-center">
        <div>Something went wrong:</div>
        <div className="mt-2 mx-auto text-red-400 rounded-md w-fit">
          {error.message}
          {error.stack && <pre className="text-left mt-2">{error.stack}</pre>}
        </div>
        <div className="mt-12 mx-auto">
          <div className="max-w-[400px]">
            To help us debug the issue, please report on github and include any
            relevant stack traces or print screens.
          </div>
          <a href={githubUrl} target="_blank" rel="noopener noreferrer">
            <Button className="mt-4" variant="primary">
              Report issue on GitHub
            </Button>
          </a>
          <button
            className="underline pt-10 block text-center m-auto"
            onClick={onReload}
          >
            Reload app
          </button>
        </div>
      </div>
    </div>
  )
}

interface IErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component {
  state: IErrorBoundaryState = { hasError: false, error: null }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error)
    console.error('Error details:', errorInfo)
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <GitHubIssueLink
          error={this.state.error}
          onReload={() => {
            this.setState({ hasError: false, error: null })
          }}
        />
      )
    }

    // Normally, just render children
    return this.props.children
  }
}
