interface LoadingScreenProps {
  message?: string
  subMessage?: string
}

const LoadingScreen = ({
  message = "Loading Data",
  subMessage = "Please wait while we fetch your data..."
}: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 bg-primary/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated Circle */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-highlights/30 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-highlights rounded-full animate-spin"></div>
          </div>
          {/* Inner pulsing dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-highlights rounded-full animate-pulse"></div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">{message}</h3>
          <p className="text-gray-300 text-sm">{subMessage}</p>
        </div>
        
        {/* Animated dots */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-highlights rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-highlights rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-highlights rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen