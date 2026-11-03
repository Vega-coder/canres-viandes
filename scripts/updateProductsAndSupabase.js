import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zxtztxetxgxpmbzmgvfo.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_f3dEcQJYKPbf5Iw2j4veEw_-0DHfWdh';

console.log('--- 1. Updating src/infrastructure/data/seedProducts.js ---');
let seedContent = fs.readFileSync('./src/infrastructure/data/seedProducts.js', 'utf8');

// Update media-canal-cerdo gender to 'cerdo'
seedContent = seedContent.replace(
    /"id": "media-canal-cerdo",\r?\n(\s+)"slug": "media-canal-cerdo",\r?\n(\s+)"name": "Media Canal de Cerdo",\r?\n(\s+)"subname": "Demi-carcasse de porc \(5\.50\$\/kg\)",\r?\n(\s+)"brand": "Cerdo Selecto",\r?\n(\s+)"gender": "canales",/,
    '"id": "media-canal-cerdo",\n$1"slug": "media-canal-cerdo",\n$2"name": "Media Canal de Cerdo",\n$3"subname": "Demi-carcasse de porc (5.50$/kg)",\n$4"brand": "Cerdo Selecto",\n$5"gender": "cerdo",'
);

// Update pechuga-de-pollo price to 13.5
seedContent = seedContent.replace(
    /"id": "pechuga-de-pollo",([\s\S]*?)"price": 13\.55,/,
    '"id": "pechuga-de-pollo",$1"price": 13.5,'
);

// Update Res canals to gender: 'res'
const resIds = [
    'media-canal-aaa-res-207kg',
    'cuarto-trasero-res-aaa-88kg',
    'cuarto-delantero-res-aaa-116kg',
    'media-canal-aa-res-205kg',
    'caja-carne-con-hueso-11kg'
];

for (const id of resIds) {
    const regex = new RegExp(`("id": "${id}",[\\s\\S]*?"gender": )"canales"`);
    seedContent = seedContent.replace(regex, '$1"res"');
}

fs.writeFileSync('./src/infrastructure/data/seedProducts.js', seedContent, 'utf8');
console.log('seedProducts.js successfully updated.');

// Dynamically import updated SEED_PRODUCTS
const { SEED_PRODUCTS } = await import('../src/infrastructure/data/seedProducts.js');
console.log(`Loaded ${SEED_PRODUCTS.length} products from seed.`);

console.log('--- 2. Synchronizing with Supabase database ---');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Fetch brands from Supabase
const { data: brands, error: brandsError } = await supabase.from('brands').select('id, name');
if (brandsError) {
    console.error('Error fetching brands:', brandsError);
    process.exit(1);
}

const brandMap = {};
for (const b of brands) {
    brandMap[b.name.toLowerCase().trim()] = b.id;
}
console.log('Brands found in Supabase:', brandMap);

// Map products to database format
const rows = SEED_PRODUCTS.map((p) => {
    // Resolve brand ID
    let brandId = brandMap[p.brand?.toLowerCase()?.trim()];
    if (!brandId) {
        if (p.gender === 'res') brandId = brandMap['res aaa'];
        else if (p.gender === 'cerdo') brandId = brandMap['cerdo selecto'];
        else if (p.gender === 'pollo') brandId = brandMap['aves de corral'];
        else if (p.gender === 'chivo') brandId = brandMap['chivo y cordero'];
        else brandId = brandMap['charcutería artesanal'] || brandMap['charcuteria artesanal'];
    }

    return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        subname: p.subname || '',
        brand_id: brandId,
        description: p.description || '',
        gender: p.gender,
        type: p.type,
        unit: p.unit || 'kg',
        price: p.price,
        discount_percent: p.discountPercent || 0,
        stock: p.stock || 20,
        notes: p.notes || [],
        cooking_methods: p.cookingMethods || [],
        images: p.images || [],
        palette: p.palette || { to: '#141414', from: '#660F12', accent: '#8B0000' },
        is_new: Boolean(p.isNew),
        is_featured: Boolean(p.isFeatured),
        is_active: true,
    };
});

console.log(`Upserting ${rows.length} products into Supabase...`);
for (const row of rows) {
    const { error: upsertError } = await supabase.from('products').upsert(row, { onConflict: 'id' });
    if (upsertError) {
        console.error(`Error updating product ${row.id}:`, upsertError);
    } else {
        console.log(`✓ ${row.name} | ${row.price}$ / ${row.unit} [${row.gender} - ${row.type}]`);
    }
}

console.log('--- All 44 products successfully synchronized in Supabase! ---');
