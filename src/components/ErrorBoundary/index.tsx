import React from "react"
import { Button } from "../Button"

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
        <div className="mt-2">{error.message}</div>
        <a href={githubUrl} target="_blank" rel="noopener noreferrer">
          <Button className="mt-4" variant="primary">
            Report issue on GitHub
          </Button>
        </a>
        <button
          className="underline pt-10 block text-center"
          onClick={onReload}
        >
          Reload app
        </button>
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
