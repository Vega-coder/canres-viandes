import { Link } from 'react-router-dom';
import { brandToSlug } from '@/domain/catalog/brands.js';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import { BRAND_TRANSLATIONS } from '@/presentation/i18n/productTranslations.js';

export default function BrandCarousel({ brands = [] }) {
    const { t, language } = useLanguage();
    if (!Array.isArray(brands) || brands.length === 0) return null;

    const brandDict = BRAND_TRANSLATIONS[language] || {};

    const list = brands.map((b) => {
        if (!b) return null;
        if (typeof b === 'string') {
            const slug = brandToSlug(b);
            const localizedName = brandDict[b] || b;
            return {
                name: localizedName,
                slug,
                count: null,
            };
        }
        const originalName = b?.name || '';
        const localizedName = brandDict[originalName] || originalName;
        return {
            name: localizedName,
            slug: b?.slug || brandToSlug(originalName),
            count: b?.count ?? null,
        };
    }).filter(Boolean);

    return (
        <section className="bg-white py-12 border-y border-cream overflow-hidden">
            <div className="container-luxe">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="eyebrow text-brand-wine font-bold">{t('brandCarousel.eyebrow')}</p>
                        <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-ink">
                            {t('brandCarousel.title')}
                        </h2>
                    </div>
                    <Link to="/marcas" className="text-xs font-bold uppercase text-brand-wine hover:underline">
                        {t('brandCarousel.view_all')}
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {list.map((b) => {
                        const slug = (b.slug || '').toLowerCase();
                        const emoji = slug.includes('res')
                            ? '🐂'
                            : slug.includes('cerdo')
                            ? '🐖'
                            : slug.includes('aves') || slug.includes('granja') || slug.includes('pollo')
                            ? '🐓'
                            : slug.includes('chivo') || slug.includes('cordero')
                            ? '🐐'
                            : '🌭';
                        return (
                            <Link
                                key={slug || b.name}
                                to={`/marcas/${slug}`}
                                className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-cream-light/50 border border-cream hover:border-brand-wine hover:bg-white hover:shadow-lg transition-all duration-300 text-center"
                            >
                                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                                    {emoji}
                                </span>
                                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink group-hover:text-brand-wine transition">
                                    {b.name}
                                </h3>
                                {b.count != null && (
                                    <span className="mt-1 text-[11px] text-taupe font-medium">
                                        {b.count} {b.count === 1 ? t('brandCarousel.product') : t('brandCarousel.products')}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
