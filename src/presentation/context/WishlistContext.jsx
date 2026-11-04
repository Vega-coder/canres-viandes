import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/presentation/context/AuthContext.jsx';
import { useCases } from '@/infrastructure/container.js';
import { toast } from '@/presentation/utils/swal.js';

const LEGACY_STORAGE_KEY = 'ap_wishlist';
const WishlistContext = createContext(null);

export const useWishlist = () => {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error('useWishlist debe usarse dentro de <WishlistProvider>');
    return ctx;
};

export const getWishlistStorageKey = (userId) => (userId ? `canres_wishlist_${userId}` : 'canres_wishlist_guest');

export const loadWishlistForUser = (userId, initialFallback = []) => {
    if (typeof localStorage === 'undefined') return [];
    try {
        // Eliminar clave legada no aislada para que no contamine ninguna cuenta
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        const key = getWishlistStorageKey(userId);
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
        if (Array.isArray(initialFallback) && initialFallback.length > 0) {
            try {
                localStorage.setItem(key, JSON.stringify(initialFallback));
            } catch {
                // ignore
            }
            return initialFallback;
        }
        return [];
    } catch {
        return [];
    }
};

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const userId = user?.id || null;

    const [currentUserId, setCurrentUserId] = useState(userId);
    const [items, setItems] = useState(() => loadWishlistForUser(userId, user?.wishlist));

    // Si el usuario cambia (cambio de cuenta Google, login o logout),
    // se reinicia el estado cargando de inmediato los favoritos de la nueva cuenta.
    if (userId !== currentUserId) {
        setCurrentUserId(userId);
        setItems(loadWishlistForUser(userId, user?.wishlist));
    }

    // Persistir en localStorage bajo la clave exclusiva del usuario activo
    useEffect(() => {
        if (typeof localStorage === 'undefined') return;
        try {
            const key = getWishlistStorageKey(userId);
            localStorage.setItem(key, JSON.stringify(items));
        } catch {
            // Modo incógnito o sin almacenamiento
        }
    }, [items, userId]);

    // Sincronización en segundo plano con el perfil de Supabase si el usuario está autenticado
    const syncTimeoutRef = useRef(null);
    useEffect(() => {
        if (!userId || !useCases?.updateUserWishlist) return;

        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(() => {
            useCases.updateUserWishlist(items).catch(() => {});
        }, 800);

        return () => {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        };
    }, [items, userId]);

    const isInWishlist = useCallback(
        (productId) => items.some((item) => String(item.id) === String(productId)),
        [items]
    );

    const toggleWishlist = useCallback((product) => {
        if (!product?.id) return;
        setItems((prev) => {
            const exists = prev.some((item) => String(item.id) === String(product.id));
            if (exists) {
                toast('Eliminado de tus favoritos', 'info');
                return prev.filter((item) => String(item.id) !== String(product.id));
            } else {
                toast('¡Añadido a tus favoritos!', 'success');
                // Guardamos una copia ligera del producto para pintar la lista sin reconsultar el backend
                const minimal = {
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    brand: product.brand,
                    price: product.price,
                    discountPercent: product.discountPercent,
                    stock: product.stock,
                    concentration: product.concentration,
                    volumeMl: product.volumeMl,
                    gender: product.gender,
                    images: product.images || [],
                    palette: product.palette,
                    notes: product.notes || [],
                    isNew: product.isNew,
                    isFeatured: product.isFeatured,
                };
                return [minimal, ...prev];
            }
        });
    }, []);

    const removeFromWishlist = useCallback((productId) => {
        setItems((prev) => prev.filter((item) => String(item.id) !== String(productId)));
        toast('Eliminado de favoritos', 'info');
    }, []);

    const clearWishlist = useCallback(() => {
        setItems([]);
        toast('Lista de deseos vaciada', 'info');
    }, []);

    const value = useMemo(
        () => ({
            items,
            count: items.length,
            isInWishlist,
            toggleWishlist,
            removeFromWishlist,
            clearWishlist,
        }),
        [items, isInWishlist, toggleWishlist, removeFromWishlist, clearWishlist]
    );

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
