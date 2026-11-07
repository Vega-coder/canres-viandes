import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLongRight } from 'react-icons/hi2';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';

const DEFAULT_FALLBACK_CUTS = [
    {
        id: 'lomo-ancho-rib-eye',
        name: 'Lomo Ancho Rib Eye',
        brand: 'Res AAA',
        slug: 'lomo-ancho-rib-eye',
        price: 32.0,
        unit: 'kg',
        image: '/images/products/beef-ribeye.jpg',
        glow: 'bg-brand-red/35',
    },
    {
        id: 'punta-de-picanha-aaa',
        name: 'Punta de Picaña AAA',
        brand: 'Res AAA',
        slug: 'punta-de-picanha-aaa',
        price: 20.0,
        unit: 'kg',
        image: '/images/products/picanha.jpg',
        glow: 'bg-gold/30',
    },
    {
        id: 'chorizo-jarabe-de-cana',
        name: 'Chorizo con Jarabe de Caña',
        brand: 'Charcutería Artesanal',
        slug: 'chorizo-jarabe-de-cana',
        price: 8.0,
        unit: '450g',
        image: '/images/products/chorizo-artesanal.jpg',
        glow: 'bg-brand-wine/40',
    },
    {
        id: 'costilla-de-cerdo-baby',
        name: 'Costilla de Cerdo (Baby Back)',
        brand: 'Cerdo Selecto',
        slug: 'costilla-de-cerdo-baby',
        price: 12.0,
        unit: 'kg',
        image: '/images/products/pork-baby-ribs.jpg',
        glow: 'bg-brand-light/35',
    },
];

export default function Hero({ cuts = [] }) {
    const { t, formatMoney, formatUnit, translateNote, translateProduct } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const featuredCuts = useMemo(() => {
        if (Array.isArray(cuts) && cuts.length > 0) {
            return cuts.slice(0, 5).map((raw) => {
                const c = translateProduct(raw);
                return {
                    id: c.id,
                    name: c.name,
                    brand: c.brand || 'Boucherie CANRES',
                    slug: c.slug || c.id,
                    price: `${formatMoney(c.price)} ${formatUnit(c.unit)}`,
                    image: (Array.isArray(c.images) && c.images[0]) || '/images/products/beef-ribeye.jpg',
                    tag: (Array.isArray(c.notes) && c.notes[0] ? translateNote(c.notes[0]) : t('hero.featured_tag')),
                    glow: c.gender === 'cerdo' ? 'bg-brand-light/35' : c.gender === 'chorizos' ? 'bg-brand-wine/40' : 'bg-brand-red/35',
                };
            });
        }
        return DEFAULT_FALLBACK_CUTS.map((raw) => {
            const c = translateProduct(raw);
            return {
                ...c,
                price: `${formatMoney(c.price)} ${formatUnit(c.unit)}`,
                tag: t('hero.featured_tag'),
            };
        });
    }, [cuts, formatMoney, formatUnit, translateNote, translateProduct, t]);

    useEffect(() => {
        if (featuredCuts.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % featuredCuts.length);
        }, 4500);
        return () => clearInterval(timer);
    }, [featuredCuts.length]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: px * 12, y: -py * 12 });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
    };

    const activeCut = featuredCuts[currentIndex % featuredCuts.length] || featuredCuts[0];

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1A0B0C] via-[#2D0A0E] to-[#121212] text-cream-light py-5 sm:py-10 md:py-16">
            {/* Luces y velo ambiental */}
            <div className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-brand-red/25 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-brand-wine/30 blur-3xl" />

            <div className="container-luxe relative grid min-h-0 md:min-h-[420px] items-center gap-4 sm:gap-6 md:grid-cols-2 md:gap-12">
                {/* Texto principal */}
                <div className="animate-fade-up">
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/10 px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[9px] sm:text-[10.5px] font-bold tracking-[0.16em] sm:tracking-[0.2em] text-cream-light backdrop-blur border border-white/10 uppercase">
                        <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-brand-light animate-pulse" />
                        {t('hero.badge')}
                    </div>

                    <h1 className="mt-2.5 sm:mt-4 font-display text-2xl sm:text-4xl lg:text-6xl tracking-wide font-extrabold uppercase leading-tight sm:leading-[1.05] text-white">
                        {t('hero.title_line1')} <br className="hidden sm:inline" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-200 to-red-500">
                            {t('hero.title_line2')}
                        </span>
                    </h1>

                    <p className="mt-2 sm:mt-4 max-w-lg text-xs sm:text-base leading-relaxed text-cream/80 line-clamp-2 md:line-clamp-none">
                        {t('hero.description')}
                    </p>

                    <div className="mt-4 sm:mt-8 flex flex-row flex-wrap items-center gap-2.5 sm:gap-4">
                        <Link to="/tienda" className="btn-brand px-4 py-2.5 sm:px-6 sm:py-3.5 text-xs tracking-wider shadow-lg shadow-brand-red/30">
                            {t('hero.cta_explore')} <HiArrowLongRight className="h-4 w-4" />
                        </Link>
                        <Link to="/tienda/chorizos" className="btn-outline-light px-4 py-2.5 sm:px-6 sm:py-3.5 text-xs tracking-wider">
                            {t('hero.cta_charcuterie')}
                        </Link>
                    </div>

                    <div className="hidden md:grid mt-8 grid-cols-3 gap-3 border-t border-white/10 pt-6 text-left">
                        <div>
                            <span className="block font-display text-xl sm:text-2xl font-bold text-white">100%</span>
                            <span className="text-[10px] uppercase tracking-wider text-cream/70">{t('hero.stat_artisan')}</span>
                        </div>
                        <div>
                            <span className="block font-display text-xl sm:text-2xl font-bold text-brand-light">AAA</span>
                            <span className="text-[10px] uppercase tracking-wider text-cream/70">{t('hero.stat_cuts')}</span>
                        </div>
                        <div>
                            <span className="block font-display text-xl sm:text-2xl font-bold text-amber-400">{t('hero.custom_price')}</span>
                            <span className="text-[10px] uppercase tracking-wider text-cream/70">{t('hero.stat_custom')}</span>
                        </div>
                    </div>
                </div>

                {/* Tarjeta de producto dinámico 3D (visible en tablet y escritorio) */}
                <div className="hidden md:flex relative flex-col items-center justify-center">
                    <div
                        className="relative flex h-72 sm:h-80 md:h-[360px] w-full max-w-md items-center justify-center"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Halo glow */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className={`h-60 w-60 rounded-full ${activeCut.glow} blur-3xl transition-colors duration-700`} />
                        </div>

                        {/* Contenedor con efecto Tilt */}
                        <div
                            className="relative w-full h-full rounded-2xl overflow-hidden border border-white/15 bg-ink/70 p-4 backdrop-blur shadow-2xl transition-transform duration-200 ease-out flex flex-col justify-between"
                            style={{
                                transform: `perspective(800px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                            }}
                        >
                            {/* Imagen de fondo con transicion */}
                            <div className="relative h-48 sm:h-56 w-full rounded-xl overflow-hidden">
                                {featuredCuts.map((cut, index) => (
                                    <img
                                        key={cut.id}
                                        src={cut.image}
                                        alt={cut.name}
                                        className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                                            index === (currentIndex % featuredCuts.length) ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                                        }`}
                                    />
                                ))}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                                <span className="absolute top-3 left-3 rounded-full bg-brand-wine/90 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                                    {activeCut.tag}
                                </span>
                            </div>

                            {/* Detalles del corte */}
                            <div className="pt-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">{activeCut.brand}</p>
                                        <h3 className="font-display text-lg sm:text-xl font-bold uppercase text-white truncate max-w-[240px]">
                                            {activeCut.name}
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs uppercase text-cream/70 font-mono">{t('hero.from')}</p>
                                        <p className="font-display text-lg sm:text-xl font-extrabold text-white">{activeCut.price}</p>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                                    {/* Indicadores de rotación */}
                                    <div className="flex gap-1.5">
                                        {featuredCuts.map((cut, index) => (
                                            <button
                                                key={cut.id}
                                                type="button"
                                                onClick={() => setCurrentIndex(index)}
                                                className={`h-1.5 rounded-full transition-all ${
                                                    index === (currentIndex % featuredCuts.length) ? 'w-6 bg-brand-light' : 'w-2 bg-white/30'
                                                }`}
                                                aria-label={`Ver ${cut.name}`}
                                            />
                                        ))}
                                    </div>

                                    <Link
                                        to={`/producto/${activeCut.slug}`}
                                        className="text-xs font-bold text-white hover:text-brand-light flex items-center gap-1 transition"
                                    >
                                        {t('hero.view_cut')} <HiArrowLongRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
