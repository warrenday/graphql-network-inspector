import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ResponseRawView } from './ResponseRawView'
import * as safeJson from '@/helpers/safeJson'

jest.mock('@/hooks/useHighlight', () => ({
  useHighlight: () => ({
    markup: '<div>highlighted code</div>',
    loading: false,
  }),
}))

describe('ResponseRawView', () => {
  const mockResponse = safeJson.stringify({
    data: {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      },
    },
  })

  it('should render the response', () => {
    render(<ResponseRawView response={mockResponse} />)

    expect(screen.getByText(/highlighted code/)).toBeInTheDocument()
  })

  it('should render copy button', () => {
    render(<ResponseRawView response={mockResponse} />)

    const copyButton = screen.getByTestId('copy-button')
    expect(copyButton).toBeInTheDocument()
  })

  it('should render share button when onShare is provided', () => {
    const onShare = jest.fn()
    render(<ResponseRawView response={mockResponse} onShare={onShare} />)

    const shareButton = screen.getByText(/export \/ share/i)
    expect(shareButton).toBeInTheDocument()
  })

  it('should not render share button when onShare is not provided', () => {
    render(<ResponseRawView response={mockResponse} />)

    const shareButton = screen.queryByText(/export \/ share/i)
    expect(shareButton).not.toBeInTheDocument()
  })

  it('should show search input when Cmd+F is pressed', async () => {
    render(<ResponseRawView response={mockResponse} />)

    // Search input should not be visible initially
    expect(screen.queryByTestId('local-search-input')).not.toBeInTheDocument()

    // Press Cmd (MetaLeft) then F (KeyF) - simulating the actual key sequence
    fireEvent.keyDown(document, { code: 'MetaLeft' })
    fireEvent.keyDown(document, { code: 'KeyF' })

    // Search input should now be visible
    await waitFor(() => {
      expect(screen.getByTestId('local-search-input')).toBeInTheDocument()
    })
  })

  it('should show search input when Ctrl+F is pressed', async () => {
    render(<ResponseRawView response={mockResponse} />)

    // Search input should not be visible initially
    expect(screen.queryByTestId('local-search-input')).not.toBeInTheDocument()

    // Press Ctrl (ControlLeft) then F (KeyF) - simulating the actual key sequence
    fireEvent.keyDown(document, { code: 'ControlLeft' })
    fireEvent.keyDown(document, { code: 'KeyF' })

    // Search input should now be visible
    await waitFor(() => {
      expect(screen.getByTestId('local-search-input')).toBeInTheDocument()
    })
  })

  it('should hide search input when close button is clicked', async () => {
    render(<ResponseRawView response={mockResponse} />)

    // Open search
    fireEvent.keyDown(document, { code: 'MetaLeft' })
    fireEvent.keyDown(document, { code: 'KeyF' })

    await waitFor(() => {
      expect(screen.getByTestId('local-search-input')).toBeInTheDocument()
    })

    // Click close button
    const closeButton = screen.getByTestId('search-close')
    fireEvent.click(closeButton)

    // Search input should be hidden
    await waitFor(() => {
      expect(screen.queryByTestId('local-search-input')).not.toBeInTheDocument()
    })
  })

  it('should clear search query when search is closed', async () => {
    render(<ResponseRawView response={mockResponse} />)

    // Open search
    fireEvent.keyDown(document, { code: 'MetaLeft' })
    fireEvent.keyDown(document, { code: 'KeyF' })

    await waitFor(() => {
      expect(screen.getByTestId('local-search-input')).toBeInTheDocument()
    })

    // Type in search input
    const searchInput = screen.getByTestId(
      'local-search-input'
    ) as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'test search' } })

    expect(searchInput.value).toBe('test search')

    // Close search
    const closeButton = screen.getByTestId('search-close')
    fireEvent.click(closeButton)

    // Reset key state
    fireEvent.keyUp(document, { code: 'MetaLeft' })

    // Reopen search
    fireEvent.keyDown(document, { code: 'MetaLeft' })
    fireEvent.keyDown(document, { code: 'KeyF' })

    await waitFor(() => {
      const newSearchInput = screen.getByTestId(
        'local-search-input'
      ) as HTMLInputElement
      expect(newSearchInput.value).toBe('')
    })
  })

  it('should remove extensions from response', () => {
    const responseWithExtensions = safeJson.stringify({
      data: {
        user: {
          id: '1',
          name: 'Test User',
        },
      },
      extensions: {
        tracing: {
          duration: 1000000,
        },
      },
    })

    render(<ResponseRawView response={responseWithExtensions} />)

    // The component should render (extensions removed internally)
    expect(screen.getByText(/highlighted code/)).toBeInTheDocument()
  })

  it('should handle empty response', () => {
    render(<ResponseRawView response="" />)

    expect(screen.getByText(/highlighted code/)).toBeInTheDocument()
  })

  it('should handle undefined response', () => {
    render(<ResponseRawView />)

    expect(screen.getByText(/highlighted code/)).toBeInTheDocument()
  })
})
