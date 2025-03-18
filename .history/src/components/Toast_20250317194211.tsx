// src/components/Toast.tsx
import React from 'react';

interface ToastProps {
  message: string;
  action: string;
  onAction: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, action, onAction }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg flex items-center justify-between">
      <p>{message}</p>
      <button
        onClick={onAction}
        className="ml-4 bg-green-700 hover:bg-green-800 px-4 py-2 rounded-md"
      >
        {action}
      </button>
    </div>
  );
};