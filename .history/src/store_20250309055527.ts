import { create } from 'zustand';

interface CartItem {
    id: number;
    name: string;
    Price_to_Sell_For: number;
    quantity: number;
    isBundleItem: boolean;
    isFlashSaleEligible: boolean;
    // ... other properties
}

interface CartState {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: number) => void;
    increaseQuantity: (itemId: number) => void;
    decreaseQuantity: (itemId: number) => void;
    getCartTotal: () => {
        subtotal: number;
        flashSaleDiscount: number;
        volumeDiscount: number;
        bundleDiscount: number;
        flashSaleActive: boolean;
        flashSaleEligibleCount: number;
        total: number;
    };
}

const useCartStore = create<CartState>((set, get) => ({
    cart: [],
    addToCart: (item) =>
        set((state) => {
            const existingItem = state.cart.find((cartItem) => cartItem.id === item.id);
            if (existingItem) {
                const updatedCart = state.cart.map((cartItem) =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
                return { cart: updatedCart };
            } else {
                return { cart: [...state.cart, { ...item, quantity: 1 }] };
            }
        }),
    removeFromCart: (itemId) =>
        set((state) => ({
            cart: state.cart.filter((item) => item.id !== itemId),
        })),
    increaseQuantity: (itemId) =>
        set((state) => ({
            cart: state.cart.map((item) =>
                item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
            ),
        })),
    decreaseQuantity: (itemId) =>
        set((state) => ({
            cart: state.cart.map((item) =>
                item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
            ),
        })),
    getCartTotal: () => {
        const { cart } = get();

        // Separate items
        const bundleItems = cart.filter(item => item.isBundleItem);
        const nonBundleItems = cart.filter(item => !item.isBundleItem);

        // Calculate subtotals
        const bundleSubtotal = bundleItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
        const nonBundleSubtotal = nonBundleItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
        const subtotal = bundleSubtotal + nonBundleSubtotal;

        // Calculate flash sale discount
        const flashSaleItems = nonBundleItems.filter(item => item.isFlashSaleEligible);
        const flashSaleSubtotal = flashSaleItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
        const flashSaleEligibleCount = flashSaleItems.reduce((count, item) => count + item.quantity, 0);
        const flashSaleActive = flashSaleEligibleCount >= 3;
        const flashSaleDiscount = flashSaleActive ? flashSaleSubtotal * 0.25 : 0;

        // Calculate volume discount
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        let volumeDiscountRate = 0;
        if (totalItems >= 5) volumeDiscountRate = 0.2;
        else if (totalItems >= 3) volumeDiscountRate = 0.1;
        else if (totalItems >= 2) volumeDiscountRate = 0.05;

        let volumeDiscount = 0;
        let bundleDiscount = 0;

        // Apply bundle discount if the bundle is intact
        if (bundleItems.length > 0 && totalItems === bundleItems.length) {
            bundleDiscount = bundleSubtotal * 0.15;
        } else {
            // If the bundle is broken or doesn't exist, apply volume discount to non-flash-sale items
            volumeDiscount = (subtotal - flashSaleDiscount) * volumeDiscountRate;
        }

        const total = subtotal - flashSaleDiscount - volumeDiscount - bundleDiscount;

        return {
            subtotal,
            flashSaleDiscount,
            volumeDiscount,
            bundleDiscount,
            flashSaleActive,
            flashSaleEligibleCount,
            total
        };
    }
}));

export default useCartStore;
