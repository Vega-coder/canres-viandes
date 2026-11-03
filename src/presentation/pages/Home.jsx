import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '@/infrastructure/container.js';
import { useAsync } from '@/presentation/hooks/useAsync.js';
import Hero from '@/presentation/components/home/Hero.jsx';
import LuxuryTicker from '@/presentation/components/home/LuxuryTicker.jsx';
import GenderExplore from '@/presentation/components/home/GenderExplore.jsx';
import AromaExplore from '@/presentation/components/home/AromaExplore.jsx';
import CategoryCircles from '@/presentation/components/home/CategoryCircles.jsx';
import EditorialBanners from '@/presentation/components/home/EditorialBanners.jsx';
import BrandStatement from '@/presentation/components/home/BrandStatement.jsx';
import BrandCarousel from '@/presentation/components/home/BrandCarousel.jsx';
import SectionHeading from '@/presentation/components/ui/SectionHeading.jsx';
import ProductGrid, { ProductGridSkeleton } from '@/presentation/components/product/ProductGrid.jsx';

const TABS = [
    { id: 'all', label: 'Todos los Cortes' },
    { id: 'res', label: 'Res AAA' },
    { id: 'cerdo', label: 'Cerdo Selecto' },
    { id: 'pollo', label: 'Pollo de Granja' },
    { id: 'chorizos', label: 'Chorizos 100% Artesanales' },
    { id: 'canales', label: 'Mayoreo & Canales' },
];

export default function Home() {
    const { data, loading } = useAsync(() => useCases.getHomeShowcase(), []);
    const [selectedTab, setSelectedTab] = useState('all');

    const rawFeatured = data?.featured;
    const filteredProducts = useMemo(() => {
        const list = rawFeatured ?? [];
        if (selectedTab === 'all') return list;
        return list.filter((p) => p.gender === selectedTab);
    }, [rawFeatured, selectedTab]);

    return (
        <>
            <Hero />
            <LuxuryTicker />

            {/* Sección de Productos Destacados con Pestañas Interactivas */}
            <section className="container-luxe pt-10 pb-12 sm:pt-14 sm:pb-16">
                <SectionHeading eyebrow="Boucherie d'Exception" title="Cortes & Embutidos Destacados" />

                {/* Pestañas de filtrado dinámico */}
                <div className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                    {TABS.map((tab) => {
                        const isActive = selectedTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setSelectedTab(tab.id)}
                                className={`group relative flex items-center justify-center overflow-hidden rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-[11px] sm:text-xs font-bold tracking-[0.14em] uppercase select-none transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
                                    isActive
                                        ? 'bg-brand-wine text-white shadow-md ring-1 ring-brand-wine scale-105'
                                        : 'bg-white border border-cream text-ink/80 hover:border-brand-wine hover:text-brand-wine hover:scale-105 hover:shadow-sm'
                                }`}
                            >
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {loading ? (
                    <ProductGridSkeleton count={8} />
                ) : filteredProducts.length > 0 ? (
                    <ProductGrid products={filteredProducts} />
                ) : (
                    <div className="rounded-xl border border-dashed border-cream bg-white/50 p-10 text-center">
                        <p className="text-sm text-taupe">No encontramos productos en esta pestaña ahora mismo.</p>
                        <button
                            type="button"
                            onClick={() => setSelectedTab('all')}
                            className="btn-brand mt-4 text-[10px]"
                        >
                            Ver todos los cortes
                        </button>
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Link to="/tienda" className="btn-brand px-8 py-3.5 text-xs transition-transform hover:scale-105 shadow-md">
                        Ver Catálogo Completo
                    </Link>
                </div>
            </section>

            <AromaExplore />
            <GenderExplore />
            <CategoryCircles />

            <EditorialBanners />

            {data?.newArrivals?.length > 0 && (
                <section className="bg-cream/40 py-16">
                    <div className="container-luxe">
                        <SectionHeading eyebrow="Frescura del Día" title="Novedades de la Carnicería" />
                        <ProductGrid products={data.newArrivals} />
                    </div>
                </section>
            )}

            {/* Líneas de producto */}
            <BrandCarousel brands={data?.brands} />

            <BrandStatement />
        </>
    );
}
