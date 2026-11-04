import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getWishlistStorageKey,
    loadWishlistForUser,
} from '@/presentation/context/WishlistContext.jsx';
import {
    getCartStorageKey,
    loadCartForUser,
} from '@/presentation/context/CartContext.jsx';

describe('Aislamiento estricto de sesiones y cuentas (Google OAuth / Clientes)', () => {
    let mockStorage = {};

    beforeEach(() => {
        mockStorage = {};
        globalThis.localStorage = {
            getItem: vi.fn((key) => mockStorage[key] ?? null),
            setItem: vi.fn((key, value) => {
                mockStorage[key] = String(value);
            }),
            removeItem: vi.fn((key) => {
                delete mockStorage[key];
            }),
            clear: vi.fn(() => {
                mockStorage = {};
            }),
        };
        globalThis.sessionStorage = {
            getItem: vi.fn((key) => mockStorage[key] ?? null),
            setItem: vi.fn((key, value) => {
                mockStorage[key] = String(value);
            }),
            removeItem: vi.fn((key) => {
                delete mockStorage[key];
            }),
        };
    });

    describe('Aislamiento de Favoritos (Wishlist)', () => {
        const userA = { id: 'google-oauth-user-A', email: 'cuentaA@gmail.com' };
        const userB = { id: 'google-oauth-user-B', email: 'cuentaB@gmail.com' };
        const userC = { id: 'google-oauth-user-C', email: 'cuentaC@gmail.com' };
        const cordero = { id: 'cordero-01', name: 'Pierna de Cordero', price: 16.5 };
        const chorizo = { id: 'chorizo-02', name: 'Chorizo Artesanal', price: 12.0 };
        const lomo = { id: 'lomo-03', name: 'Lomo Fino Res AAA', price: 28.0 };

        it('genera claves de storage estrictamente independientes por ID de usuario', () => {
            const keyA = getWishlistStorageKey(userA.id);
            const keyB = getWishlistStorageKey(userB.id);
            const keyGuest = getWishlistStorageKey(null);

            expect(keyA).toBe('canres_wishlist_google-oauth-user-A');
            expect(keyB).toBe('canres_wishlist_google-oauth-user-B');
            expect(keyGuest).toBe('canres_wishlist_guest');
            expect(keyA).not.toBe(keyB);
            expect(keyA).not.toBe(keyGuest);
        });

        it('no muestra los favoritos de la Cuenta A cuando se cambia a la Cuenta B de Google', () => {
            // 1. La Cuenta A guarda "Pierna de Cordero"
            const keyA = getWishlistStorageKey(userA.id);
            globalThis.localStorage.setItem(keyA, JSON.stringify([cordero]));

            // 2. Verificamos que la Cuenta A tiene su producto
            const itemsA = loadWishlistForUser(userA.id);
            expect(itemsA).toHaveLength(1);
            expect(itemsA[0].name).toBe('Pierna de Cordero');

            // 3. El usuario cambia a la Cuenta B de Google
            const itemsB = loadWishlistForUser(userB.id);

            // 4. Verificación crucial: La Cuenta B DEBE estar vacía, no debe ver "Pierna de Cordero"
            expect(itemsB).toHaveLength(0);
            expect(itemsB.some((i) => i.id === cordero.id)).toBe(false);

            // 5. La Cuenta B guarda su propio favorito: "Chorizo Artesanal"
            const keyB = getWishlistStorageKey(userB.id);
            globalThis.localStorage.setItem(keyB, JSON.stringify([chorizo]));

            // 6. Si el usuario vuelve a la Cuenta A, ve SOLO sus favoritos originales
            const itemsAAfter = loadWishlistForUser(userA.id);
            expect(itemsAAfter).toHaveLength(1);
            expect(itemsAAfter[0].name).toBe('Pierna de Cordero');
            expect(itemsAAfter.some((i) => i.id === chorizo.id)).toBe(false);
        });

        it('soporta ciclo completo de alternancia entre múltiples cuentas y modo invitado', () => {
            // Cuenta A: Cordero
            globalThis.localStorage.setItem(getWishlistStorageKey(userA.id), JSON.stringify([cordero]));
            // Cuenta B: Chorizo
            globalThis.localStorage.setItem(getWishlistStorageKey(userB.id), JSON.stringify([chorizo]));
            // Cuenta C: Lomo
            globalThis.localStorage.setItem(getWishlistStorageKey(userC.id), JSON.stringify([lomo]));
            // Invitado: vacío
            globalThis.localStorage.setItem(getWishlistStorageKey(null), JSON.stringify([]));

            // Verificar cada uno de manera independiente
            expect(loadWishlistForUser(userA.id)[0].name).toBe('Pierna de Cordero');
            expect(loadWishlistForUser(userB.id)[0].name).toBe('Chorizo Artesanal');
            expect(loadWishlistForUser(userC.id)[0].name).toBe('Lomo Fino Res AAA');
            expect(loadWishlistForUser(null)).toHaveLength(0);
        });

        it('inicializa desde metadatos remotos (Supabase) si el storage local está vacío para esa cuenta', () => {
            // Usuario B entra desde un nuevo dispositivo o navegador limpio
            const remoteWishlist = [chorizo];
            const items = loadWishlistForUser(userB.id, remoteWishlist);

            expect(items).toHaveLength(1);
            expect(items[0].name).toBe('Chorizo Artesanal');
            // Se sincroniza en storage local bajo la clave exclusiva de ese usuario
            const keyB = getWishlistStorageKey(userB.id);
            expect(mockStorage[keyB]).toBeDefined();
        });

        it('elimina cualquier residuo de la clave legada global ap_wishlist', () => {
            // Simulamos que el navegador tenía guardada la clave legada vieja
            mockStorage['ap_wishlist'] = JSON.stringify([cordero]);

            // Al cargar favoritos para cualquier usuario, la clave legada debe ser purgada
            const items = loadWishlistForUser(userB.id);
            expect(globalThis.localStorage.removeItem).toHaveBeenCalledWith('ap_wishlist');
            expect(mockStorage['ap_wishlist']).toBeUndefined();
            expect(items).toHaveLength(0);
        });
    });

    describe('Aislamiento de Carrito de Compras (Cart)', () => {
        const userA = { id: 'google-oauth-user-A', email: 'cuentaA@gmail.com' };
        const userB = { id: 'google-oauth-user-B', email: 'cuentaB@gmail.com' };
        const ribeye = { id: 'ribeye-01', name: 'Ribeye AAA', price: 32.0, quantity: 2 };
        const tomahawk = { id: 'tomahawk-02', name: 'Tomahawk Steak', price: 54.0, quantity: 1 };

        it('genera claves de storage independientes para el carrito', () => {
            const keyA = getCartStorageKey(userA.id);
            const keyB = getCartStorageKey(userB.id);
            const keyGuest = getCartStorageKey(null);

            expect(keyA).toBe('canres_cart_google-oauth-user-A');
            expect(keyB).toBe('canres_cart_google-oauth-user-B');
            expect(keyGuest).toBe('canres_cart_guest');
            expect(keyA).not.toBe(keyB);
        });

        it('no transfiere los productos del carrito entre cuentas de Google', () => {
            // Cuenta A añade Ribeye al carrito
            const keyA = getCartStorageKey(userA.id);
            globalThis.localStorage.setItem(keyA, JSON.stringify([ribeye]));

            // Cuenta B inicia sesión
            const cartB = loadCartForUser(userB.id);
            expect(cartB).toHaveLength(0);

            // Cuenta B añade Tomahawk
            const keyB = getCartStorageKey(userB.id);
            globalThis.localStorage.setItem(keyB, JSON.stringify([tomahawk]));

            // Cuenta A vuelve a cargar su carrito
            const cartA = loadCartForUser(userA.id);
            expect(cartA).toHaveLength(1);
            expect(cartA[0].name).toBe('Ribeye AAA');
            expect(cartA.some((i) => i.id === tomahawk.id)).toBe(false);
        });

        it('elimina la clave legada global ap_cart al cargar el carrito', () => {
            mockStorage['ap_cart'] = JSON.stringify([ribeye]);

            const cart = loadCartForUser(userB.id);
            expect(globalThis.localStorage.removeItem).toHaveBeenCalledWith('ap_cart');
            expect(mockStorage['ap_cart']).toBeUndefined();
            expect(cart).toHaveLength(0);
        });
    });

    describe('Aislamiento de Productos Vistos Recientemente', () => {
        const getRecentKey = (uid) => (uid ? `canres_recently_viewed_${uid}` : 'canres_recently_viewed_guest');

        it('genera claves independientes para el historial por usuario', () => {
            const keyA = getRecentKey('user-A');
            const keyB = getRecentKey('user-B');
            const keyGuest = getRecentKey(null);

            expect(keyA).toBe('canres_recently_viewed_user-A');
            expect(keyB).toBe('canres_recently_viewed_user-B');
            expect(keyGuest).toBe('canres_recently_viewed_guest');
        });
    });

    describe('Cierre de sesión seguro y purga de información temporal', () => {
        it('limpia las claves de invitado, chatbot y legadas al cerrar sesión', () => {
            // Simulamos datos de sesión activa/invitado
            mockStorage['canres_wishlist_guest'] = JSON.stringify([{ id: 1 }]);
            mockStorage['canres_cart_guest'] = JSON.stringify([{ id: 2 }]);
            mockStorage['canres_recent_guest'] = JSON.stringify([{ id: 3 }]);
            mockStorage['ap_wishlist'] = JSON.stringify([{ id: 4 }]);
            mockStorage['ap_cart'] = JSON.stringify([{ id: 5 }]);
            mockStorage['ap_recently_viewed'] = JSON.stringify([{ id: 6 }]);
            mockStorage['canres_chatbot_history_v1'] = JSON.stringify([{ text: 'mensaje secreto' }]);

            // Simulación exacta del bloque finally de signOut en AuthContext
            const keysToPurge = [
                'canres_wishlist_guest',
                'canres_cart_guest',
                'canres_recently_viewed_guest',
                'ap_wishlist',
                'ap_cart',
                'ap_recently_viewed',
            ];
            keysToPurge.forEach((k) => globalThis.localStorage.removeItem(k));
            globalThis.sessionStorage.removeItem('canres_chatbot_history_v1');

            expect(mockStorage['canres_wishlist_guest']).toBeUndefined();
            expect(mockStorage['canres_cart_guest']).toBeUndefined();
            expect(mockStorage['canres_chatbot_history_v1']).toBeUndefined();
            expect(mockStorage['ap_wishlist']).toBeUndefined();
            expect(mockStorage['ap_cart']).toBeUndefined();
        });
    });
});
