import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';

export default function GenderExplore() {
    const { t } = useLanguage();

    const specialties = useMemo(
        () => [
            {
                title: t('specialties.beef_title'),
                subtitle: t('specialties.beef_sub'),
                to: '/tienda/res',
                image: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/meat_beef_cut.jpg',
                alt: t('specialties.beef_title'),
                badge: t('specialties.beef_badge'),
            },
            {
                title: t('specialties.pork_title'),
                subtitle: t('specialties.pork_sub'),
                to: '/tienda/cerdo',
                image: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739784/canres-viandes/porkbelly.jpg',
                alt: t('specialties.pork_title'),
                badge: t('specialties.pork_badge'),
            },
            {
                title: t('specialties.sausage_title'),
                subtitle: t('specialties.sausage_sub'),
                to: '/tienda/chorizos',
                image: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/chorizos.jpg',
                alt: t('specialties.sausage_title'),
                badge: t('specialties.sausage_badge'),
                highlight: true,
            },
            {
                title: t('specialties.poultry_title'),
                subtitle: t('specialties.poultry_sub'),
                to: '/tienda/pollo',
                image: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739781/canres-viandes/butcher.jpg',
                alt: t('specialties.poultry_title'),
                badge: t('specialties.poultry_badge'),
            },
            {
                title: t('specialties.goat_title'),
                subtitle: t('specialties.goat_sub'),
                to: '/tienda/chivo',
                image: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg',
                alt: t('specialties.goat_title'),
                badge: t('specialties.goat_badge'),
            },
        ],
        [t],
    );

    return (
        <section className="container-luxe py-10 sm:py-14">
            <div className="text-center mb-8">
                <p className="eyebrow text-gold-dark font-bold">{t('specialties.eyebrow')}</p>
                <h2 className="mt-1 font-display text-2xl font-bold uppercase tracking-[0.16em] text-ink sm:text-3xl">
                    {t('specialties.title')}
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-taupe">
                    {t('specialties.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {specialties.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                            item.highlight
                                ? 'border-gold shadow-md ring-1 ring-gold/40'
                                : 'border-cream hover:border-brand-wine/40'
                        }`}
                    >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-paper">
                            <img
                                src={item.image}
                                alt={item.alt}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <span
                                className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                    item.highlight
                                        ? 'bg-gold text-ink font-black shadow-xs'
                                        : 'bg-ink/80 text-white backdrop-blur-xs'
                                }`}
                            >
                                {item.badge}
                            </span>
                        </div>

                        <div className="p-3 text-center flex-1 flex flex-col justify-center">
                            <h3 className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-ink group-hover:text-brand-wine transition">
                                {item.title}
                            </h3>
                            <p className="mt-0.5 text-[10.5px] text-taupe font-medium truncate">
                                {item.subtitle}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
