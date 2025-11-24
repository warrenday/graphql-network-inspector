import { render, screen, fireEvent } from '@testing-library/react'
import { LocalSearchInput } from './index'

describe('LocalSearchInput', () => {
  const mockProps = {
    searchQuery: '',
    onSearchChange: jest.fn(),
    matchCount: 0,
    currentIndex: 0,
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the search input', () => {
    render(<LocalSearchInput {...mockProps} />)

    const input = screen.getByTestId('local-search-input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'Find in response')
  })

  it('should display match counter when there are matches', () => {
    render(
      <LocalSearchInput
        {...mockProps}
        searchQuery="test"
        matchCount={5}
        currentIndex={2}
      />
    )

    expect(screen.getByText('3 of 5')).toBeInTheDocument()
  })

  it("should display 'No matches' when there are no matches", () => {
    render(
      <LocalSearchInput {...mockProps} searchQuery="test" matchCount={0} />
    )

    expect(screen.getByText('No matches')).toBeInTheDocument()
  })

  it('should call onSearchChange when input value changes', () => {
    render(<LocalSearchInput {...mockProps} />)

    const input = screen.getByTestId('local-search-input')
    fireEvent.change(input, { target: { value: 'new search' } })

    expect(mockProps.onSearchChange).toHaveBeenCalledWith('new search')
  })

  it('should call onNext when Enter key is pressed', () => {
    render(<LocalSearchInput {...mockProps} />)

    const input = screen.getByTestId('local-search-input')
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockProps.onNext).toHaveBeenCalledTimes(1)
  })

  it('should call onPrevious when Shift+Enter is pressed', () => {
    render(<LocalSearchInput {...mockProps} />)

    const input = screen.getByTestId('local-search-input')
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })

    expect(mockProps.onPrevious).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Escape key is pressed', () => {
    render(<LocalSearchInput {...mockProps} />)

    const input = screen.getByTestId('local-search-input')
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onNext when next button is clicked', () => {
    render(
      <LocalSearchInput {...mockProps} searchQuery="test" matchCount={3} />
    )

    const nextButton = screen.getByTestId('search-next')
    fireEvent.click(nextButton)

    expect(mockProps.onNext).toHaveBeenCalledTimes(1)
  })

  it('should call onPrevious when previous button is clicked', () => {
    render(
      <LocalSearchInput {...mockProps} searchQuery="test" matchCount={3} />
    )

    const prevButton = screen.getByTestId('search-previous')
    fireEvent.click(prevButton)

    expect(mockProps.onPrevious).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when close button is clicked', () => {
    render(<LocalSearchInput {...mockProps} />)

    const closeButton = screen.getByTestId('search-close')
    fireEvent.click(closeButton)

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should disable navigation buttons when there are no matches', () => {
    render(<LocalSearchInput {...mockProps} matchCount={0} />)

    const nextButton = screen.getByTestId('search-next')
    const prevButton = screen.getByTestId('search-previous')

    expect(nextButton).toBeDisabled()
    expect(prevButton).toBeDisabled()
  })

  it('should enable navigation buttons when there are matches', () => {
    render(
      <LocalSearchInput {...mockProps} searchQuery="test" matchCount={3} />
    )

    const nextButton = screen.getByTestId('search-next')
    const prevButton = screen.getByTestId('search-previous')

    expect(nextButton).not.toBeDisabled()
    expect(prevButton).not.toBeDisabled()
  })

  it('should update local value when searchQuery prop changes', () => {
    const { rerender } = render(<LocalSearchInput {...mockProps} />)

    const input = screen.getByTestId('local-search-input') as HTMLInputElement
    expect(input.value).toBe('')

    rerender(<LocalSearchInput {...mockProps} searchQuery="updated" />)
    expect(input.value).toBe('updated')
  })
})
