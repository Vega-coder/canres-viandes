// Utilidades monetarias puras para CANRES Viandes.
// Soporta moneda en dólares ($ CAD / USD) con soporte decimal para pesaje por kg y paquetes.

export const CURRENCY = 'CAD';

const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export const formatMoney = (amount) => {
    const num = Number(amount) || 0;
    return formatter.format(num);
};

export const formatUnit = (unit = 'kg') => {
    if (unit === 'kg') return '/ kg';
    if (unit === '450g') return '/ pqte (450g)';
    if (unit === 'caja-4kg') return '/ caja (4 kg)';
    if (unit === 'caja-13kg') return '/ caja (13 kg)';
    if (unit === 'caja-11kg') return '/ caja (11 kg)';
    if (unit === 'boite-5kg') return '/ boîte (5 kg)';
    if (unit === 'unidad') return '/ unid.';
    return unit ? `/ ${unit}` : '';
};

export const applyDiscount = (price, discountPercent = 0) => {
    const pct = Math.min(Math.max(Number(discountPercent) || 0, 0), 90);
    const discounted = price * (1 - pct / 100);
    return Math.round(discounted * 100) / 100;
};
