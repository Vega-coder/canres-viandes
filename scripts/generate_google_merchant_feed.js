import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Leer .env manualmente si existe
if (fs.existsSync('.env')) {
    const envLines = fs.readFileSync('.env', 'utf-8').split('\n');
    for (const line of envLines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [k, ...v] = trimmed.split('=');
            if (k && !process.env[k.trim()]) {
                process.env[k.trim()] = v.join('=').trim();
            }
        }
    }
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zxtztxetxgxpmbzmgvfo.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_f3dEcQJYKPbf5Iw2j4veEw_-0DHfWdh';
const BASE_URL = 'https://www.lavachecanres.com';

const escapeXml = (unsafe = '') => {
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

export async function generateGoogleMerchantFeed() {
    let rawProducts = [];

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data, error } = await supabase
            .from('products')
            .select(`
                id, slug, name, subname, description, price, discount_percent, stock, images,
                brand:brands ( name )
            `)
            .eq('is_active', true);

        if (!error && Array.isArray(data) && data.length > 0) {
            rawProducts = data.map((p) => ({
                ...p,
                brandName: p.brand?.name || 'CANRES Viandes',
            }));
            console.log(`[Merchant Feed] Obtenidos ${rawProducts.length} productos de Supabase.`);
        } else {
            throw new Error(error?.message || 'Sin productos en Supabase');
        }
    } catch (err) {
        console.warn(`[Merchant Feed] Fallback a seedProducts: ${err.message}`);
        try {
            const { SEED_PRODUCTS } = await import('../src/infrastructure/data/seedProducts.js');
            rawProducts = (SEED_PRODUCTS || []).map((p) => ({
                ...p,
                brandName: p.brand || 'CANRES Viandes',
            }));
            console.log(`[Merchant Feed] Obtenidos ${rawProducts.length} productos desde seedProducts.js.`);
        } catch (seedErr) {
            console.error('[Merchant Feed] Error al cargar seedProducts:', seedErr.message);
        }
    }

    const itemsXml = rawProducts.map((p) => {
        const brand = p.brandName || 'CANRES Viandes';
        const title = `${p.name} ${p.subname ? `(${p.subname})` : ''} - ${brand} Boucherie Artisanale`.trim();
        const link = `${BASE_URL}/producto/${p.slug}`;
        
        let image = Array.isArray(p.images) && p.images[0] ? p.images[0] : '/brand/brand_cover.png';
        if (!image.startsWith('http')) {
            image = `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`;
        }

        const inStock = (p.stock || 0) > 0;
        const discount = Number(p.discount_percent || 0);
        const originalPrice = Number(p.price || 0).toFixed(2);
        const finalPrice = discount > 0 ? (Number(p.price) * (1 - discount / 100)).toFixed(2) : originalPrice;

        const desc = p.description
            ? `${p.description.slice(0, 450)}... Boucherie artisanale et charcuterie d'exception La Vache CANRES.`
            : `Découvrez ${p.name} de première qualité chez CANRES Viandes (La Vache CANRES). Boucherie artisanale et charcuterie d'exception.`;

        return `    <item>
      <g:id>${escapeXml(p.slug || p.id)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(desc)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(image)}</g:image_link>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${inStock ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${originalPrice} CAD</g:price>
      ${discount > 0 ? `<g:sale_price>${finalPrice} CAD</g:sale_price>` : ''}
      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Food Items &gt; Meat, Poultry &amp; Seafood &gt; Meat</g:google_product_category>
      <g:shipping>
        <g:country>CA</g:country>
        <g:service>Livraison Locale / Express</g:service>
        <g:price>0.00 CAD</g:price>
      </g:shipping>
    </item>`;
    }).join('\n');

    const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>CANRES Viandes · La Vache CANRES - Catalogue Officiel</title>
    <link>${BASE_URL}</link>
    <description>Boucherie artisanale haut de gamme, bœuf AAA, porc, volaille et charcuterie 100% naturelle à Montréal et en ligne.</description>
${itemsXml}
  </channel>
</rss>
`;

    const publicPath = path.resolve('public', 'google-merchant-feed.xml');
    fs.writeFileSync(publicPath, feedXml, 'utf-8');
    console.log(`[Merchant Feed] Generado en ${publicPath} (${rawProducts.length} productos incluidos).`);

    const distPath = path.resolve('dist', 'google-merchant-feed.xml');
    if (fs.existsSync('dist')) {
        fs.writeFileSync(distPath, feedXml, 'utf-8');
        console.log(`[Merchant Feed] Sincronizado en ${distPath}.`);
    }
}

generateGoogleMerchantFeed();
