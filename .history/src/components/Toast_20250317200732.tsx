// src/components/Toast.tsx
import React from 'react';

interface ToastProps {
  message: string;
  action?: string;
  onAction?: () => void;
  discountInfo?: string;
}

export const Toast: React.FC<ToastProps> = ({ message, action, onAction, discountInfo }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg flex flex-col items-start justify-between min-w-[300px]">
      <p>{message}</p>
      {discountInfo && (
        <p className="text-sm mt-2 bg-green-600/50 px-2 py-1 rounded">
          {discountInfo}
        </p>
      )}
      {action && onAction && (
        <button
          onClick={onAction}
          className="ml-4 bg-green-700 hover:bg-green-800 px-4 py-2 rounded-md"
        >
          {action}
        </button>
      )}
    </div>
  );
};