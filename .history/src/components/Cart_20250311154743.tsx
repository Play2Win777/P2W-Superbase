import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, X, Zap, AlertCircle, Info } from 'lucide-react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

export const Cart: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFlashSaleInfo, setShowFlashSaleInfo] = useState(false);
  const flashSaleInfoRef = useRef<HTMLDivElement>(null);
  const { cart, removeFromCart, updateCartQuantity, getCartTotal } = useStore();
  const navigate = useNavigate();

  // Get cart totals including flash sale discounts
  const { 
    subtotal, 
    flashSaleDiscount, 
    volumeDiscount, 
    bundleDiscount, // Add this line
    flashSaleActive,
    flashSaleEligibleCount, 
    total 
  } = getCartTotal();

  // Calculate the volume discount percentage (for display only)
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  let discountPercent = 0;
  if (totalItems >= 5) {
    discountPercent = 20;
  } else if (totalItems >= 3) {
    discountPercent = 10;
  } else if (totalItems >= 2) {
    discountPercent = 5;
  }

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  // Navigate to game details page
  const goToGameDetails = (gameId: string | number) => {
    setIsOpen(false); // Close cart when navigating
    navigate(`/game/${gameId}`);
  };

  // Close the flash sale info popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (flashSaleInfoRef.current && !flashSaleInfoRef.current.contains(event.target as Node)) {
        setShowFlashSaleInfo(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Flash Sale Info component
  const FlashSaleInfo = () => (
    <div className="relative">
      <button
        onClick={() => setShowFlashSaleInfo(!showFlashSaleInfo)}
        className="inline-flex items-center text-xs text-gray-600 hover:text-orange-500 ml-1"
      >
        <Info size={14} />
      </button>
      
      {showFlashSaleInfo && (
        <div 
          ref={flashSaleInfoRef}
          className="absolute z-50 bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 text-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="font-semibold flex items-center text-orange-600 mb-1">
            <Zap size={14} className="mr-1" />
            Flash Sale Discount
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Add 3 or more flash sale items to your cart to unlock a 25% discount on these qualifying items.
          </p>
          <div className="absolute w-3 h-3 bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 transform rotate-45 -bottom-1.5 left-3"></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-colors relative"
      >
        <ShoppingCart size={24} />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold dark:text-white">Shopping Cart</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {cart.map((item) => (
              <div
                key={item.id}
                className="p-4 border-b dark:border-gray-700 flex items-center gap-4"
              >
                {/* Clickable image */}
                <img
                  src={item.image_url_medium}
                  alt={item.Game_Title}
                  className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToGameDetails(item.id);
                  }}
                />
                <div className="flex-1">
                  {/* Clickable title */}
                  <h4 
                    className="font-semibold dark:text-white hover:text-purple-500 dark:hover:text-purple-400 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToGameDetails(item.id);
                    }}
                  >
                    {item.Game_Title}
                    {item.isFlashSaleEligible && (
                      <span 
                        className={`ml-2 inline-flex items-center text-xs ${flashSaleActive ? 'bg-gradient-to-r from-red-600 to-orange-500' : 'bg-gray-500'} text-white px-1.5 py-0.5 rounded cursor-help`}
                        title="Add 3 or more flash sale items to unlock a 25% discount"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Zap size={10} className="mr-0.5" />
                        Flash Sale
                      </span>
                    )}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    ${item.Price_to_Sell_For}
                    {item.isFlashSaleEligible && flashSaleActive && (
                      <span className="text-red-500 ml-1">-25%</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCartQuantity(item.id, Math.max(1, item.quantity - 1));
                      }}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:text-white rounded"
                    >
                      -
                    </button>
                    <span className="dark:text-white">{item.quantity}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCartQuantity(item.id, item.quantity + 1);
                      }}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:text-white rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCart(item.id);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t dark:border-gray-700">
            {/* Always show subtotal */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
              <span className="dark:text-white">${subtotal.toFixed(2)}</span>
            </div>
            
            {/* Show flash sale eligibility message */}
            {flashSaleEligibleCount > 0 && flashSaleEligibleCount < 3 && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                <AlertCircle size={14} className="mr-1" />
                Add {3 - flashSaleEligibleCount} more flash sale items for 25% off
                <FlashSaleInfo />
              </div>
            )}
            
            {/* Show flash sale discount if applicable */}
            {flashSaleDiscount > 0 && (
              <div className="flex justify-between items-center mb-2 text-orange-600">
                <span className="flex items-center">
                  <Zap size={14} className="mr-1" />
                  Flash Sale Discount (25%):
                  <FlashSaleInfo />
                </span>
                <span>-${flashSaleDiscount.toFixed(2)}</span>
              </div>
            )}

            {/* Show bundle discount if applicable */}
            {bundleDiscount > 0 && (
              <div className="flex justify-between items-center mb-2 text-blue-600">
                <span className="flex items-center">
                  <Zap size={14} className="mr-1" />
                  Bundle Discount (15%):
                </span>
                <span>-${bundleDiscount.toFixed(2)}</span>
              </div>
            )}
            
            {/* Show volume discount if applicable */}
            {volumeDiscount > 0 && (
              <div className="flex justify-between items-center mb-2 text-green-600">
                <span>Volume Discount ({discountPercent}%):</span>
                <span>-${volumeDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold dark:text-white">Total:</span>
              <span className="text-xl font-bold dark:text-white">${total.toFixed(2)}</span>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Send Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};