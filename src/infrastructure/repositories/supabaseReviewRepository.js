// Repositorio de reseñas sobre Supabase (tabla `product_reviews`, ver supabase/product_reviews_migration.sql)
// Si la tabla aún no existe o Supabase está desconectado, utiliza almacenamiento local como fallback transparente.

const toDomain = (row) => ({
    id: row.id,
    productId: row.product_id,
    author: row.author_name,
    city: row.city || 'Colombia',
    rating: row.rating,
    title: row.title || 'Excelente fragancia',
    comment: row.comment,
    longevity: row.longevity || 'Más de 10 horas',
    sillage: row.sillage || 'Pesada',
    verified: Boolean(row.is_verified),
    helpful: Number(row.helpful_count || 0),
    date: row.created_at ? formatReviewDate(row.created_at) : 'Reciente',
});

const formatReviewDate = (isoString) => {
    try {
        const d = new Date(isoString);
        const now = new Date();
        const diffMs = now - d;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
        return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return 'Reciente';
    }
};

const REVIEW_CACHE_TTL = 10 * 60 * 1000; // 10 minutos anti-egress

export const createSupabaseReviewRepository = (supabase, storage = globalThis.localStorage) => {
    const memoryReviews = new Map();
    const queryCache = new Map();

    const getLocalReviews = (productId) => {
        try {
            const raw = storage?.getItem?.(`ap_reviews_${productId}`);
            if (raw) return JSON.parse(raw);
            return memoryReviews.get(productId) || [];
        } catch {
            return memoryReviews.get(productId) || [];
        }
    };

    const saveLocalReview = (productId, review) => {
        try {
            const existing = getLocalReviews(productId);
            const updated = [review, ...existing];
            try {
                storage?.setItem?.(`ap_reviews_${productId}`, JSON.stringify(updated));
            } catch {
                // ignore
            }
            memoryReviews.set(productId, updated);
            queryCache.delete(productId);
            return review;
        } catch {
            memoryReviews.set(productId, [review]);
            queryCache.delete(productId);
            return review;
        }
    };

    return {
        findByProductId: async (productId) => {
            if (!productId) return [];

            // Escudo anti-egress: si ya se consultó en los últimos 10 minutos, servir desde caché
            const cached = queryCache.get(productId);
            if (cached && cached.expiresAt > Date.now()) {
                return cached.data;
            }

            if (!supabase) {
                return getLocalReviews(productId);
            }

            try {
                const { data, error } = await supabase
                    .from('product_reviews')
                    .select('*')
                    .eq('product_id', productId)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.warn('[ReviewRepo] Error consultando Supabase, usando respaldo local:', error.message);
                    return getLocalReviews(productId);
                }

                if (!data || data.length === 0) {
                    const local = getLocalReviews(productId);
                    queryCache.set(productId, { data: local, expiresAt: Date.now() + REVIEW_CACHE_TTL });
                    return local;
                }

                const result = data.map(toDomain);
                queryCache.set(productId, { data: result, expiresAt: Date.now() + REVIEW_CACHE_TTL });
                return result;
            } catch (err) {
                console.warn('[ReviewRepo] Fallo de red con Supabase:', err);
                return getLocalReviews(productId);
            }
        },

        create: async ({ productId, author, city = 'Colombia', rating, title, comment, longevity = 'Más de 10 horas', sillage = 'Pesada', userId = null }) => {
            const row = {
                product_id: productId,
                author_name: author.trim(),
                city: city.trim() || 'Colombia',
                rating: Number(rating),
                title: title.trim(),
                comment: comment.trim(),
                longevity,
                sillage,
                is_verified: true,
                helpful_count: 0,
            };

            if (userId) {
                row.user_id = userId;
            }

            if (!supabase) {
                const localReview = {
                    id: `local-${Date.now()}`,
                    ...toDomain({ ...row, created_at: new Date().toISOString() }),
                };
                return saveLocalReview(productId, localReview);
            }

            try {
                const { data, error } = await supabase
                    .from('product_reviews')
                    .insert(row)
                    .select()
                    .single();

                if (error) {
                    // Fallback transparente si la columna user_id aún no existe en Supabase
                    if (error.message && error.message.toLowerCase().includes('user_id')) {
                        const { user_id, ...fallbackRow } = row;
                        const retry = await supabase.from('product_reviews').insert(fallbackRow).select().single();
                        if (!retry.error && retry.data) {
                            queryCache.delete(productId);
                            return toDomain(retry.data);
                        }
                    }

                    console.warn('[ReviewRepo] Error insertando en Supabase, guardando localmente:', error.message);
                    const localReview = {
                        id: `local-${Date.now()}`,
                        ...toDomain({ ...row, created_at: new Date().toISOString() }),
                    };
                    return saveLocalReview(productId, localReview);
                }

                queryCache.delete(productId);
                return toDomain(data);
            } catch (err) {
                console.warn('[ReviewRepo] Excepción al guardar reseña en Supabase:', err);
                const localReview = {
                    id: `local-${Date.now()}`,
                    ...toDomain({ ...row, created_at: new Date().toISOString() }),
                };
                return saveLocalReview(productId, localReview);
            }
        },

        incrementHelpful: async (reviewId) => {
            if (!supabase || reviewId.startsWith('local-')) {
                return;
            }

            try {
                // Obtener conteo actual e incrementar
                const { data } = await supabase
                    .from('product_reviews')
                    .select('helpful_count')
                    .eq('id', reviewId)
                    .single();

                if (data) {
                    await supabase
                        .from('product_reviews')
                        .update({ helpful_count: (data.helpful_count || 0) + 1 })
                        .eq('id', reviewId);
                }
            } catch (err) {
                console.warn('[ReviewRepo] No se pudo incrementar voto en Supabase:', err);
            }
        },
    };
};
