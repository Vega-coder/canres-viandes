// Implementación de ProductRepository en memoria (modo demo y pruebas).
// Si recibe un `storage` (localStorage), persiste los cambios del panel admin entre recargas.
import { createProduct } from '@/domain/catalog/product.js';
import { SEED_PRODUCTS } from '@/infrastructure/data/seedProducts.js';

const KEY = 'canres_products_v5';

const sanitizeImages = (images, gender) => {
    if (!Array.isArray(images) || images.length === 0) return ['/images/products/beef-ribeye.jpg'];
    return images.map((img) => {
        if (typeof img === 'string' && img.includes('canres-viandes/chorizos.jpg')) {
            return gender === 'chorizos' || gender === 'personalizados'
                ? '/images/products/chorizo-artesanal.jpg'
                : '/images/products/chicken-whole.jpg';
        }
        if (typeof img === 'string' && img.includes('canres-viandes/butcher.jpg')) {
            return '/images/products/chicken-breasts.jpg';
        }
        return img;
    });
};

const load = (storage, seed) => {
    try {
        storage?.removeItem('canres_products_v4');
        storage?.removeItem('canres_catalog_cache_v3');
        storage?.removeItem('canres_catalog_cache_v4');
        const saved = storage?.getItem(KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length >= 30) {
                return parsed.map((p) => createProduct({
                    ...p,
                    images: sanitizeImages(p.images, p.gender),
                }));
            }
        }
    } catch {
        // Datos corruptos: volvemos al catálogo semilla.
    }
    const initial = (Array.isArray(seed) && seed.length > 0) ? seed : SEED_PRODUCTS;
    try {
        storage?.setItem(KEY, JSON.stringify(initial));
    } catch {
        // ignore
    }
    return initial.map((p) => createProduct({
        ...p,
        images: sanitizeImages(p.images, p.gender),
    }));
};

const enrichWithReviews = (product, storage) => {
    try {
        if (!storage) return product;
        const raw = storage.getItem(`canres_reviews_${product.id}`);
        if (!raw) return product;
        const reviews = JSON.parse(raw);
        if (Array.isArray(reviews) && reviews.length > 0) {
            const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
            return {
                ...product,
                reviewsCount: reviews.length,
                ratingAverage: Number((sum / reviews.length).toFixed(1)),
            };
        }
    } catch {
        // ignore
    }
    return product;
};

/** @returns {import('@/application/ports.js').ProductRepository & { decrementStock: (items: {productId: string, quantity: number}[]) => Promise<void> }} */
export const createInMemoryProductRepository = (seed = SEED_PRODUCTS, storage = null) => {
    let products = load(storage, seed);

    const persist = () => {
        try {
            storage?.setItem(KEY, JSON.stringify(products));
        } catch (error) {
            console.warn('No se pudo guardar el catálogo localmente:', error);
        }
    };

    return {
        findAll: async () => products.filter((p) => p.isActive).map((p) => enrichWithReviews(p, storage)),
        findAllForAdmin: async () => products.map((p) => enrichWithReviews(p, storage)),
        findBySlug: async (slug) => {
            const p = products.find((p) => p.slug === slug);
            return p ? enrichWithReviews(p, storage) : null;
        },
        findById: async (id) => {
            const p = products.find((p) => p.id === id);
            return p ? enrichWithReviews(p, storage) : null;
        },
        findByIds: async (ids) => {
            const set = new Set(ids);
            return products.filter((p) => set.has(p.id)).map((p) => enrichWithReviews(p, storage));
        },
        save: async (productData) => {
            const entity = createProduct(productData);
            const idx = products.findIndex((p) => p.id === entity.id);
            if (idx >= 0) products[idx] = entity;
            else products.unshift(entity);
            persist();
            return entity;
        },
        delete: async (id) => {
            products = products.filter((p) => p.id !== id);
            persist();
        },
        remove: async (id) => {
            products = products.filter((p) => p.id !== id);
            persist();
        },
        decrementStock: async (items) => {
            for (const item of items) {
                const target = products.find((p) => p.id === item.productId);
                if (target) {
                    target.stock = Math.max(0, target.stock - item.quantity);
                }
            }
            persist();
        },
    };
};
