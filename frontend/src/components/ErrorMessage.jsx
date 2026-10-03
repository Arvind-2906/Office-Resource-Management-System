import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export const ErrorMessage = ({ message, onRetry, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800 flex items-start gap-3 backdrop-blur-sm shadow-sm ${className}`}
    >
      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-rose-900">Action Required</h4>
        <p className="text-sm mt-0.5 text-rose-700">{message}</p>
        {onRetry && (
          <div className="mt-3">
            <Button
              variant="danger"
              size="sm"
              onClick={onRetry}
              icon={RefreshCw}
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
