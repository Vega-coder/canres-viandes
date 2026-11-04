import { Link } from 'react-router-dom';
import ProductGrid from '@/presentation/components/product/ProductGrid.jsx';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import { HiArrowRight } from 'react-icons/hi2';

export default function MeatCategorySection({
    id,
    eyebrow,
    title,
    description,
    products = [],
    categorySlug,
    categoryLabel,
    totalCount,
    bgClass = 'bg-white',
    badgeText,
    icon,
}) {
    const { t } = useLanguage();
    if (!products.length) return null;

    const count = totalCount ?? products.length;

    return (
        <section id={id} className={`py-14 sm:py-20 border-b border-taupe/10 ${bgClass}`}>
            <div className="container-luxe">
                {/* Cabecera de la sección */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-wine">
                            {icon && <span className="text-base">{icon}</span>}
                            <span>{eyebrow}</span>
                            {badgeText && (
                                <span className="ml-2 rounded-full bg-brand-wine/10 px-2.5 py-0.5 text-[9px] font-extrabold text-brand-wine border border-brand-wine/20">
                                    {badgeText}
                                </span>
                            )}
                        </div>
                        <h2 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-wide text-ink">
                            {title}
                        </h2>
                        {description && (
                            <p className="mt-2 text-xs sm:text-sm text-taupe max-w-2xl leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>

                    <Link
                        to={`/tienda/${categorySlug}`}
                        className="group inline-flex items-center gap-2 self-start md:self-end font-semibold text-xs uppercase tracking-wider text-brand-wine hover:text-brand-red transition whitespace-nowrap"
                    >
                        <span>
                            {t('homeSections.view_all_prefix')} {categoryLabel} ({count})
                        </span>
                        <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Grid de productos */}
                <ProductGrid products={products.slice(0, 4)} />

                {/* Botón inferior para móviles y tablets */}
                <div className="mt-8 text-center md:hidden">
                    <Link
                        to={`/tienda/${categorySlug}`}
                        className="btn-outline w-full py-3 text-xs font-bold uppercase tracking-wider"
                    >
                        {t('homeSections.view_all_cuts', { category: categoryLabel, count })}
                    </Link>
                </div>
            </div>
        </section>
    );
}
