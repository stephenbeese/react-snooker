/**
 * LoadingSpinner component - Consistent loading indicator
 */

export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
      <p className="text-gray-600 text-base">Loading...</p>
    </div>
  );
};
