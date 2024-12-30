const VersionNumber = () => {
  return (
    <div className="fixed bottom-4 right-6 text-md text-gray-500 z-50">
      v{process.env.REACT_APP_VERSION || '0.0.0'}
    </div>
  )
}

export default VersionNumber
