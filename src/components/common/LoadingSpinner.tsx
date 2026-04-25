/**
 * LoadingSpinner component - Consistent loading indicator
 */

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner = ({ message = 'Loading...' }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4" role="status" aria-live="polite">
      <div 
        className="w-10 h-10 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"
        aria-hidden="true"
      ></div>
      <p className="text-gray-600 text-base" aria-label={`Loading status: ${message}`}>
        {message}
      </p>
    </div>
  );
};
