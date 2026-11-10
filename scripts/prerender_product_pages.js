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
        .replace(/'/g, '&#039;');
};

export async function prerenderProducts() {
    const distIndexPath = path.resolve('dist', 'index.html');
    if (!fs.existsSync(distIndexPath)) {
        console.warn('[Prerender] dist/index.html no existe todavía. Ejecuta este script después de vite build.');
        return;
    }

    const template = fs.readFileSync(distIndexPath, 'utf-8');
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
            console.log(`[Prerender] Obtenidos ${rawProducts.length} productos de Supabase.`);
        } else {
            throw new Error(error?.message || 'Sin productos en Supabase');
        }
    } catch (err) {
        console.warn(`[Prerender] Fallback a seedProducts: ${err.message}`);
        try {
            const { SEED_PRODUCTS } = await import('../src/infrastructure/data/seedProducts.js');
            rawProducts = (SEED_PRODUCTS || []).map((p) => ({
                ...p,
                brandName: p.brand || 'CANRES Viandes',
            }));
            console.log(`[Prerender] Obtenidos ${rawProducts.length} productos desde seedProducts.js.`);
        } catch (seedErr) {
            console.error('[Prerender] Error al cargar seedProducts:', seedErr.message);
        }
    }

    let count = 0;
    for (const p of rawProducts) {
        if (!p.slug) continue;

        const brandName = p.brandName || 'CANRES Viandes';
        const pageTitle = `${p.name}${p.subname ? ` (${p.subname})` : ''} · ${brandName} | La Vache CANRES`;
        
        let mainImage = Array.isArray(p.images) && p.images[0] ? p.images[0] : '/brand/brand_cover.png';
        if (!mainImage.startsWith('http')) {
            mainImage = `${BASE_URL}${mainImage.startsWith('/') ? '' : '/'}${mainImage}`;
        }

        const discount = Number(p.discount_percent || 0);
        const price = Number(p.price || 0);
        const finalPrice = discount > 0 ? (price * (1 - discount / 100)).toFixed(2) : price.toFixed(2);
        const inStock = (p.stock || 0) > 0;

        const descText = p.description
            ? `${p.description.slice(0, 140)}... Prix: $${finalPrice} CAD. Boucherie artisanale d'exception La Vache CANRES.`
            : `Découvrez ${p.name} ($${finalPrice} CAD). Boucherie artisanale et charcuterie 100% naturelle chez La Vache CANRES.`;

        const pageUrl = `${BASE_URL}/producto/${p.slug}`;

        let html = template;

        // Reemplazar título
        html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeXml(pageTitle)}</title>`);

        // Reemplazar meta description
        html = html.replace(
            /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
            `<meta name="description" content="${escapeXml(descText)}" />`
        );

        // Reemplazar canonical
        html = html.replace(
            /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
            `<link rel="canonical" href="${escapeXml(pageUrl)}" />`
        );

        // Inyectar o reemplazar etiquetas Open Graph
        const ogTags = `
    <!-- Open Graph dinámico para WhatsApp, Facebook, Googlebot -->
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${escapeXml(pageTitle)}" />
    <meta property="og:description" content="${escapeXml(descText)}" />
    <meta property="og:image" content="${escapeXml(mainImage)}" />
    <meta property="og:url" content="${escapeXml(pageUrl)}" />
    <meta property="og:site_name" content="CANRES Viandes · La Vache CANRES" />
    <meta property="og:price:amount" content="${finalPrice}" />
    <meta property="og:price:currency" content="CAD" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeXml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeXml(descText)}" />
    <meta name="twitter:image" content="${escapeXml(mainImage)}" />
    <!-- Schema.org Product para Google Search -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "${escapeXml(p.name)}",
      "image": ["${escapeXml(mainImage)}"],
      "description": "${escapeXml(p.description || descText)}",
      "sku": "${escapeXml(p.slug)}",
      "brand": {
        "@type": "Brand",
        "name": "${escapeXml(brandName)}"
      },
      "offers": {
        "@type": "Offer",
        "url": "${escapeXml(pageUrl)}",
        "priceCurrency": "CAD",
        "price": "${finalPrice}",
        "availability": "${inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}",
        "itemCondition": "https://schema.org/NewCondition"
      }
    }
    </script>
`;

        html = html.replace('</head>', `${ogTags}\n</head>`);

        // Guardar tanto en /dist/producto/<slug>/index.html como en /dist/producto/<slug>.html
        const productDir = path.resolve('dist', 'producto', p.slug);
        fs.mkdirSync(productDir, { recursive: true });
        fs.writeFileSync(path.join(productDir, 'index.html'), html, 'utf-8');

        // Y también crear el archivo HTML plano
        const flatHtmlPath = path.resolve('dist', 'producto', `${p.slug}.html`);
        fs.writeFileSync(flatHtmlPath, html, 'utf-8');

        count++;
    }

    console.log(`[Prerender] Generadas con éxito ${count} páginas estáticas de productos con Open Graph para WhatsApp y Google.`);
}

prerenderProducts();
