import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface CartItem {
    cartItemId: string; // unique ID for editing in cart
    productId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    selectedOptions: Record<string, string>;
    previewModelPath?: string;
    image: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
    updateQuantity: (id: string, delta: number) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('cart_react');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart_react', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item: Omit<CartItem, 'cartItemId'>) => {
        setCart(prev => {
            // Check if perfectly identical item exists
            const existing = prev.find(i =>
                i.productId === item.productId &&
                JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions)
            );
            if (existing) {
                return prev.map(i =>
                    i.cartItemId === existing.cartItemId
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prev, { ...item, cartItemId: Math.random().toString(36).substr(2, 9) }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.cartItemId === id) {
                const newQ = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQ };
            }
            return i;
        }));
    };

    const removeItem = (id: string) => {
        setCart(prev => prev.filter(i => i.cartItemId !== id));
    };

    const clearCart = () => setCart([]);

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeItem, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
}
