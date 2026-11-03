// Implementación de ProductRepository en memoria (modo demo y pruebas).
// Si recibe un `storage` (localStorage), persiste los cambios del panel admin entre recargas.
import { createProduct } from '@/domain/catalog/product.js';
import { SEED_PRODUCTS } from '@/infrastructure/data/seedProducts.js';

const KEY = 'canres_products_v4';

const load = (storage, seed) => {
    try {
        const saved = storage?.getItem(KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length >= 30) {
                return parsed.map(createProduct);
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
    return initial.map(createProduct);
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
        findBySlug: async (slug) => {
            const p = products.find((p) => p.slug === slug);
            return p ? enrichWithReviews(p, storage) : null;
        },
        findById: async (id) => {
            const p = products.find((p) => p.id === id);
            return p ? enrichWithReviews(p, storage) : null;
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
