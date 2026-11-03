// Implementación de ProductRepository sobre Supabase con escudo anti-egress.
// Evita consumo excesivo de ancho de banda (egress) cacheando en memoria y Storage cliente con TTL.
import { createProduct } from '@/domain/catalog/product.js';

const FK_VIOLATION = '23503';
const CACHE_KEY = 'canres_catalog_cache_v2';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos (0 egress en navegación y recargas)

const toDomain = (row) => createProduct({
    ...row,
    brand: row.brand?.name,
    reviews: row.reviews,
    hasFreeShipping: row.has_free_shipping,
    shippingCost: row.shipping_cost,
});

const toRow = (product, brandId, includePyramid = true, includeShipping = true) => {
    const row = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand_id: brandId,
        description: product.description,
        gender: product.gender,
        type: product.type,
        concentration: product.concentration,
        volume_ml: product.volumeMl,
        price: product.price,
        discount_percent: product.discountPercent,
        stock: product.stock,
        notes: product.notes,
        images: product.images,
        palette: product.palette,
        is_new: product.isNew,
        is_featured: product.isFeatured,
        is_active: product.isActive,
        created_at: product.createdAt,
    };
    if (includePyramid) {
        row.top_notes = product.topNotes || [];
        row.heart_notes = product.heartNotes || [];
        row.base_notes = product.baseNotes || [];
    }
    if (includeShipping) {
        row.has_free_shipping = product.hasFreeShipping ?? false;
        row.shipping_cost = product.shippingCost ?? 0;
    }
    return row;
};

/** @returns {import('@/application/ports.js').ProductRepository} */
export const createSupabaseProductRepository = (supabase, storage = globalThis.sessionStorage || globalThis.localStorage) => {
    let memoryCache = null;
    let memoryExpiresAt = 0;
    let hasPyramidColumns = true;
    let hasShippingColumns = true;

    const loadCachedCatalog = () => {
        const now = Date.now();
        if (memoryCache && memoryExpiresAt > now) {
            return memoryCache;
        }

        try {
            const raw = storage?.getItem?.(CACHE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && Array.isArray(parsed.data) && parsed.expiresAt > now && parsed.data.length > 0) {
                    memoryCache = parsed.data.map(createProduct);
                    memoryExpiresAt = parsed.expiresAt;
                    return memoryCache;
                }
            }
        } catch {
            // Caché corrupto o inaccesible
        }
        return null;
    };

    const saveCachedCatalog = (products) => {
        const expiresAt = Date.now() + CACHE_TTL_MS;
        memoryCache = products;
        memoryExpiresAt = expiresAt;
        try {
            storage?.setItem?.(CACHE_KEY, JSON.stringify({
                data: products,
                expiresAt,
            }));
        } catch {
            // Ignorar si el almacenamiento está restringido
        }
    };

    const clearCachedCatalog = () => {
        memoryCache = null;
        memoryExpiresAt = 0;
        try {
            storage?.removeItem?.(CACHE_KEY);
        } catch {
            // ignore
        }
    };

    const buildColumns = () => {
        const base = `
            id, slug, name, description, gender, type, concentration, volume_ml,
            price, discount_percent, stock, notes, images, palette, is_new, is_featured, is_active, created_at
        `;
        const pyramid = hasPyramidColumns ? ', top_notes, heart_notes, base_notes' : '';
        const shipping = hasShippingColumns ? ', has_free_shipping, shipping_cost' : '';
        const relations = `, brand:brands ( name ), reviews:product_reviews ( rating )`;
        return `${base}${pyramid}${shipping}${relations}`;
    };

    const select = () => supabase.from('products').select(buildColumns());

    const runQuery = async (queryFn) => {
        let { data, error } = await queryFn(select());
        if (error && hasShippingColumns && (error.code === '42703' || error.message?.includes('shipping') || error.message?.includes('has_free_shipping'))) {
            hasShippingColumns = false;
            const res = await queryFn(select());
            data = res.data;
            error = res.error;
        }
        if (error && hasPyramidColumns && (error.code === '42703' || error.message?.includes('top_notes'))) {
            hasPyramidColumns = false;
            return queryFn(select());
        }
        return { data, error };
    };

    const findBrandId = async (name) => {
        const { data, error } = await supabase.from('brands').upsert({ name }, { onConflict: 'name' }).select('id').single();
        if (error) throw error;
        return data.id;
    };

    return {
        findAll: async () => {
            const cached = loadCachedCatalog();
            if (cached) return cached;

            const { data, error } = await runQuery((q) => q.eq('is_active', true).order('created_at', { ascending: false }));
            if (error) throw error;

            const products = data.map(toDomain);
            saveCachedCatalog(products);
            return products;
        },
        findAllForAdmin: async () => {
            const { data, error } = await runQuery((q) => q.order('created_at', { ascending: false }));
            if (error) throw error;
            return data.map(toDomain);
        },
        findById: async (id) => {
            // 1. Escudo anti-egress: buscar primero en catálogo local
            const catalog = loadCachedCatalog();
            if (catalog) {
                const found = catalog.find((p) => p.id === id);
                if (found) return found;
            }

            const { data, error } = await runQuery((q) => q.eq('id', id).maybeSingle());
            if (error) throw error;
            return data ? toDomain(data) : null;
        },
        findBySlug: async (slug) => {
            // 1. Escudo anti-egress: buscar primero en catálogo local
            const catalog = loadCachedCatalog();
            if (catalog) {
                const found = catalog.find((p) => p.slug === slug || p.id === slug);
                if (found) return found;
            }

            const { data, error } = await runQuery((q) => q.eq('slug', slug).eq('is_active', true).maybeSingle());
            if (error) throw error;
            return data ? toDomain(data) : null;
        },
        // Sin caché: se usa al confirmar pedidos y necesita precio/stock frescos en tiempo real.
        findByIds: async (ids) => {
            const { data, error } = await runQuery((q) => q.in('id', ids));
            if (error) throw error;
            return data.map(toDomain);
        },
        save: async (product) => {
            const brandId = await findBrandId(product.brand);
            let row = toRow(product, brandId, hasPyramidColumns, hasShippingColumns);
            let res = await supabase.from('products').upsert(row).select(buildColumns()).single();

            if (res.error && hasShippingColumns && (res.error.code === '42703' || res.error.message?.includes('shipping') || res.error.message?.includes('has_free_shipping'))) {
                hasShippingColumns = false;
                row = toRow(product, brandId, hasPyramidColumns, false);
                res = await supabase.from('products').upsert(row).select(buildColumns()).single();
            }

            if (res.error && hasPyramidColumns && (res.error.code === '42703' || res.error.message?.includes('top_notes'))) {
                hasPyramidColumns = false;
                row = toRow(product, brandId, false, hasShippingColumns);
                res = await supabase.from('products').upsert(row).select(buildColumns()).single();
            }

            if (res.error) throw res.error;
            clearCachedCatalog();
            return toDomain(res.data);
        },
        remove: async (id) => {
            clearCachedCatalog();
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (!error) return { archived: false };
            // Tiene pedidos asociados: lo ocultamos de la tienda para conservar el historial.
            if (error.code !== FK_VIOLATION) throw error;
            const { error: archiveError } = await supabase.from('products').update({ is_active: false }).eq('id', id);
            if (archiveError) throw archiveError;
            return { archived: true };
        },
    };
};
