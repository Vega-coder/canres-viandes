import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft, HiOutlineSparkles, HiOutlineTag } from 'react-icons/hi2';
import { useCases } from '@/infrastructure/container.js';
import SortDropdown from '@/presentation/components/catalog/SortDropdown.jsx';
import { useAsync } from '@/presentation/hooks/useAsync.js';
import BrandLogo from '@/presentation/components/brand/BrandLogo.jsx';
import ProductGrid, { ProductGridSkeleton } from '@/presentation/components/product/ProductGrid.jsx';
import NotFound from './NotFound.jsx';

export default function BrandDetail() {
    const { brandSlug } = useParams();
    const [sort, setSort] = useState('featured');

    const { data, loading, error } = useAsync(
        () => useCases.getBrandDetail(brandSlug, { sort }),
        [brandSlug, sort],
    );

    if (!loading && !data?.brand) {
        return <NotFound />;
    }

    const brand = data?.brand;
    const products = data?.products ?? [];

    return (
        <div className="bg-cream-light/30 min-h-screen py-10 sm:py-14">
            <div className="container-luxe">
                <nav className="flex items-center justify-between text-xs text-taupe mb-8">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="hover:text-brand-wine transition">Inicio</Link>
                        <span>/</span>
                        <Link to="/marcas" className="hover:text-brand-wine transition">Líneas</Link>
                        <span>/</span>
                        <span className="text-ink font-bold">{brand?.name || 'Cargando…'}</span>
                    </div>

                    <Link
                        to="/marcas"
                        className="flex items-center gap-1.5 font-bold hover:text-brand-wine transition"
                    >
                        <HiArrowLeft className="h-3.5 w-3.5" />
                        <span>Todas las líneas</span>
                    </Link>
                </nav>

                {brand && (
                    <header className="rounded-2xl border border-cream bg-white p-6 sm:p-10 shadow-sm mb-12">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div className="flex h-32 w-48 shrink-0 items-center justify-center rounded-xl bg-cream/40 p-6 text-ink ring-1 ring-cream">
                                <BrandLogo brand={brand} className="h-20 w-auto" />
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-[0.15em] text-ink">
                                        {brand.name}
                                    </h1>
                                    <span className="rounded-full bg-brand-wine/10 px-3 py-1 text-xs font-bold text-brand-wine">
                                        {products.length} {products.length === 1 ? 'corte disponible' : 'cortes disponibles'}
                                    </span>
                                </div>

                                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-taupe">
                                    {brand.country} {brand.founded ? `· ${brand.founded}` : ''}
                                </p>

                                {brand.tagline && (
                                    <p className="mt-3 text-sm font-semibold italic text-brand-wine">
                                        “{brand.tagline}”
                                    </p>
                                )}

                                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-taupe max-w-3xl">
                                    {brand.description}
                                </p>
                            </div>
                        </div>
                    </header>
                )}

                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream pb-4">
                    <div>
                        <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                            <HiOutlineSparkles className="h-5 w-5 text-brand-wine" />
                            Selección {brand?.name}
                        </h2>
                        <p className="text-xs text-taupe mt-0.5">
                            {loading ? 'Cargando cortes…' : `Mostrando ${products.length} productos frescos`}
                        </p>
                    </div>

                    <SortDropdown
                        value={sort}
                        onChange={setSort}
                    />
                </div>

                {loading && <ProductGridSkeleton count={8} />}

                {error && (
                    <div className="py-20 text-center text-taupe">
                        <p>No pudimos cargar los cortes de esta línea. Intenta de nuevo.</p>
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className="py-20 text-center rounded-2xl border border-cream bg-white p-8">
                        <HiOutlineTag className="mx-auto h-12 w-12 text-taupe/40" />
                        <h3 className="mt-4 font-display text-xl text-ink">
                            No hay cortes disponibles de {brand?.name} en este momento
                        </h3>
                        <Link to="/tienda" className="btn-brand mt-6 inline-block">
                            Ver toda la carnicería
                        </Link>
                    </div>
                )}

                {!loading && !error && products.length > 0 && (
                    <ProductGrid products={products} columns="lg:grid-cols-4" />
                )}
            </div>
        </div>
    );
}
