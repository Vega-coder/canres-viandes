// Dominio de Líneas y Tradiciones de Carne de CANRES Viandes.
// Las líneas y conteos se calculan dinámicamente desde el catálogo de productos.

export const brandToSlug = (name = '') =>
    name
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export const KNOWN_BRAND_INFO = {
    'res-aaa': {
        name: 'Res AAA',
        slug: 'res-aaa',
        country: 'Québec & Alberta, Canadá',
        founded: 'Cortes Selectos',
        tagline: 'Marmoleo superior y terneza inigualable para la parrilla',
        description: 'Nuestra selección de cortes de res de grado AAA y reservas Sterling reúne los cortes más codiciados del mercado. Maduración controlada, terneza óptima y un balance perfecto de grasa intramuscular para una experiencia culinaria inolvidable.',
    },
    'charcuteria-artesanal': {
        name: 'Charcutería Artesanal',
        slug: 'charcuteria-artesanal',
        country: 'Tradición Colombiana & Savoir-Faire Québécois',
        founded: '100% Artesanal',
        tagline: 'Embutidos puros, sin conservantes y con recetas de autor',
        description: 'Chorizos y embutidos elaborados a mano según la más pura tradición artesanal. Fórmulas exclusivas como Jarabe de Caña, Arándano & Tomillo, Jalapeño Cheddar, y el emblemático Chorizo Santa Rosa Style, sin rellenos artificiales.',
    },
    'cerdo-selecto': {
        name: 'Cerdo Selecto',
        slug: 'cerdo-selecto',
        country: 'Granjas Locales de Québec',
        founded: 'Crianza de Calidad',
        tagline: 'Jugosidad, sabor natural y versatilidad gastronómica',
        description: 'Cortes de cerdo alimentado con granos seleccionados. Desde costillares baby back carnosos y panceta crocante para chicharrón, hasta hombro y pierna ideales para hornear y desmechar.',
    },
    'aves-de-corral': {
        name: 'Aves de Corral',
        slug: 'aves-de-corral',
        country: 'Granja Fresca',
        founded: 'Frescura Diaria',
        tagline: 'Frescura garantizada, textura tierna y rendimiento',
        description: 'Pollo de granja seleccionado diariamente. Filetes de pechuga extra limpios, alitas BBQ calibradas, y pollo campesino para caldos y sancochos cargados de sabor.',
    },
    'chivo-y-cordero': {
        name: 'Chivo y Cordero',
        slug: 'chivo-y-cordero',
        country: 'Pastoreo Natural',
        founded: 'Sabor Auténtico',
        tagline: 'Aromas campesinos y terneza para asados memorables',
        description: 'Carne joven y tierna de pastoreo natural. Piernas de cordero ideales para aromatizar con romero y cuartos de chivo para guisos y asados a la brasa.',
    },
};

export const getBrandMetadata = (brandNameOrSlug = '') => {
    const slug = brandToSlug(brandNameOrSlug);
    if (KNOWN_BRAND_INFO[slug]) {
        return KNOWN_BRAND_INFO[slug];
    }
    const cleanName = brandNameOrSlug.trim() || 'Línea Artesanal';
    return {
        name: cleanName,
        slug: slug || 'linea',
        country: 'CANRES Viandes',
        founded: 'Boucherie Artisanale',
        tagline: 'La viande comme il faut',
        description: `${cleanName} forma parte de la oferta exclusiva de CANRES Viandes, garantizando frescura, trazabilidad y corte artesanal impecable.`,
    };
};

export const buildBrandsCatalog = (products = []) => {
    const brandMap = new Map();

    for (const p of products) {
        if (!p.brand) continue;
        const brandName = p.brand.trim();
        const slug = brandToSlug(brandName);

        if (!brandMap.has(slug)) {
            const meta = getBrandMetadata(brandName);
            brandMap.set(slug, {
                ...meta,
                name: brandName,
                slug,
                count: 0,
                genders: new Set(),
            });
        }

        const entry = brandMap.get(slug);
        entry.count += 1;
        if (p.gender) entry.genders.add(p.gender);
    }

    return Array.from(brandMap.values())
        .map((b) => ({
            ...b,
            genders: Array.from(b.genders),
        }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'es'));
};

export const resolveBrandBySlug = (slug, products = []) => {
    const normalized = brandToSlug(slug);
    for (const p of products) {
        if (p.brand && brandToSlug(p.brand) === normalized) {
            return {
                ...getBrandMetadata(p.brand),
                name: p.brand,
                slug: normalized,
            };
        }
    }
    if (KNOWN_BRAND_INFO[normalized]) {
        return KNOWN_BRAND_INFO[normalized];
    }
    return null;
};
