// Casos de uso de administración de clientes y membresías VIP para CANRES Viandes.

/**
 * @param {{
 *   supabase?: any,
 *   orderRepository: import('../ports.js').OrderRepository
 * }} deps
 */
export const makeListCustomers = ({ supabase, orderRepository }) => async () => {
    let profiles = [];
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && Array.isArray(data)) {
                profiles = data;
            }
        } catch {
            // Ignorar y continuar con fallback
        }
    }

    // Obtener pedidos para calcular estadísticas de compras de cada cliente
    let orders = [];
    try {
        orders = await orderRepository.findAll();
    } catch {
        orders = [];
    }

    // Mapear pedidos por email y por id de usuario
    const statsByEmail = new Map();
    const statsByUserId = new Map();

    for (const order of orders) {
        const email = String(order.customer?.email || '').toLowerCase().trim();
        const userId = order.userId;
        const total = Number(order.total) || 0;

        if (email) {
            const current = statsByEmail.get(email) || { count: 0, totalSpent: 0, lastOrderAt: null, isVip: false };
            current.count += 1;
            current.totalSpent += total;
            current.isVip = current.isVip || Boolean(order.isVip);
            if (!current.lastOrderAt || order.createdAt > current.lastOrderAt) {
                current.lastOrderAt = order.createdAt;
            }
            statsByEmail.set(email, current);
        }

        if (userId) {
            const current = statsByUserId.get(userId) || { count: 0, totalSpent: 0, lastOrderAt: null, isVip: false };
            current.count += 1;
            current.totalSpent += total;
            current.isVip = current.isVip || Boolean(order.isVip);
            if (!current.lastOrderAt || order.createdAt > current.lastOrderAt) {
                current.lastOrderAt = order.createdAt;
            }
            statsByUserId.set(userId, current);
        }
    }

    // Si existen perfiles en Supabase, los enriquecemos con sus pedidos
    if (profiles.length > 0) {
        return profiles.map((p) => {
            const email = String(p.email || '').toLowerCase().trim();
            const stats = statsByUserId.get(p.id) || statsByEmail.get(email) || { count: 0, totalSpent: 0, lastOrderAt: null };
            return {
                id: p.id,
                email: p.email,
                fullName: p.full_name || email.split('@')[0],
                phone: p.phone || '',
                role: p.role || 'customer',
                isVip: p.is_vip !== false,
                activo: p.activo !== false,
                createdAt: p.created_at,
                avatarUrl: p.avatar_url || '',
                ordersCount: stats.count,
                totalSpent: Math.round(stats.totalSpent * 100) / 100,
                lastOrderAt: stats.lastOrderAt,
            };
        });
    }

    // Fallback si no hay perfiles o modo demo
    const customersMap = new Map();
    for (const order of orders) {
        const email = String(order.customer?.email || '').toLowerCase().trim();
        if (!email) continue;
        if (!customersMap.has(email)) {
            const stats = statsByEmail.get(email);
            customersMap.set(email, {
                id: order.userId || `guest-${email}`,
                email: order.customer.email,
                fullName: order.customer.fullName || email.split('@')[0],
                phone: order.customer.phone || '',
                role: 'customer',
                isVip: Boolean(order.isVip || stats.isVip),
                activo: true,
                createdAt: order.createdAt,
                ordersCount: stats.count,
                totalSpent: Math.round(stats.totalSpent * 100) / 100,
                lastOrderAt: stats.lastOrderAt,
            });
        }
    }

    return Array.from(customersMap.values());
};

/**
 * @param {{ supabase?: any }} deps
 */
export const makeToggleCustomerVip = ({ supabase }) => async (customerId, isVip) => {
    if (supabase) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ is_vip: isVip, updated_at: new Date().toISOString() })
            .eq('id', customerId)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
    return { id: customerId, is_vip: isVip };
};
