// Implementaciones de AuthGateway: Supabase Auth y un acceso de demostración.

/** @returns {import('@/application/ports.js').AuthGateway} */
export const createSupabaseAuthGateway = (supabase) => {
    const toAuthUser = async (user) => {
        if (!user) return null;
        let profile = null;
        try {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
            profile = data;
        } catch {
            // Si la consulta de perfil falla o RLS bloquea, usamos metadata
        }

        const role = profile?.role || user.user_metadata?.role || 'customer';
        const fullName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '';
        const phone = profile?.phone || user.user_metadata?.phone || '';
        const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || '';

        let ordersCount = 0;
        try {
            const { count } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);
            ordersCount = count || 0;
        } catch {
            // Ignorar si falla
        }

        return {
            id: user.id,
            email: user.email,
            fullName,
            phone,
            role,
            avatarUrl,
            ordersCount,
            isVip: profile?.is_vip !== false,
            isAdmin: ['superadmin', 'admin', 'gerente'].includes(role),
            wishlist: Array.isArray(user.user_metadata?.wishlist) ? user.user_metadata.wishlist : [],
        };
    };

    return {
        signIn: async (email, password) => {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                if (error.message === 'Invalid login credentials' || error.message.includes('Invalid login')) {
                    throw new Error('Correo o contraseña incorrectos');
                }
                if (error.message.includes('Email not confirmed')) {
                    throw new Error('Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada o spam.');
                }
                throw new Error(error.message);
            }
            return toAuthUser(data.user);
        },
        signInWithGoogle: async (redirectPath = '/') => {
            const redirectTo = typeof window !== 'undefined'
                ? `${window.location.origin}${redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`}`
                : undefined;

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo,
                },
            });
            if (error) throw error;
            return data;
        },
        exchangeCodeForSession: async (authCode) => {
            const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);
            if (error) throw error;
            return toAuthUser(data.session?.user ?? null);
        },
        setSession: async ({ accessToken, refreshToken }) => {
            const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
            });
            if (error) throw error;
            return toAuthUser(data.session?.user ?? null);
        },
        signUp: async (email, password, { fullName = '', phone = '' } = {}) => {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone,
                    },
                },
            });
            if (error) {
                const msg = error.message || '';
                if (msg.includes('already registered') || msg.includes('User already registered')) {
                    throw new Error('Ya existe una cuenta registrada con este correo electrónico');
                }
                if (msg.includes('Password should be at least')) {
                    throw new Error('La contraseña debe tener al menos 6 caracteres');
                }
                if (error.code === 'over_email_send_rate_limit' || msg.includes('rate limit')) {
                    throw new Error('Se ha superado el límite de correos. Te recomendamos usar "Registrarse con Google" o esperar unos minutos.');
                }
                throw new Error(msg);
            }

            if (data.user) {
                try {
                    await supabase.from('profiles').upsert({
                        id: data.user.id,
                        full_name: fullName,
                        phone,
                        email: data.user.email,
                        role: 'customer',
                        is_vip: true,
                    });
                } catch {
                    try {
                        await supabase.from('profiles').upsert({
                            id: data.user.id,
                            full_name: fullName,
                            phone,
                            role: 'customer',
                            is_vip: true,
                        });
                    } catch {
                        // El trigger on_auth_user_created en DB lo respaldará
                    }
                }
            }

            const authUser = await toAuthUser(data.user);
            if (authUser) {
                authUser.needsConfirmation = !data.session && !data.user?.email_confirmed_at;
            }
            return authUser;
        },
        signOut: async () => {
            await supabase.auth.signOut();
        },
        getCurrentUser: async () => {
            const { data } = await supabase.auth.getSession();
            return toAuthUser(data.session?.user ?? null);
        },
        getUserOrders: async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const user = sessionData?.session?.user;
            if (!user) return [];

            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items (*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data ?? []).map((row) => ({
                id: row.id,
                code: row.code,
                status: row.status,
                customer: row.customer,
                paymentMethod: row.payment_method,
                subtotal: row.subtotal,
                shipping: row.shipping,
                total: row.total,
                createdAt: row.created_at,
                items: (row.order_items ?? []).map((i) => ({
                    productId: i.product_id,
                    name: i.name,
                    brand: i.brand,
                    unitPrice: i.unit_price,
                    quantity: i.quantity,
                    lineTotal: i.line_total,
                })),
            }));
        },
        resetPasswordForEmail: async (email) => {
            const redirectTo = typeof window !== 'undefined'
                ? `${window.location.origin}/restablecer-contrasena`
                : undefined;
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo,
            });
            if (error) {
                throw new Error(error.message);
            }
            return data;
        },
        updatePassword: async (newPassword) => {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword,
            });
            if (error) {
                if (error.message.includes('Password should be at least')) {
                    throw new Error('La contraseña debe tener al menos 6 caracteres');
                }
                throw new Error(error.message);
            }
            return toAuthUser(data.user);
        },
        updateUserWishlist: async (wishlist) => {
            try {
                const { error } = await supabase.auth.updateUser({
                    data: { wishlist },
                });
                if (error) {
                    console.warn('[CANRES Auth]: Error actualizando wishlist en Supabase:', error.message);
                }
            } catch (err) {
                console.warn('[CANRES Auth]: Falló sync de wishlist:', err);
            }
        },
        onAuthStateChange: (callback) => {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
                const user = await toAuthUser(session?.user ?? null);
                callback(user);
            });
            return () => subscription.unsubscribe();
        },
    };
};

const DEMO_SESSION_KEY = 'ap_demo_active_user';
const DEMO_CUSTOMERS_KEY = 'ap_demo_customers';

/**
 * Acceso de demostración (sin Supabase).
 * Soporta administrador de pruebas y registro/inicio de sesión de clientes en memoria/storage.
 * @returns {import('@/application/ports.js').AuthGateway}
 */
export const createDemoAuthGateway = ({ email, password, storage = globalThis.sessionStorage }) => {
    const adminUser = { id: 'demo-admin', email, fullName: 'Administrador', phone: '', role: 'admin', isAdmin: true };

    const getCustomers = () => {
        try {
            return JSON.parse(storage?.getItem(DEMO_CUSTOMERS_KEY) || '[]');
        } catch {
            return [];
        }
    };

    const saveCustomers = (list) => {
        try {
            storage?.setItem(DEMO_CUSTOMERS_KEY, JSON.stringify(list));
        } catch {
            // Ignorar en entornos sin storage
        }
    };

    return {
        signIn: async (inputEmail, inputPassword) => {
            if (inputEmail === email && inputPassword === password) {
                storage?.setItem(DEMO_SESSION_KEY, JSON.stringify(adminUser));
                return adminUser;
            }

            const customers = getCustomers();
            const found = customers.find((c) => c.email.toLowerCase() === inputEmail.toLowerCase() && c.password === inputPassword);
            if (!found) throw new Error('Correo o contraseña incorrectos');

            const customerUser = {
                id: found.id,
                email: found.email,
                fullName: found.fullName,
                phone: found.phone,
                role: 'customer',
                ordersCount: 0,
                isVip: found.isVip !== false,
                isAdmin: false,
            };
            storage?.setItem(DEMO_SESSION_KEY, JSON.stringify(customerUser));
            return customerUser;
        },
        signInWithGoogle: async () => {
            const demoGoogleUser = {
                id: 'demo-google-user',
                email: 'cliente.google@canres.test',
                fullName: 'Cliente Google Demo',
                phone: '3001234567',
                role: 'customer',
                ordersCount: 0,
                isVip: true,
                isAdmin: false,
            };
            storage?.setItem(DEMO_SESSION_KEY, JSON.stringify(demoGoogleUser));
            return demoGoogleUser;
        },
        signUp: async (inputEmail, inputPassword, { fullName = '', phone = '' } = {}) => {
            const customers = getCustomers();
            if (customers.some((c) => c.email.toLowerCase() === inputEmail.toLowerCase())) {
                throw new Error('Ya existe una cuenta registrada con este correo electrónico');
            }

            const newCustomer = {
                id: `demo-customer-${Date.now()}`,
                email: inputEmail,
                password: inputPassword,
                fullName,
                phone,
                isVip: true,
            };
            customers.push(newCustomer);
            saveCustomers(customers);

            const customerUser = {
                id: newCustomer.id,
                email: newCustomer.email,
                fullName: newCustomer.fullName,
                phone: newCustomer.phone,
                role: 'customer',
                ordersCount: 0,
                isVip: true,
                isAdmin: false,
            };
            storage?.setItem(DEMO_SESSION_KEY, JSON.stringify(customerUser));
            return customerUser;
        },
        signOut: async () => {
            storage?.removeItem(DEMO_SESSION_KEY);
        },
        getCurrentUser: async () => {
            try {
                const raw = storage?.getItem(DEMO_SESSION_KEY);
                return raw ? JSON.parse(raw) : null;
            } catch {
                return null;
            }
        },
        getUserOrders: async () => {
            try {
                const rawOrders = globalThis.localStorage?.getItem('ap_orders');
                return rawOrders ? JSON.parse(rawOrders) : [];
            } catch {
                return [];
            }
        },
        updateUserWishlist: async (wishlist) => {
            try {
                const raw = storage?.getItem(DEMO_SESSION_KEY);
                if (raw) {
                    const user = JSON.parse(raw);
                    user.wishlist = wishlist;
                    storage?.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
                }
            } catch {
                // Ignorar en entornos sin storage
            }
        },
        resetPasswordForEmail: async () => {
            return { success: true };
        },
        updatePassword: async (newPassword) => {
            if (!newPassword || newPassword.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }
            try {
                const raw = storage?.getItem(DEMO_SESSION_KEY);
                if (raw) {
                    const user = JSON.parse(raw);
                    const customers = getCustomers();
                    const idx = customers.findIndex((c) => c.id === user.id);
                    if (idx >= 0) {
                        customers[idx].password = newPassword;
                        saveCustomers(customers);
                    }
                }
            } catch {
                // Ignorar en entornos sin storage
            }
            return { success: true };
        },
    };
};

