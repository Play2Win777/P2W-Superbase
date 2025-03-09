import React, { useState, useRef, useEffect } from 'react';
import { Tag, ChevronDown } from 'lucide-react';
import { useStore } from '../store';

export const DiscountPopup: React.FC = () => {
  const { cart } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Count total items including quantities
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  let discountTier = "0%";
  let nextTier = "";
  let progress = 0;
  
  if (itemCount >= 5) {
    discountTier = "20%";
    progress = 100;
    nextTier = "Maximum discount achieved!";
  } else if (itemCount >= 3) {
    discountTier = "10%";
    nextTier = "Buy 2 more for 20% off!";
    progress = 60;
  } else if (itemCount >= 2) {
    discountTier = "5%";
    nextTier = "Buy 1 more for 10% off!";
    progress = 40;
  } else if (itemCount >= 1) {
    discountTier = "0%";
    nextTier = "Buy 1 more for 5% off!";
    progress = 20;
  } else {
    nextTier = "Buy your first game!";
  }
  
  // Close the popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative" ref={popupRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center text-white bg-purple-500 hover:bg-purple-600 px-3 py-2 rounded-lg transition-colors"
      >
        <Tag size={16} className="mr-1" />
        <span className="mr-1">Discount: {discountTier}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-64">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Volume Discount</h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
            <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{nextTier}</p>
          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            <p>• 2 games: 5% off</p>
            <p>• 3 games: 10% off</p>
            <p>• 5+ games: 20% off</p>
          </div>
        </div>
      )}
    </div>
  );
};