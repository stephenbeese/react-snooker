/**
 * ErrorMessage component - User-friendly error display
 */

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="error-message">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry}>Retry</button>
      )}
    </div>
  );
};
