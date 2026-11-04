import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useCases } from '@/infrastructure/container.js';
import { DEFAULT_VIP_CONFIG, isVipEligible } from '@/domain/cart/cart.js';

const AuthContext = createContext(null);
const SESSION_BACKUP_KEY = 'canres_session_backup';

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
    return ctx;
};

export const AuthProvider = ({ children }) => {
    // 1. Cargar desde backup para evitar pestañeo de pantalla de login en recargas (patrón OCAPLUS)
    const [user, setUser] = useState(() => {
        try {
            const backup = localStorage.getItem(SESSION_BACKUP_KEY);
            return backup ? JSON.parse(backup) : null;
        } catch {
            return null;
        }
    });

    const [loading, setLoading] = useState(() => {
        try {
            return !localStorage.getItem(SESSION_BACKUP_KEY);
        } catch {
            return true;
        }
    });

    const [vipConfig, setVipConfig] = useState(DEFAULT_VIP_CONFIG);

    useEffect(() => {
        useCases.getVipConfig?.().then((cfg) => {
            if (cfg) setVipConfig(cfg);
        }).catch(() => {});
    }, []);

    const persistUser = useCallback((u) => {
        setUser(u);
        try {
            if (u) {
                localStorage.setItem(SESSION_BACKUP_KEY, JSON.stringify(u));
            } else {
                localStorage.removeItem(SESSION_BACKUP_KEY);
            }
        } catch {
            // Ignorar errores de storage
        }
    }, []);

    useEffect(() => {
        let active = true;

        const initAuth = async () => {
            try {
                // Limpieza preventiva de claves legadas no aisladas
                try {
                    localStorage.removeItem('ap_wishlist');
                    localStorage.removeItem('ap_cart');
                    localStorage.removeItem('ap_recently_viewed');
                } catch {
                    // ignore
                }

                // Manejar posibles parámetros devueltos por Google OAuth en URL (Hash o Query)
                if (typeof window !== 'undefined') {
                    const hashStr = window.location.hash ? window.location.hash.substring(1) : '';
                    const hashParams = new URLSearchParams(hashStr);
                    const searchParams = new URLSearchParams(window.location.search);

                    const oauthError = hashParams.get('error_description')
                        || searchParams.get('error_description')
                        || hashParams.get('error')
                        || searchParams.get('error');

                    if (oauthError) {
                        console.error('[CANRES Auth]: Google OAuth error en URL:', oauthError);
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }

                    // Si viene un código PKCE (?code=...), intercambiarlo explícitamente
                    const authCode = searchParams.get('code');
                    if (authCode && useCases.exchangeCodeForSession) {
                        try {
                            const exchangedUser = await useCases.exchangeCodeForSession(authCode);
                            if (active && exchangedUser) {
                                persistUser(exchangedUser);
                                window.history.replaceState({}, document.title, window.location.pathname);
                                setLoading(false);
                                return;
                            }
                        } catch (exErr) {
                            console.warn('[CANRES Auth]: Error intercambiando código OAuth:', exErr);
                        }
                    }
                }

                // Cargar sesión actual activa
                const current = await useCases.getCurrentUser();
                if (active) {
                    persistUser(current);
                }
            } catch (err) {
                console.warn('[CANRES Auth]: Error inicializando autenticación:', err);
                if (active) {
                    persistUser(null);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        initAuth();

        const unsubscribe = useCases.onAuthStateChange?.((updatedUser) => {
            if (active) {
                persistUser(updatedUser);
                setLoading(false);
            }
        });

        return () => {
            active = false;
            unsubscribe?.();
        };
    }, [persistUser]);

    const signIn = useCallback(async (email, password) => {
        const loggedUser = await useCases.signInCustomer(email, password);
        persistUser(loggedUser);
        return loggedUser;
    }, [persistUser]);

    const signInWithGoogle = useCallback(async (redirectTo = '/') => {
        if (!useCases.signInWithGoogle) {
            throw new Error('El inicio de sesión con Google no está disponible');
        }
        return useCases.signInWithGoogle(redirectTo);
    }, []);

    const signUp = useCallback(async (data) => {
        const newUser = await useCases.signUpCustomer(data);
        if (newUser && !newUser.needsConfirmation) {
            persistUser(newUser);
        }
        return newUser;
    }, [persistUser]);

    const signOut = useCallback(async () => {
        try {
            await useCases.signOutCustomer();
        } finally {
            persistUser(null);
            try {
                localStorage.removeItem('canres_wishlist_guest');
                localStorage.removeItem('canres_cart_guest');
                localStorage.removeItem('canres_recently_viewed_guest');
                localStorage.removeItem('ap_wishlist');
                localStorage.removeItem('ap_cart');
                localStorage.removeItem('ap_recently_viewed');
                sessionStorage.removeItem('canres_chatbot_history_v1');
            } catch {
                // ignore
            }
        }
    }, [persistUser]);

    const resetPassword = useCallback(async (email) => {
        return useCases.resetPassword(email);
    }, []);

    const updatePassword = useCallback(async (newPassword) => {
        const updatedUser = await useCases.updatePassword(newPassword);
        if (updatedUser) persistUser(updatedUser);
        return updatedUser;
    }, [persistUser]);

    const isVip = useMemo(() => isVipEligible(user, vipConfig), [user, vipConfig]);

    const value = useMemo(() => ({
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: Boolean(user?.isAdmin),
        isVip,
        vipConfig,
        setVipConfig,
        isVipEligible: (u) => isVipEligible(u, vipConfig),
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
    }), [user, loading, isVip, vipConfig, signIn, signInWithGoogle, signUp, signOut, resetPassword, updatePassword]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
