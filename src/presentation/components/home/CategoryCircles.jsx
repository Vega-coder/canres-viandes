import { Link } from 'react-router-dom';
import { CATEGORIES } from '@/domain/catalog/categories.js';
import SectionHeading from '@/presentation/components/ui/SectionHeading.jsx';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';

const CATEGORY_IMAGES = {
    res: '/images/products/beef-ribeye.jpg',
    cerdo: '/images/products/pork-baby-ribs.jpg',
    pollo: '/images/products/chicken-breasts.jpg',
    chivo: '/images/products/lamb-shank.jpg',
    chorizos: '/images/products/chorizo-artesanal.jpg',
    canales: '/images/products/beef-butcher-cuts.jpg',
    personalizados: '/images/products/chorizo-bbq.jpg',
};

export default function CategoryCircles() {
    const { t, getCategoryLabel } = useLanguage();

    return (
        <section className="container-luxe py-8 sm:py-12 overflow-hidden">
            <SectionHeading
                eyebrow={t('categoryCircles.eyebrow')}
                title={t('categoryCircles.title')}
            />

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-6">
                {CATEGORIES.map((cat) => {
                    const img = CATEGORY_IMAGES[cat.slug] || CATEGORY_IMAGES.res;
                    const shortName = getCategoryLabel(cat.slug, true);
                    const fullName = getCategoryLabel(cat.slug, false);

                    return (
                        <Link
                            key={cat.slug}
                            to={`/tienda/${cat.slug}`}
                            className="group flex flex-col items-center text-center transition hover:-translate-y-1"
                        >
                            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden border-2 border-brand-wine/20 group-hover:border-brand-wine shadow-md group-hover:shadow-xl transition-all duration-300">
                                <img
                                    src={img}
                                    alt={fullName}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-115"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-brand-wine/50 transition-colors" />
                            </div>
                            <span className="mt-3 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-ink group-hover:text-brand-wine transition">
                                {shortName}
                            </span>
                            <span className="text-[10px] text-taupe uppercase tracking-widest hidden sm:block">
                                {t('categoryCircles.view_cuts')}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
