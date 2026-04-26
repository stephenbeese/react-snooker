/**
 * API Status Notification Component
 * Shows a warning when using mock data due to API issues
 */

import React, { useState, useEffect } from 'react';

interface ApiStatusNotificationProps {
  show: boolean;
  onDismiss?: () => void;
}

export const ApiStatusNotification: React.FC<ApiStatusNotificationProps> = ({
  show,
  onDismiss,
}) => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Reset dismissed state when show prop changes
    if (show) {
      setDismissed(false);
    }
  }, [show]);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (!show || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Using Mock Data
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                The snooker.org API is currently unavailable (403 error). 
                We're showing sample data for development purposes.
              </p>
              <p className="mt-1">
                <strong>To fix:</strong> Request a new API key by emailing{' '}
                <a
                  href="mailto:webmaster@snooker.org"
                  className="underline hover:text-yellow-900"
                >
                  webmaster@snooker.org
                </a>
              </p>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              className="inline-flex text-yellow-400 hover:text-yellow-600 focus:outline-none focus:text-yellow-600"
              onClick={handleDismiss}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiStatusNotification;