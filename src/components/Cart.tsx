import React from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom'; // ADD THIS IMPORT

export const Cart: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { cart, removeFromCart, updateCartQuantity } = useStore();
  const navigate = useNavigate(); // ADD THIS

  const total = cart.reduce(
    (sum, item) => sum + item.Price_to_Sell_For * item.quantity,
    0
  );
// ADD THIS FUNCTION
const handleCheckout = () => {
  setIsOpen(false); // Close the cart dropdown
  navigate('/checkout'); // Navigate to checkout page
};
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-colors relative"
      >
        <ShoppingCart size={24} />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cart.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Shopping Cart</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {cart.map((item) => (
              <div
                key={item.id}
                className="p-4 border-b flex items-center gap-4"
              >
                <img
                  src={item.image_url_medium}
                  alt={item.Game_Title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{item.Game_Title}</h4>
                  <p className="text-gray-600">
                    ${item.Price_to_Sell_For}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                      className="px-2 py-1 bg-gray-100 rounded"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, item.quantity + 1)
                      }
                      className="px-2 py-1 bg-gray-100 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-bold">${total.toFixed(2)}</span>
            </div>
            {/* REPLACE THIS BUTTON */}
            <button
              onClick={handleCheckout} // Changed from alert to navigate
              className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
