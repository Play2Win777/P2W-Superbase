// pages/Checkout.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
// Fix: Change WhatsApp to MessageCircle which exists in lucide-react
import { MessageCircle } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { cart } = useStore();
  const navigate = useNavigate();
  
  // Customer information state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  
  // Calculate total
  const total = cart.reduce(
    (sum, item) => sum + item.Price_to_Sell_For * item.quantity,
    0
  );
  
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
    // Format the order details
    let message = `*New Order*\n\n`;
    
    // Add customer info if provided
    if (customerName) message += `*Name:* ${customerName}\n`;
    if (customerPhone) message += `*Phone:* ${customerPhone}\n`;
    if (customerLocation) message += `*Preferred Location:* ${customerLocation}\n\n`;
    
    // Add order items
    message += `*Order Details:*\n`;
    cart.forEach(item => {
      message += `• ${item.Game_Title} - ${item.quantity} × $${item.Price_to_Sell_For} = $${(item.quantity * item.Price_to_Sell_For).toFixed(2)}\n`;
    });
    
    // Add total
    message += `\n*Total: $${total.toFixed(2)}*`;
    
    // Create WhatsApp URL with your number
    const phoneNumber = "+5978574777"; // Your WhatsApp number
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Checkout</h1>
      
      {/* Order Summary / Invoice Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Order Summary</h2>
        
        {/* Order items */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          {cart.map((item) => (
            <div 
              key={item.id} 
              className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <div className="flex items-center gap-4">
                <img 
                  src={item.image_url_medium} 
                  alt={item.Game_Title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-medium dark:text-white">{item.Game_Title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Quantity: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium dark:text-white">${(item.Price_to_Sell_For * item.quantity).toFixed(2)}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">${item.Price_to_Sell_For} each</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order total */}
        <div className="flex justify-between items-center text-xl font-bold dark:text-white">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      
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
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg"
        >
          Continue Shopping
        </button>
        
        <button
          onClick={sendWhatsAppOrder}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-2"
        >
          {/* Replace WhatsApp icon with MessageCircle */}
          <MessageCircle size={20} />
          Send Order via WhatsApp
        </button>
      </div>
    </div>
  );
};
