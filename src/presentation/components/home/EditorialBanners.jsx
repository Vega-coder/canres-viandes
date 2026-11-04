import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Monogram from '@/presentation/components/brand/Monogram.jsx';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';

export default function EditorialBanners() {
    const { t } = useLanguage();

    const banners = useMemo(
        () => [
            {
                theme: 'dark',
                eyebrow: t('editorialBanners.b1_eyebrow'),
                title: t('editorialBanners.b1_title'),
                to: '/tienda/res',
                cta: t('editorialBanners.b1_cta'),
                image: '/images/products/beef-ribeye.jpg',
                alt: t('editorialBanners.b1_title'),
            },
            {
                theme: 'wine',
                eyebrow: t('editorialBanners.b2_eyebrow'),
                title: t('editorialBanners.b2_title'),
                to: '/producto/chorizos-personalizados',
                cta: t('editorialBanners.b2_cta'),
                image: '/images/products/chorizo-artesanal.jpg',
                alt: t('editorialBanners.b2_title'),
            },
            {
                theme: 'dark',
                eyebrow: t('editorialBanners.b3_eyebrow'),
                title: t('editorialBanners.b3_title'),
                to: '/tienda/canales',
                cta: t('editorialBanners.b3_cta'),
                image: '/images/products/beef-butcher-cuts.jpg',
                alt: t('editorialBanners.b3_title'),
            },
        ],
        [t],
    );

    return (
        <section className="container-luxe grid gap-6 py-12 md:grid-cols-3">
            {banners.map((b) => {
                const isWine = b.theme === 'wine';
                return (
                    <Link
                        key={b.title}
                        to={b.to}
                        className={`group relative flex min-h-[460px] flex-col justify-between overflow-hidden rounded-2xl p-8 text-center shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                            isWine
                                ? 'bg-gradient-to-b from-brand-wine via-[#4A0A0C] to-ink text-white border border-brand-red/40'
                                : 'bg-gradient-to-b from-ink via-[#1C1A1A] to-black text-white border border-white/10'
                        }`}
                    >
                        <div className="relative z-10 flex flex-col items-center">
                            <Monogram className="h-10 w-auto opacity-95 transition-opacity group-hover:opacity-100 drop-shadow-sm" variant="light" />
                            <p className="eyebrow mt-4 text-white font-bold">{b.eyebrow}</p>
                            <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                                {b.title}
                            </h3>
                        </div>

                        <div className="relative z-10 my-4 flex h-48 w-full items-center justify-center overflow-hidden rounded-xl">
                            <img
                                src={b.image}
                                alt={b.alt}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>

                        <div className="relative z-10">
                            <span className="inline-block rounded-full bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur transition-all group-hover:bg-brand-light group-hover:text-ink">
                                {b.cta} →
                            </span>
                        </div>
                    </Link>
                );
            })}
        </section>
    );
}
