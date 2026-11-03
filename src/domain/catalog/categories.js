// Catálogo maestro de categorías para CANRES Viandes.

export const GENDER = Object.freeze({
    RES: 'res',
    CERDO: 'cerdo',
    POLLO: 'pollo',
    CHIVO: 'chivo',
    CHORIZOS: 'chorizos',
    CANALES: 'canales',
    PERSONALIZADOS: 'personalizados',
});

export const PRODUCT_TYPE = Object.freeze({
    CORTE: 'corte',
    CHARCUTERIA: 'charcuteria',
    CAJA: 'caja',
    CANAL: 'canal',
    PERSONALIZADO: 'personalizado',
});

export const CONCENTRATION = Object.freeze({
    PREMIUM: { id: 'aaa', label: 'Grado AAA' },
    STERLING: { id: 'sterling', label: 'Sterling Silver' },
    ARTESANAL: { id: 'artesanal', label: '100% Artesanal' },
    SELECTO: { id: 'selecto', label: 'Granja Selecta' },
});

export const getConcentrationLabel = (id) =>
    Object.values(CONCENTRATION).find((c) => c.id === id)?.label ?? '';

// Categorías que se muestran en la navegación y en los círculos del home.
export const CATEGORIES = Object.freeze([
    { slug: 'res', label: 'Cortes de Res (Boeuf)', short: 'Res', filter: { gender: GENDER.RES } },
    { slug: 'cerdo', label: 'Cerdo Selecto (Porc)', short: 'Cerdo', filter: { gender: GENDER.CERDO } },
    { slug: 'pollo', label: 'Pollo y Granja (Volaille)', short: 'Pollo', filter: { gender: GENDER.POLLO } },
    { slug: 'chivo', label: 'Chivo y Cordero', short: 'Chivo & Cordero', filter: { gender: GENDER.CHIVO } },
    { slug: 'chorizos', label: 'Chorizos 100% Artesanales', short: 'Chorizos', filter: { gender: GENDER.CHORIZOS } },
    { slug: 'canales', label: 'Medias Canales y Mayoreo', short: 'Mayoreo & Canales', filter: { gender: GENDER.CANALES } },
    { slug: 'personalizados', label: 'Chorizos Personalizados', short: 'A Medida', filter: { gender: GENDER.PERSONALIZADOS } },
]);

export const getCategoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug) ?? null;
