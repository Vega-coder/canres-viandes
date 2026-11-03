// Reglas puras de filtrado, búsqueda y ordenamiento del catálogo para CANRES Viandes.
import { getFinalPrice, isOnSale } from './product.js';
import { formatMoney } from '../shared/money.js';
import { getAromaBySlug } from './aromas.js';

export const SORT_OPTIONS = Object.freeze([
    { id: 'featured', label: 'Destacados' },
    { id: 'newest', label: 'Más recientes' },
    { id: 'price-asc', label: 'Precio: menor a mayor' },
    { id: 'price-desc', label: 'Precio: mayor a menor' },
    { id: 'name', label: 'Nombre A-Z' },
]);

export const PRICE_RANGES = Object.freeze([
    { id: '0-15', label: `Hasta ${formatMoney(15)}`, min: 0, max: 15 },
    { id: '15-30', label: `${formatMoney(15)} – ${formatMoney(30)}`, min: 15, max: 30 },
    { id: '30-', label: `Más de ${formatMoney(30)}`, min: 30, max: null },
]);

const normalize = (text = '') =>
    text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export const matchesQuery = (product, query) => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (terms.length === 0) return true;
    const haystack = normalize([
        product.name,
        product.subname || '',
        product.brand,
        product.description,
        ...(product.notes || []),
        ...(product.cookingMethods || []),
    ].join(' '));
    return terms.every((term) => haystack.includes(term));
};

export const matchesAroma = (product, aromaSlug) => {
    if (!aromaSlug) return true;
    const aroma = getAromaBySlug(aromaSlug);
    if (!aroma) return true;
    const targetSlug = aromaSlug.toLowerCase();
    if (Array.isArray(product.aromas) && product.aromas.some((s) => String(s).toLowerCase() === targetSlug)) {
        return true;
    }
    const haystack = normalize([
        product.name,
        product.subname || '',
        product.brand,
        product.description,
        ...(product.notes || []),
        ...(product.cookingMethods || []),
    ].join(' '));
    return aroma.keywords.some((kw) => haystack.includes(normalize(kw)));
};

export const filterProducts = (products, criteria = {}) => {
    const { query, aroma, gender, type, brands, minPrice, maxPrice, onSale, isNew, inStock } = criteria;

    return products.filter((p) => {
        if (!p.isActive) return false;
        if (query && !matchesQuery(p, query)) return false;
        if (aroma && !matchesAroma(p, aroma)) return false;
        if (gender) {
            if (gender === 'canales') {
                if (p.gender !== 'canales' && p.type !== 'canal' && p.type !== 'caja') return false;
            } else if (p.gender !== gender) {
                return false;
            }
        }
        if (type && p.type !== type) return false;
        if (brands && brands.length > 0 && !brands.includes(p.brand)) return false;
        const finalPrice = getFinalPrice(p);
        if (minPrice != null && finalPrice < minPrice) return false;
        if (maxPrice != null && finalPrice > maxPrice) return false;
        if (onSale && !isOnSale(p)) return false;
        if (isNew && !p.isNew) return false;
        if (inStock && p.stock <= 0) return false;
        return true;
    });
};

export const sortProducts = (products, sortOption = 'featured') => {
    const copy = [...products];
    switch (sortOption) {
        case 'price-asc':
            return copy.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
        case 'price-desc':
            return copy.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
        case 'newest':
            return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case 'name':
            return copy.sort((a, b) => a.name.localeCompare(b.name, 'es'));
        case 'featured':
        default:
            return copy.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
};


export const getAvailableBrands = (products) =>
    [...new Set(products.map((p) => p.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));

export const getAvailableBrandsByPopularity = (products) => {
    const counts = {};
    for (const p of products) {
        if (!p.brand) continue;
        counts[p.brand] = (counts[p.brand] || 0) + 1;
    }
    return Object.keys(counts).sort((a, b) => (counts[b] || 0) - (counts[a] || 0) || a.localeCompare(b, 'es'));
};
