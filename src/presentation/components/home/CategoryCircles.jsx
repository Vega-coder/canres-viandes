import { Link } from 'react-router-dom';
import { CATEGORIES } from '@/domain/catalog/categories.js';
import SectionHeading from '@/presentation/components/ui/SectionHeading.jsx';

const CATEGORY_IMAGES = {
    res: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/meat_beef_cut.jpg',
    cerdo: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739785/canres-viandes/ribs.jpg',
    pollo: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739781/canres-viandes/butcher.jpg',
    chivo: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg',
    chorizos: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/chorizos.jpg',
    canales: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg',
    personalizados: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/chorizos.jpg',
};

export default function CategoryCircles() {
    return (
        <section className="container-luxe py-8 sm:py-12 overflow-hidden">
            <SectionHeading eyebrow="Boucherie Artisanale" title="Categorías de Carnes & Embutidos" />

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-6">
                {CATEGORIES.map((cat) => {
                    const img = CATEGORY_IMAGES[cat.slug] || CATEGORY_IMAGES.res;
                    return (
                        <Link
                            key={cat.slug}
                            to={`/tienda/${cat.slug}`}
                            className="group flex flex-col items-center text-center transition hover:-translate-y-1"
                        >
                            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden border-2 border-brand-wine/20 group-hover:border-brand-wine shadow-md group-hover:shadow-xl transition-all duration-300">
                                <img
                                    src={img}
                                    alt={cat.label}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-115"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-brand-wine/50 transition-colors" />
                            </div>
                            <span className="mt-3 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-ink group-hover:text-brand-wine transition">
                                {cat.short}
                            </span>
                            <span className="text-[10px] text-taupe uppercase tracking-widest hidden sm:block">
                                Ver cortes
                            </span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
