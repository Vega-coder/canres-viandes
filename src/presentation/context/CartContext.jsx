import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { addItem, updateQuantity, removeItem, countItems, calculateTotals } from '@/domain/cart/cart.js';
import { useAuth } from '@/presentation/context/AuthContext.jsx';
import { toast } from '@/presentation/utils/swal.js';

// Adaptador: guarda el estado del carrito en React + localStorage y delega
// todas las reglas (stock, máximos, envío) al dominio.

const LEGACY_STORAGE_KEY = 'ap_cart';
const CartContext = createContext(null);

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
    return ctx;
};

export const getCartStorageKey = (userId) => (userId ? `canres_cart_${userId}` : 'canres_cart_guest');

export const loadCartForUser = (userId) => {
    if (typeof localStorage === 'undefined') return [];
    try {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        const key = getCartStorageKey(userId);
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
        return [];
    } catch {
        return [];
    }
};

export const CartProvider = ({ children }) => {
    const { user, isVip, vipConfig } = useAuth();
    const userId = user?.id || null;
    const discountRate = (vipConfig?.discountPercent || 10) / 100;

    const [currentUserId, setCurrentUserId] = useState(userId);
    const [items, setItems] = useState(() => loadCartForUser(userId));
    const [isOpen, setIsOpen] = useState(false);

    // Si el usuario cambia (cambio de cuenta Google, login o logout),
    // se conmuta de inmediato el carrito al del nuevo usuario.
    if (userId !== currentUserId) {
        setCurrentUserId(userId);
        setItems(loadCartForUser(userId));
    }

    useEffect(() => {
        if (typeof localStorage === 'undefined') return;
        try {
            const key = getCartStorageKey(userId);
            localStorage.setItem(key, JSON.stringify(items));
        } catch {
            // Sin almacenamiento (modo privado): el carrito vive solo en memoria.
        }
    }, [items, userId]);

    const add = useCallback((product, quantity = 1) => {
        if (product.stock <= 0) {
            toast('Producto agotado', 'info');
            return;
        }
        setItems((prev) => addItem(prev, product, quantity));
        setIsOpen(true);
    }, []);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);

    const totals = useMemo(() => calculateTotals(items, { isVip, vipDiscountRate: discountRate }), [items, isVip, discountRate]);

    const value = useMemo(() => ({
        items,
        count: countItems(items),
        totals,
        isVip,
        isOpen,
        open,
        close,
        add,
        setQuantity: (productId, qty) => setItems((prev) => updateQuantity(prev, productId, qty)),
        remove: (productId) => setItems((prev) => removeItem(prev, productId)),
        clear: () => setItems([]),
    }), [items, totals, isVip, isOpen, open, close, add]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
