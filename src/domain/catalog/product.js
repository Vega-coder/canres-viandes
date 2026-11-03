// Entidad Producto: normaliza datos crudos a una forma única y expone reglas de negocio puras.
import { applyDiscount } from '../shared/money.js';
import { GENDER, PRODUCT_TYPE } from './categories.js';
import { AROMAS } from './aromas.js';

const DEFAULT_PALETTE = { from: '#660F12', to: '#141414', accent: '#8B0000' };

export const slugify = (text = '') =>
    text
        .toString()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export const splitNotesIntoPyramid = (notes = []) => {
    if (!Array.isArray(notes) || notes.length === 0) {
        return { top: [], heart: [], base: [] };
    }
    const len = notes.length;
    if (len === 1) return { top: [notes[0]], heart: [notes[0]], base: [notes[0]] };
    if (len === 2) return { top: [notes[0]], heart: [notes[0]], base: [notes[1]] };
    if (len === 3) return { top: [notes[0]], heart: [notes[1]], base: [notes[2]] };
    const topCount = Math.ceil(len / 3);
    const heartCount = Math.round((len - topCount) / 2);
    return {
        top: notes.slice(0, topCount),
        heart: notes.slice(topCount, topCount + heartCount),
        base: notes.slice(topCount + heartCount),
    };
};

/** @returns {Product} */
export const createProduct = (raw = {}) => {
    const name = String(raw.name ?? '').trim();
    if (!name) throw new Error('El producto debe tener nombre');

    const price = Number(Number(raw.price).toFixed(2));
    if (!Number.isFinite(price) || price < 0) throw new Error(`Precio inválido para "${name}"`);

    const reviews = Array.isArray(raw.reviews) ? raw.reviews : [];
    const reviewsCount = Number(raw.reviewsCount ?? raw.reviews_count ?? reviews.length) || 0;
    let ratingAverage = raw.ratingAverage ?? raw.rating_average ?? null;
    if (ratingAverage == null && reviews.length > 0) {
        const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
        ratingAverage = Number((sum / reviews.length).toFixed(1));
    } else if (ratingAverage != null) {
        ratingAverage = Number(Number(ratingAverage).toFixed(1));
    }

    const normalizeList = (val) => {
        if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
        if (typeof val === 'string' && val.trim()) {
            return val.split(',').map((s) => s.trim()).filter(Boolean);
        }
        return [];
    };

    let aromas = normalizeList(raw.aromas ?? raw.olfactory_families).map((s) => s.toLowerCase());
    const rawNotes = normalizeList(raw.notes);

    if (aromas.length === 0 && rawNotes.length > 0) {
        for (const n of rawNotes) {
            const found = AROMAS.find((a) => a.name.toLowerCase() === n.toLowerCase() || a.slug === n.toLowerCase());
            if (found && !aromas.includes(found.slug)) {
                aromas.push(found.slug);
            }
        }
    }

    const cookingMethods = Array.isArray(raw.cookingMethods)
        ? raw.cookingMethods
        : normalizeList(raw.cooking_methods || raw.cookingMethods);

    let topNotes = normalizeList(raw.topNotes ?? raw.top_notes);
    let heartNotes = normalizeList(raw.heartNotes ?? raw.heart_notes);
    let baseNotes = normalizeList(raw.baseNotes ?? raw.base_notes);

    if (topNotes.length === 0 && heartNotes.length === 0 && baseNotes.length === 0 && rawNotes.length > 0) {
        const derived = splitNotesIntoPyramid(rawNotes);
        topNotes = derived.top;
        heartNotes = derived.heart;
        baseNotes = derived.base;
    }

    const consolidatedNotes = Array.from(new Set([
        ...topNotes,
        ...heartNotes,
        ...baseNotes,
        ...rawNotes,
        ...cookingMethods,
    ]));

    const rawShippingCost = raw.shippingCost ?? raw.shipping_cost;
    const shippingCost = rawShippingCost != null && rawShippingCost !== '' ? Math.max(0, Number(rawShippingCost) || 0) : 0;
    const hasFreeShipping = raw.hasFreeShipping !== undefined
        ? Boolean(raw.hasFreeShipping)
        : raw.has_free_shipping !== undefined
        ? Boolean(raw.has_free_shipping)
        : (shippingCost === 0);

    return {
        id: String(raw.id ?? slugify(`${raw.brand ?? ''}-${name}`)),
        slug: raw.slug || slugify(`${raw.brand ?? ''} ${name}`),
        name,
        subname: String(raw.subname ?? '').trim(),
        brand: String(raw.brand ?? 'CANRES Viandes').trim(),
        description: raw.description ?? '',
        gender: Object.values(GENDER).includes(raw.gender) ? raw.gender : GENDER.RES,
        type: Object.values(PRODUCT_TYPE).includes(raw.type) ? raw.type : PRODUCT_TYPE.CORTE,
        unit: String(raw.unit ?? 'kg'),
        concentration: raw.concentration ?? null,
        volumeMl: raw.volumeMl ?? raw.volume_ml ?? null,
        price,
        discountPercent: Number(raw.discountPercent ?? raw.discount_percent ?? 0) || 0,
        stock: Math.max(0, Number(raw.stock ?? 0) || 0),
        hasFreeShipping,
        shippingCost: hasFreeShipping ? 0 : shippingCost,
        aromas,
        notes: consolidatedNotes,
        topNotes,
        heartNotes,
        baseNotes,
        cookingMethods,
        images: Array.isArray(raw.images) && raw.images.length > 0
            ? raw.images.filter(Boolean)
            : ['/images/meat/meat_beef_cut.jpg'],
        palette: { ...DEFAULT_PALETTE, ...(raw.palette ?? {}) },
        isNew: Boolean(raw.isNew ?? raw.is_new),
        isFeatured: Boolean(raw.isFeatured ?? raw.is_featured),
        isActive: (raw.isActive ?? raw.is_active) !== false,
        reviewsCount,
        ratingAverage,
        createdAt: raw.createdAt ?? raw.created_at ?? new Date(0).toISOString(),
    };
};

export const LOW_STOCK_THRESHOLD = 3;

export const validateProductInput = (input = {}) => {
    const errors = {};
    if (!String(input.name ?? '').trim()) errors.name = 'El nombre es obligatorio';
    if (!String(input.brand ?? '').trim()) errors.brand = 'La línea es obligatoria';
    const price = Number(input.price);
    if (!Number.isFinite(price) || price <= 0) errors.price = 'Ingresa un precio mayor a 0';
    const discount = Number(input.discountPercent ?? 0);
    if (!Number.isFinite(discount) || discount < 0 || discount > 90) errors.discountPercent = 'Entre 0 y 90';
    const stock = Number(input.stock);
    if (input.stock === '' || !Number.isInteger(stock) || stock < 0) errors.stock = 'Número entero mayor o igual a 0';
    return errors;
};

export const getFinalPrice = (product) => applyDiscount(product.price, product.discountPercent);

export const isOnSale = (product) => product.discountPercent > 0;

export const isInStock = (product, quantity = 1) => product.stock >= quantity;

export const getStockLabel = (product) => {
    if (product.stock <= 0) return 'Agotado';
    if (product.stock <= LOW_STOCK_THRESHOLD) return `¡Solo quedan ${product.stock}!`;
    return 'Disponible';
};
