// Entidad Carrito: funciones puras e inmutables para CANRES Viandes.
import { getFinalPrice } from '../catalog/product.js';

export const FREE_SHIPPING_THRESHOLD = 120; // $120 CAD para envío refrigerado gratis
export const SHIPPING_COST = 15;            // $15 CAD envío refrigerado exprés
export const MAX_QTY_PER_ITEM = 50;

/**
 * @typedef {Object} CartItem
 * @property {string} productId
 * @property {string} slug
 * @property {string} name
 * @property {string} brand
 * @property {string} unit
 * @property {number} unitPrice
 * @property {number} quantity
 * @property {number} stock
 * @property {{ from: string, to: string, accent: string }} palette
 * @property {string|null} image
 */

const clampQty = (qty, stock) => Math.max(0, Math.min(qty, MAX_QTY_PER_ITEM, stock));

/** @returns {CartItem[]} */
export const addItem = (items, product, quantity = 1) => {
    const existing = items.find((i) => i.productId === product.id);
    if (existing) {
        return items.map((i) =>
            i.productId === product.id ? { ...i, quantity: clampQty(i.quantity + quantity, product.stock) } : i,
        );
    }
    const qty = clampQty(quantity, product.stock);
    if (qty === 0) return items;
    return [
        ...items,
        {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            subname: product.subname,
            brand: product.brand,
            unit: product.unit || 'kg',
            unitPrice: getFinalPrice(product),
            quantity: qty,
            stock: product.stock,
            palette: product.palette,
            image: product.images[0] ?? null,
            hasFreeShipping: Boolean(product.hasFreeShipping),
            shippingCost: product.hasFreeShipping ? 0 : Math.max(0, Number(product.shippingCost) || 0),
        },
    ];
};

export const updateQuantity = (items, productId, quantity) =>
    items
        .map((i) => (i.productId === productId ? { ...i, quantity: clampQty(quantity, i.stock) } : i))
        .filter((i) => i.quantity > 0);

export const removeItem = (items, productId) => items.filter((i) => i.productId !== productId);

export const countItems = (items) => items.reduce((sum, i) => sum + i.quantity, 0);

export const calculateTotals = (items) => {
    const rawSubtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const subtotal = Math.round(rawSubtotal * 100) / 100;
    const allFreeShipping = items.length > 0 && items.every((i) => i.hasFreeShipping);

    if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD || allFreeShipping) {
        return {
            subtotal,
            shipping: 0,
            total: subtotal,
            missingForFreeShipping: 0,
        };
    }

    const costs = items.map((i) => (i.hasFreeShipping || !i.shippingCost || i.shippingCost <= 0 ? 0 : Number(i.shippingCost)));
    const shipping = costs.length > 0 && Math.max(0, ...costs) > 0 ? Math.max(0, ...costs) : (subtotal > 0 ? SHIPPING_COST : 0);
    const total = Math.round((subtotal + shipping) * 100) / 100;
    const missingForFreeShipping = Math.max(0, Math.round((FREE_SHIPPING_THRESHOLD - subtotal) * 100) / 100);

    return {
        subtotal,
        shipping,
        total,
        missingForFreeShipping,
    };
};
