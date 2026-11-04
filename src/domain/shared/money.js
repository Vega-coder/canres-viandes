// Utilidades monetarias puras para CANRES Viandes.
// Soporta moneda en dólares ($ CAD) con formato bilingüe canadiense (en-CA y fr-CA).

export const CURRENCY = 'CAD';

const formatterEn = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatterFr = new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export const formatMoney = (amount, lang = 'en') => {
    const num = Number(amount) || 0;
    const isFr = String(lang).toLowerCase().startsWith('fr');
    return (isFr ? formatterFr : formatterEn).format(num);
};

export const formatUnit = (unit = 'kg', lang = 'es') => {
    const isFr = String(lang).toLowerCase().startsWith('fr');
    const isEn = String(lang).toLowerCase().startsWith('en');

    if (unit === 'kg') return '/ kg';
    if (unit === '450g') {
        if (isFr) return '/ paq. (450g)';
        if (isEn) return '/ pack (450g)';
        return '/ pqte (450g)';
    }
    if (unit === 'caja-4kg') {
        if (isFr) return '/ boîte (4 kg)';
        if (isEn) return '/ box (4 kg)';
        return '/ caja (4 kg)';
    }
    if (unit === 'caja-13kg') {
        if (isFr) return '/ boîte (13 kg)';
        if (isEn) return '/ box (13 kg)';
        return '/ caja (13 kg)';
    }
    if (unit === 'caja-11kg') {
        if (isFr) return '/ boîte (11 kg)';
        if (isEn) return '/ box (11 kg)';
        return '/ caja (11 kg)';
    }
    if (unit === 'boite-5kg') {
        if (isEn) return '/ box (5 kg)';
        return '/ boîte (5 kg)';
    }
    if (unit === 'unidad') {
        if (isFr) return '/ unité';
        if (isEn) return '/ unit';
        return '/ unid.';
    }
    return unit ? `/ ${unit}` : '';
};

export const applyDiscount = (price, discountPercent = 0) => {
    const pct = Math.min(Math.max(Number(discountPercent) || 0, 0), 90);
    const discounted = price * (1 - pct / 100);
    return Math.round(discounted * 100) / 100;
};
