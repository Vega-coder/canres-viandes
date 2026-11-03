// Dominio de Estilos Culinarios, Métodos y Ocasiones de CANRES Viandes.

export const AROMAS = Object.freeze([
    {
        slug: 'parrilla',
        name: 'Parrilla & Brasa',
        title: 'PARRILLA & BRASA',
        tag: 'Carbón, Leña & Marmoleo',
        description: 'Cortes seleccionados para el fuego directo: Ribeye, New York, Picaña Sterling y costillares jugosos.',
        image: '/images/meat/meat_beef_cut.jpg',
        keywords: ['parrilla', 'brasa', 'asador', 'rib eye', 'picaña', 'picanha', 'carbón'],
    },
    {
        slug: 'charcuteria',
        name: 'Charcutería Artesanal',
        title: 'CHARCUTERÍA 100% ARTESANAL',
        tag: 'Chorizos de Autor & Butifarra',
        description: 'Embutidos frescos elaborados a mano: Jarabe de Caña, Arándano & Tomillo, Jalapeño Cheddar y Santa Rosa.',
        image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80',
        keywords: ['chorizo', 'artesanal', 'butifarra', 'charcuteria', 'salchicha', 'embutido'],
    },
    {
        slug: 'ahumado',
        name: 'Ahumado & BBQ',
        title: 'AHUMADO & BBQ',
        tag: 'Low & Slow, Glaseado & Rubs',
        description: 'Piezas ideales para cocción lenta: Costillares Baby Back, Panceta Pork Belly y Alitas BBQ.',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        keywords: ['ahumado', 'bbq', 'alas', 'costilla', 'panceta', 'low'],
    },
    {
        slug: 'horno',
        name: 'Horno & Asados Lentos',
        title: 'HORNO & ASADOS LENTOS',
        tag: 'Piernas, Paletas & Pulled Pork',
        description: 'Cortes generosos que se deshebran con tenedor: Pierna de cordero, Hombro de cerdo y Espaldilla AAA.',
        image: 'https://images.unsplash.com/photo-1514944298352-fa545b78f4a1?auto=format&fit=crop&w=600&q=80',
        keywords: ['horno', 'cordero', 'hombro', 'espaldilla', 'braseado', 'lento'],
    },
    {
        slug: 'sarten',
        name: 'Sartén de Hierro & Smash',
        title: 'SARTÉN & SELLADO RÁPIDO',
        tag: 'Costra Dorada & Jugosidad',
        description: 'Sellado potente a fuego vivo: Bife Chatas New York, Pechuga fresca de pollo y Hamburguesas extra-magras.',
        image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
        keywords: ['sarten', 'plancha', 'chatas', 'pechuga', 'molida', 'hamburguesa'],
    },
    {
        slug: 'tradicion',
        name: 'Tradición Colombiana',
        title: 'TRADICIÓN COLOMBIANA',
        tag: 'Sobrebarriga, Sancochos & Picadas',
        description: 'Sabores de nuestras raíces: Sobrebarriga en salsa criolla, Cola de res, Pollo campesino y Lengua fresca.',
        image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=600&q=80',
        keywords: ['colombiana', 'sobrebarriga', 'sancocho', 'cola', 'lengua', 'picada'],
    },
]);

export const getAromaBySlug = (slug = '') =>
    AROMAS.find((a) => a.slug.toLowerCase() === String(slug).toLowerCase()) ?? null;
