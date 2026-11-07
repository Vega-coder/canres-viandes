import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass, HiArrowRight, HiOutlineSparkles } from 'react-icons/hi2';
import { useCases } from '@/infrastructure/container.js';
import { useAsync } from '@/presentation/hooks/useAsync.js';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import BrandLogo from '@/presentation/components/brand/BrandLogo.jsx';
import { BRAND_TRANSLATIONS } from '@/presentation/i18n/productTranslations.js';

export default function Brands() {
    const { t, language } = useLanguage();
    const [search, setSearch] = useState('');
    const { data, loading, error } = useAsync(() => useCases.getBrandsCatalog(), []);

    const brandDict = BRAND_TRANSLATIONS[language] || {};
    const rawBrands = data?.brands;

    const filteredBrands = useMemo(() => {
        const brands = Array.isArray(rawBrands) ? rawBrands : [];
        const q = search.trim().toLowerCase();
        const localized = brands.map((b) => ({
            ...b,
            name: brandDict[b?.name] || b?.name,
        }));

        if (!q) return localized;
        return localized.filter(
            (b) =>
                (b?.name || '').toLowerCase().includes(q) ||
                (b?.country || '').toLowerCase().includes(q) ||
                (b?.description || '').toLowerCase().includes(q) ||
                (b?.tagline || '').toLowerCase().includes(q)
        );
    }, [rawBrands, search, brandDict]);

    return (
        <div className="bg-cream-light/40 min-h-screen py-12 sm:py-16">
            <div className="container-luxe">
                <header className="mx-auto max-w-3xl text-center">
                    <p className="eyebrow text-brand-wine flex items-center justify-center gap-2 font-bold">
                        <HiOutlineSparkles className="h-3.5 w-3.5" />
                        {t('brandsPage.eyebrow')}
                    </p>
                    <h1 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-[0.16em] text-ink sm:text-4xl md:text-5xl">
                        {t('brandsPage.title')}
                    </h1>
                    <div className="mx-auto mt-4 h-1 w-20 bg-brand-wine" />
                    <p className="mt-6 text-sm leading-relaxed text-taupe sm:text-base">
                        {t('brandsPage.description')}
                    </p>

                    <div className="relative mx-auto mt-8 max-w-md">
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('brandsPage.search_placeholder')}
                            className="input w-full py-3 pl-11 pr-4 text-xs shadow-sm rounded-xl"
                            aria-label={t('brandsPage.search_aria')}
                        />
                        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-taupe" />
                    </div>
                </header>

                {loading && (
                    <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 6 }, (_, i) => (
                            <div key={i} className="animate-pulse rounded-2xl border border-cream bg-white p-6 shadow-sm">
                                <div className="h-24 rounded-lg bg-cream/40" />
                                <div className="mt-5 h-4 w-1/2 rounded bg-cream/60" />
                                <div className="mt-3 h-3 w-1/3 rounded bg-cream/40" />
                                <div className="mt-4 h-12 w-full rounded bg-cream/30" />
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="mt-16 text-center text-taupe">
                        <p>{t('brandsPage.error')}</p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="btn-outline mt-4"
                        >
                            {t('brandsPage.retry')}
                        </button>
                    </div>
                )}

                {!loading && !error && filteredBrands.length > 0 && (
                    <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredBrands.map((b) => (
                            <Link
                                key={b.slug || b.name}
                                to={`/marcas/${b.slug}`}
                                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-cream bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-wine hover:shadow-xl"
                            >
                                <div>
                                    <div className="flex h-28 w-full items-center justify-center rounded-xl bg-gradient-to-b from-cream/40 to-cream/10 p-4 text-ink transition-colors duration-300 group-hover:text-brand-wine">
                                        <BrandLogo brand={b} className="h-16 w-auto transition-transform duration-300 group-hover:scale-105" />
                                    </div>

                                    <div className="mt-5">
                                        <div className="flex items-center justify-between gap-2">
                                            <h2 className="font-display text-xl font-bold uppercase text-ink transition-colors group-hover:text-brand-wine">
                                                {b.name}
                                            </h2>
                                            <span className="rounded-full bg-brand-wine/10 px-2.5 py-0.5 text-[10px] font-bold text-brand-wine">
                                                {b.count ?? 1} {(b.count ?? 1) === 1 ? t('brandsPage.cut') : t('brandsPage.cuts')}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-taupe">
                                            {b.country || 'Québec, Canada'}
                                        </p>

                                        <p className="mt-3 text-xs leading-relaxed text-taupe line-clamp-3">
                                            {b.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 border-t border-cream pt-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink transition-colors group-hover:text-brand-wine">
                                    <span>{t('brandsPage.explore_cuts')}</span>
                                    <HiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
