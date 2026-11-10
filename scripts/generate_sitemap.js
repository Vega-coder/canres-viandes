import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Leer variables de .env manualmente sin dependencias extra
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

const STATIC_ROUTES = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/tienda', priority: '0.9', changefreq: 'daily' },
    { loc: '/tienda/res', priority: '0.9', changefreq: 'daily' },
    { loc: '/tienda/cerdo', priority: '0.9', changefreq: 'daily' },
    { loc: '/tienda/pollo', priority: '0.9', changefreq: 'daily' },
    { loc: '/tienda/chivo', priority: '0.8', changefreq: 'weekly' },
    { loc: '/tienda/chorizos', priority: '0.9', changefreq: 'daily' },
    { loc: '/tienda/canales', priority: '0.8', changefreq: 'weekly' },
    { loc: '/tienda/personalizados', priority: '0.8', changefreq: 'weekly' },
    { loc: '/marcas', priority: '0.7', changefreq: 'weekly' },
    { loc: '/terminos', priority: '0.6', changefreq: 'monthly' },
];

async function generate() {
    const today = new Date().toISOString().split('T')[0];
    let productUrls = [];

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data, error } = await supabase
            .from('products')
            .select('slug, created_at, is_active')
            .eq('is_active', true);

        if (!error && Array.isArray(data) && data.length > 0) {
            productUrls = data
                .filter((p) => p.slug)
                .map((p) => ({
                    loc: `/producto/${p.slug}`,
                    lastmod: p.created_at ? p.created_at.split('T')[0] : today,
                    priority: '0.8',
                    changefreq: 'weekly',
                }));
            console.log(`[Sitemap] Obtenidos ${productUrls.length} productos activos de Supabase.`);
        } else {
            throw new Error(error?.message || 'No se recibieron productos de Supabase');
        }
    } catch (err) {
        console.warn(`[Sitemap] Fallback a seedProducts: ${err.message}`);
        try {
            const { SEED_PRODUCTS } = await import('../src/infrastructure/data/seedProducts.js');
            productUrls = (SEED_PRODUCTS || [])
                .filter((p) => p.slug)
                .map((p) => ({
                    loc: `/producto/${p.slug}`,
                    lastmod: today,
                    priority: '0.8',
                    changefreq: 'weekly',
                }));
            console.log(`[Sitemap] Obtenidos ${productUrls.length} productos desde seedProducts.js.`);
        } catch (seedErr) {
            console.error('[Sitemap] Error al cargar seedProducts:', seedErr.message);
        }
    }

    const allUrls = [
        ...STATIC_ROUTES.map((r) => ({
            ...r,
            lastmod: today,
        })),
        ...productUrls,
    ];

    const xmlLines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ];

    for (const item of allUrls) {
        xmlLines.push('  <url>');
        xmlLines.push(`    <loc>${BASE_URL}${item.loc}</loc>`);
        xmlLines.push(`    <lastmod>${item.lastmod}</lastmod>`);
        xmlLines.push(`    <changefreq>${item.changefreq}</changefreq>`);
        xmlLines.push(`    <priority>${item.priority}</priority>`);
        xmlLines.push('  </url>');
    }

    xmlLines.push('</urlset>');
    xmlLines.push('');

    const xmlContent = xmlLines.join('\n');
    const publicPath = path.resolve('public', 'sitemap.xml');
    fs.writeFileSync(publicPath, xmlContent, 'utf-8');
    console.log(`[Sitemap] Guardado en ${publicPath} (${allUrls.length} URLs totales).`);

    const distPath = path.resolve('dist', 'sitemap.xml');
    if (fs.existsSync('dist')) {
        fs.writeFileSync(distPath, xmlContent, 'utf-8');
        console.log(`[Sitemap] Sincronizado en ${distPath}.`);
    }
}

generate();
