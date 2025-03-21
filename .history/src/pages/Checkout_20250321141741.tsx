import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { MessageCircle, CreditCard, ArrowLeft, Zap, Info, Truck, X, Sparkles, Check } from 'lucide-react';
import { useExchangeRate } from '../context/ExchangeRateContext'; // Import the hook

export const Checkout: React.FC = () => {
  const { exchangeRate } = useExchangeRate(); // Use the exchange rate
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, getCartTotal, games, clearCart } = useStore();
  const [orderComplete, setOrderComplete] = useState(false);
  const [showFlashSaleInfo, setShowFlashSaleInfo] = useState(false);
  const [isWhatsAppClicked, setIsWhatsAppClicked] = useState(false);
  const [isCreditCardClicked, setIsCreditCardClicked] = useState(false);

  // Customer information state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');

  // Get cart totals including flash sale discounts
  const { 
    subtotal, 
    flashSaleDiscount, 
    bundleDiscount, 
    volumeDiscount, 
    flashSaleActive,
    flashSaleEligibleCount, 
    total 
  } = getCartTotal();

  // Calculate SRD price for the total
  const calculateSrdPrice = (usdPrice: number): number | null => {
    if (!exchangeRate) return null;
    return Math.round((usdPrice * exchangeRate) / 5) * 5; // Round to nearest 5 SRD
  };

  const srdTotal = calculateSrdPrice(total);

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

  // Calculate shipping cost
  const freeShippingThreshold = 60;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : 4.99;
  const finalTotal = total + shippingCost;

  // Get the platform of the first game in the cart
  const firstGamePlatform = cart.length > 0 ? cart[0].Platform : null;

  // Filter games from the same platform as the first game in the cart
  const recommendedGames = firstGamePlatform
    ? games.filter(
        (game) =>
          game.Platform === firstGamePlatform && // Same platform
          !cart.some((item) => item.id === game.id) // Exclude games already in the cart
      ).slice(0, 3) // Limit to 3 games
    : [];

  // Navigation to game details
  const goToGameDetails = (gameId: string | number) => {
    navigate(`/game/${gameId}`);
  };

  // If cart is empty, show a message and redirect button
  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Add some games to your cart before checkout.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600"
          >
            Browse Games
          </button>
        </div>
      </div>
    );
  }

  // Format and send WhatsApp message
  const sendWhatsAppOrder = () => {
    setIsWhatsAppClicked(true);
    // Format the order details
    let message = `*New Order*\n\n`;

    // Add customer info if provided
    if (customerName) message += `*Name:* ${customerName}\n`;
    if (customerPhone) message += `*Phone:* ${customerPhone}\n`;
    if (customerLocation) message += `*Preferred Location:* ${customerLocation}\n\n`;

    // Add order items
    message += `*Order Details:*\n`;
    cart.forEach(item => {
      let itemPrice = item.Price_to_Sell_For;
      // Apply flash sale discount to eligible items if active
      if (item.isFlashSaleEligible && flashSaleActive) {
        const discountedPrice = itemPrice * 0.75; // 25% off
        message += `• ${item.Game_Title} - ${item.quantity} × $${discountedPrice.toFixed(2)} = $${(item.quantity * discountedPrice).toFixed(2)} (Flash Sale 25% OFF)\n`;
      } else {
        message += `• ${item.Game_Title} - ${item.quantity} × $${itemPrice} = $${(item.quantity * itemPrice).toFixed(2)}\n`;
      }
    });

    // Add discount summary if applicable
    if (flashSaleDiscount > 0) {
      message += `\n*Flash Sale Discount:* -$${flashSaleDiscount.toFixed(2)}`;
    }
    if (bundleDiscount > 0) {
      message += `\n*Bundle Discount (15% off):* -$${bundleDiscount.toFixed(2)}`;
    }
    if (volumeDiscount > 0) {
      message += `\n*Volume Discount (${discountPercent}%):* -$${volumeDiscount.toFixed(2)}`;
    }

    // Add shipping
    if (shippingCost === 0) {
      message += `\n*Shipping:* FREE`;
    } else {
      message += `\n*Shipping:* $${shippingCost.toFixed(2)}`;
    }

    // Add total in USD and SRD
    message += `\n\n*Total: $${finalTotal.toFixed(2)}*`;
    if (srdTotal) {
      message += `\n*Total in SRD: ${srdTotal} SRD*`;
    }

    // Create WhatsApp URL with your number
    const phoneNumber = "+5978574777"; // Your WhatsApp number
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    setTimeout(() => {
      setIsWhatsAppClicked(false);
      window.open(whatsappUrl, '_blank');
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreditCardClicked(true);
    setTimeout(() => {
      setIsCreditCardClicked(false);
      setOrderComplete(true);
      clearCart();
    }, 1000);
    // Simulate order processing
  };

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <span className="text-green-500 text-2xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You for Your Purchase!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Your order has been placed successfully.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-purple-500 text-white py-2 px-6 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center text-purple-500 hover:text-purple-600 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Continue Shopping
      </button>

      <h1 className="text-3xl font-bold mb-8 dark:text-white">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Order Summary / Invoice Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Order Summary</h2>

            {/* Order items */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
              {cart.map((item) => (
                <div 
                  key={item.id} 
                  className="py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-4">
                      {/* Clickable image */}
                      <img 
                        src={item.image_url_medium} 
                        alt={item.Game_Title}
                        className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => goToGameDetails(item.id)}
                      />
                      <div>
                        {/* Clickable title */}
                        <h3 
                          className="font-medium dark:text-white flex items-center cursor-pointer hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                          onClick={() => goToGameDetails(item.id)}
                        >
                          {item.Game_Title}
                          {item.isFlashSaleEligible && (
                            <span 
                              className={`ml-2 inline-flex items-center text-xs ${flashSaleActive ? 'bg-gradient-to-r from-red-600 to-orange-500' : 'bg-gray-500'} text-white px-1.5 py-0.5 rounded cursor-help`}
                              title="Add 3 or more flash sale items to unlock a 25% discount"
                            >
                              <Zap size={10} className="mr-0.5" />
                              Flash Sale
                            </span>
                          )}
                        </h3>

                        {/* Item price with discount if applicable */}
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          ${item.isFlashSaleEligible && flashSaleActive 
                            ? (item.Price_to_Sell_For * 0.75).toFixed(2)
                            : item.Price_to_Sell_For} 
                          {item.isFlashSaleEligible && flashSaleActive && (
                            <span className="text-red-500 ml-1">-25%</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 ml-2 self-start"
                      title="Remove item"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Quantity control and price subtotal */}
                  <div className="flex justify-between items-center mt-2 ml-20">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Quantity:</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        -
                      </button>
                      <span className="dark:text-white w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-medium dark:text-white">
                        ${((item.isFlashSaleEligible && flashSaleActive) 
                          ? (item.Price_to_Sell_For * 0.75 * item.quantity).toFixed(2) 
                          : (item.Price_to_Sell_For * item.quantity).toFixed(2))}
                      </p>
                      {item.isFlashSaleEligible && flashSaleActive && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm line-through">
                          ${(item.Price_to_Sell_For * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Free Shipping Progress Bar */}
            {subtotal < freeShippingThreshold && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-purple-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Add ${(freeShippingThreshold - subtotal).toFixed(2)} more to get <strong>FREE shipping</strong>!
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-purple-500 h-2.5 rounded-full" 
                    style={{ width: `${(subtotal / freeShippingThreshold) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Volume Discount Progress Bar */}
            {totalItems < 5 && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Add {5 - totalItems} more game{5 - totalItems === 1 ? '' : 's'} to get a <strong>20% volume discount</strong>!
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-purple-500 h-2.5 rounded-full" 
                    style={{ width: `${(totalItems / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Mobile Order Summary */}
            <div className="block md:hidden border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-800 dark:text-gray-200">${subtotal.toFixed(2)}</span>
                </div>

                {/* Flash Sale Discount */}
                {flashSaleDiscount > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span className="flex items-center">
                      <Zap size={16} className="mr-1" />
                      Flash Sale (25% off)
                    </span>
                    <span>-${flashSaleDiscount.toFixed(2)}</span>
                  </div>
                )}

                {/* Show bundle discount if applicable */}
                {bundleDiscount > 0 && (
                  <div className="flex justify-between items-center mb-2 text-purple-600">
                    <span>Bundle Discount (15% off):</span>
                    <span>-${bundleDiscount.toFixed(2)}</span>
                  </div>
                )}

                {/* Volume Discount */}
                {volumeDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Volume Discount ({discountPercent}% off)</span>
                    <span>-${volumeDiscount.toFixed(2)}</span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <Truck size={16} className="mr-1" />
                    Shipping
                  </span>
                  <span className="text-gray-800 dark:text-gray-200">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="border-t dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">${finalTotal.toFixed(2)}</span>
                  </div>

                  {/* Show savings if any discount applied */}
                  {(flashSaleDiscount > 0 || volumeDiscount > 0 || bundleDiscount > 0) && (
                    <div className="text-green-600 text-sm text-right mt-1">
                      You saved: ${(flashSaleDiscount + volumeDiscount + bundleDiscount).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Games Section */}
          {recommendedGames.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Recommended Games</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Add more games from the <strong>{firstGamePlatform}</strong> platform to unlock discounts and free shipping!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedGames.map((game) => (
                  <div
                    key={game.id}
                    className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/game/${game.id}`)}
                  >
                    <img
                      src={game.image_url_medium}
                      alt={game.Game_Title}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {game.Game_Title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      ${game.Price_to_Sell_For}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Information Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Your Information</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please provide your contact details so we can arrange local pickup/delivery.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preferred Pickup Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={customerLocation}
                  onChange={(e) => setCustomerLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Where would you like to meet for pickup?"
                />
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Payment Options</h2>

            <div className="space-y-6">
              {/* WhatsApp Payment */}
              <div className="border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h3 className="text-lg font-medium flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                  <MessageCircle size={20} />
                  Local Payment (WhatsApp)
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Send your order details via WhatsApp and arrange payment in person.
                </p>
                <button
                  onClick={sendWhatsAppOrder}
                  className={`w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 ${isWhatsAppClicked ? 'bg-green-700 cursor-not-allowed' : ''}`}
                  disabled={isWhatsAppClicked}
                >
                  {isWhatsAppClicked ? <Check size={20} /> : <MessageCircle size={20} />}
                  Send Order via WhatsApp
                </button>
              </div>

              {/* Credit Card Payment */}
              <div className="border border-purple-200 dark:border-purple-900 p-4 rounded-lg">
                <h3 className="text-lg font-medium flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                  <CreditCard size={20} />
                  Credit Card Payment
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                        required
                      />
                      <CreditCard className="absolute right-3 top-3 text-gray-400" size={20} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">Expiration Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">Security Code</label>
                      <input
                        type="text"
                        placeholder="CVV"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors font-semibold ${isCreditCardClicked ? 'bg-purple-700 cursor-not-allowed' : ''}`}
                    disabled={isCreditCardClicked}
                  >
                    {isCreditCardClicked ? <Check size={20} /> : "Complete Purchase"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar (desktop only) */}
        <div className="hidden md:block lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-800 dark:text-gray-200">${subtotal.toFixed(2)}</span>
              </div>

              {/* Flash Sale Discount */}
              {flashSaleDiscount > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span className="flex items-center">
                    <Zap size={16} className="mr-1" />
                    Flash Sale (25% off)
                    <button
                      onClick={() => setShowFlashSaleInfo(!showFlashSaleInfo)}
                      className="ml-1 text-gray-500 hover:text-orange-600"
                    >
                      <Info size={14} />
                    </button>
                  </span>
                  <span>-${flashSaleDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* Show flash sale info if enabled */}
              {showFlashSaleInfo && (
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm text-gray-600 dark:text-gray-300 mb-2">
                  25% discount applied to eligible Flash Sale items when you buy 3 or more.
                </div>
              )}

              {/* Show bundle discount if applicable */}
              {bundleDiscount > 0 && (
                <div className="flex justify-between items-center mb-2 text-purple-600">
                  <span>Bundle Discount (15% off):</span>
                  <span>-${bundleDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* Volume Discount */}
              {volumeDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Volume Discount ({discountPercent}% off)</span>
                  <span>-${volumeDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* Shipping */}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <Truck size={16} className="mr-1" />
                  Shipping
                </span>
                <span className="text-gray-800 dark:text-gray-200">
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="border-t dark:border-gray-700 pt-3 mt-3">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">${finalTotal.toFixed(2)}</span>
                </div>

                {/* Show SRD Total if available */}
                {srdTotal && (
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-900 dark:text-white">Total in SRD</span>
                    <span className="text-gray-900 dark:text-white">srd{srdTotal}</span>
                  </div>
                )}

                {/* Show savings if any discount applied */}
                {(flashSaleDiscount > 0 || volumeDiscount > 0 || bundleDiscount > 0) && (
                  <div className="text-green-600 text-sm text-right mt-1">
                    You saved: ${(flashSaleDiscount + volumeDiscount + bundleDiscount).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;