import { Link } from 'react-router-dom';
import { brandToSlug } from '@/domain/catalog/brands.js';

export default function BrandCarousel({ brands = [] }) {
    if (!brands || brands.length === 0) return null;

    return (
        <section className="bg-white py-12 border-y border-cream overflow-hidden">
            <div className="container-luxe">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="eyebrow text-brand-wine font-bold">Nuestras Selecciones</p>
                        <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-ink">
                            Líneas de Origen & Calidad
                        </h2>
                    </div>
                    <Link to="/marcas" className="text-xs font-bold uppercase text-brand-wine hover:underline">
                        Ver todas las líneas →
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {brands.map((b) => (
                        <Link
                            key={b.slug}
                            to={`/marcas/${b.slug}`}
                            className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-cream-light/50 border border-cream hover:border-brand-wine hover:bg-white hover:shadow-lg transition-all duration-300 text-center"
                        >
                            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                                {b.slug.includes('res') ? '🐂' : b.slug.includes('cerdo') ? '🐖' : b.slug.includes('aves') ? '🐓' : b.slug.includes('chivo') ? '🐐' : '🌭'}
                            </span>
                            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink group-hover:text-brand-wine transition">
                                {b.name}
                            </h3>
                            <span className="mt-1 text-[11px] text-taupe font-medium">
                                {b.count} {b.count === 1 ? 'producto' : 'productos'}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
