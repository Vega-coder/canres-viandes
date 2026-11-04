import { Link } from 'react-router-dom';
import ProductGrid from '@/presentation/components/product/ProductGrid.jsx';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import { HiSparkles, HiCheckCircle, HiArrowRight } from 'react-icons/hi2';

export default function ChorizosShowcase({ chorizos = [], customProduct = null }) {
    const { t } = useLanguage();
    if (!chorizos.length) return null;

    return (
        <section id="seccion-chorizos" className="relative overflow-hidden bg-gradient-to-b from-[#1C0507] via-[#2A0609] to-ink py-16 sm:py-24 text-white border-y-2 border-gold/40">
            {/* Decoración de fondo */}
            <div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-brand-wine/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />

            <div className="container-luxe relative z-10">
                {/* Cabecera de la sección especializada */}
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-gold-light shadow-sm">
                        <HiSparkles className="h-4 w-4 text-gold" />
                        <span>{t('chorizosSection.specialty_badge')}</span>
                    </div>

                    <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wide text-white drop-shadow-md">
                        {t('chorizosSection.title')}
                    </h2>

                    <p className="mt-4 text-sm sm:text-base text-cream-paper/90 leading-relaxed">
                        {t('chorizosSection.description')}
                    </p>

                    {/* 4 Pilares de Calidad Artesanal */}
                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur-xs">
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                                <HiCheckCircle className="h-4 w-4 shrink-0 text-gold" /> {t('chorizosSection.p1_title')}
                            </span>
                            <p className="mt-1 text-[11px] text-cream-paper/70 leading-normal">
                                {t('chorizosSection.p1_desc')}
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur-xs">
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                                <HiCheckCircle className="h-4 w-4 shrink-0 text-gold" /> {t('chorizosSection.p2_title')}
                            </span>
                            <p className="mt-1 text-[11px] text-cream-paper/70 leading-normal">
                                {t('chorizosSection.p2_desc')}
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur-xs">
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                                <HiCheckCircle className="h-4 w-4 shrink-0 text-gold" /> {t('chorizosSection.p3_title')}
                            </span>
                            <p className="mt-1 text-[11px] text-cream-paper/70 leading-normal">
                                {t('chorizosSection.p3_desc')}
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur-xs">
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                                <HiCheckCircle className="h-4 w-4 shrink-0 text-gold" /> {t('chorizosSection.p4_title')}
                            </span>
                            <p className="mt-1 text-[11px] text-cream-paper/70 leading-normal">
                                {t('chorizosSection.p4_desc')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grid de productos de chorizos */}
                <div className="mt-12">
                    <ProductGrid products={chorizos.slice(0, 8)} />
                </div>

                {/* Banner de Chorizos Personalizados al Gusto */}
                <div className="mt-12 rounded-2xl border border-gold/40 bg-gradient-to-r from-brand-wine/80 via-black/80 to-[#1A0406] p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 text-center md:text-left">
                        <span className="rounded-full bg-gold/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold border border-gold/40">
                            {t('chorizosSection.banner_badge')}
                        </span>
                        <h3 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-white">
                            {t('chorizosSection.banner_title')}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-cream-paper/80 max-w-xl">
                            {t('chorizosSection.banner_desc')}
                        </p>
                    </div>

                    <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                        <Link
                            to="/producto/chorizos-personalizados"
                            className="btn-gold px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition"
                        >
                            <span>{t('chorizosSection.banner_cta_custom')}</span>
                            <HiArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            to="/tienda/chorizos"
                            className="btn-outline-light px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/10 transition"
                        >
                            <span>{t('chorizosSection.banner_cta_all', { count: chorizos.length })}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
