/**
 * ErrorMessage component - User-friendly error display
 */

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="bg-red-50 border border-red-300 rounded-lg p-6 text-center" role="alert" aria-live="polite">
      <p className="text-red-700 mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Retry the failed operation"
        >
          Retry
        </button>
      )}
    </div>
  );
};
