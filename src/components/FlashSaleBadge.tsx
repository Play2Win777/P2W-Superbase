// components/FlashSaleBadge.tsx
import React from 'react';
import { Zap } from 'lucide-react';

export const FlashSaleBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`absolute top-2 right-2 z-10 ${className}`}>
      <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
        <Zap size={12} className="animate-bounce" />
        Flash Sale
      </span>
    </div>
  );
};
