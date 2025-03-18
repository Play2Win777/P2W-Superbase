getCartTotal: () => {
  const { cart } = get();
  
  const flashSaleItems = cart.filter(item => item.isFlashSaleEligible);
  const regularItems = cart.filter(item => !item.isFlashSaleEligible);
  
  const flashSaleEligibleCount = flashSaleItems.reduce((count, item) => count + item.quantity, 0);
  const flashSaleActive = flashSaleEligibleCount >= 3;
  
  const flashSaleSubtotal = flashSaleItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
  const regularSubtotal = regularItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
  
  const subtotal = flashSaleSubtotal + regularSubtotal;
  let flashSaleDiscount = flashSaleActive ? flashSaleSubtotal * 0.25 : 0;
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  let volumeDiscountRate = totalItems >= 5 ? 0.2 : totalItems >= 3 ? 0.1 : totalItems >= 2 ? 0.05 : 0;
  const volumeDiscount = regularSubtotal * volumeDiscountRate;
  
  const total = subtotal - flashSaleDiscount - volumeDiscount;
  
  return { subtotal, flashSaleDiscount, volumeDiscount, flashSaleActive, flashSaleEligibleCount, total };
}
