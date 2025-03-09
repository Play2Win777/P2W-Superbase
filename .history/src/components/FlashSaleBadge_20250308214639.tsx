// components/FlashSaleButton.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useStore } from '../store';
import { isFlashSaleEligible } from '../utils/gameHelpers';

export const FlashSaleButton: React.FC = () => {
  const { games } = useStore();
  const flashSaleCount = games.filter(game => isFlashSaleEligible(game)).length;
  
  if (flashSaleCount === 0) return null;
  
  return (
    <Link 
      to="/flash-sale" 
      className="inline-flex items-center bg-gradient-to-r from-red-600 to-orange-500 text-white px-3 py-2 rounded-lg hover:from-red-700 hover:to-orange-600 transition-colors"
    >
      <Zap size={16} className="mr-1" />
      <span>Flash Sale</span>
    </Link>
  );
};
