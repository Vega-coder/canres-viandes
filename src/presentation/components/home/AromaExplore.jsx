import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';

export default function AromaExplore() {
    const { t } = useLanguage();

    const styles = useMemo(
        () => [
            {
                title: t('aromaExplore.styles.grill_title'),
                tag: t('aromaExplore.styles.grill_tag'),
                to: '/tienda?q=parrilla',
                image: '/images/products/beef-ribeye.jpg',
                alt: t('aromaExplore.styles.grill_alt'),
            },
            {
                title: t('aromaExplore.styles.charcuterie_title'),
                tag: t('aromaExplore.styles.charcuterie_tag'),
                to: '/tienda/chorizos',
                image: '/images/products/chorizo-artesanal.jpg',
                alt: t('aromaExplore.styles.charcuterie_alt'),
            },
            {
                title: t('aromaExplore.styles.bbq_title'),
                tag: t('aromaExplore.styles.bbq_tag'),
                to: '/tienda?q=bbq',
                image: '/images/products/pork-baby-ribs.jpg',
                alt: t('aromaExplore.styles.bbq_alt'),
            },
            {
                title: t('aromaExplore.styles.oven_title'),
                tag: t('aromaExplore.styles.oven_tag'),
                to: '/tienda?q=horno',
                image: '/images/products/lamb-shank.jpg',
                alt: t('aromaExplore.styles.oven_alt'),
            },
            {
                title: t('aromaExplore.styles.skillet_title'),
                tag: t('aromaExplore.styles.skillet_tag'),
                to: '/tienda?q=sarten',
                image: '/images/products/beef-newyork.jpg',
                alt: t('aromaExplore.styles.skillet_alt'),
            },
            {
                title: t('aromaExplore.styles.tradition_title'),
                tag: t('aromaExplore.styles.tradition_tag'),
                to: '/tienda?q=colombiana',
                image: '/images/products/beef-sobrebarriga.jpg',
                alt: t('aromaExplore.styles.tradition_alt'),
            },
        ],
        [t],
    );

    return (
        <section className="bg-cream-light py-12 sm:py-16">
            <div className="container-luxe">
                <div className="text-center">
                    <p className="eyebrow text-brand-wine font-bold">{t('aromaExplore.eyebrow')}</p>
                    <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-ink">
                        {t('aromaExplore.title')}
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-taupe">
                        {t('aromaExplore.subtitle')}
                    </p>
                </div>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {styles.map((st) => (
                        <Link
                            key={st.title}
                            to={st.to}
                            className="group relative h-64 overflow-hidden rounded-2xl shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <img
                                src={st.image}
                                alt={st.alt}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                            <div className="absolute bottom-5 left-5 right-5 text-cream-light">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                                    {st.tag}
                                </span>
                                <h3 className="mt-1 font-display text-xl font-bold uppercase tracking-wider text-white">
                                    {st.title}
                                </h3>
                                <span className="mt-2 inline-flex items-center text-xs font-semibold text-brand-light group-hover:underline">
                                    {t('aromaExplore.view_products')}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
