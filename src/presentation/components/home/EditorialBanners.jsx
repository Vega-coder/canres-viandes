import { Link } from 'react-router-dom';
import Monogram from '@/presentation/components/brand/Monogram.jsx';

const BANNERS = [
    {
        theme: 'dark',
        eyebrow: 'Parrilla & Brasa',
        title: 'Cortes de Res AAA & Reservas Sterling',
        to: '/tienda/res',
        cta: 'Explorar Cortes de Res',
        image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80',
        alt: 'Ribeye AAA y cortes premium',
    },
    {
        theme: 'wine',
        eyebrow: 'Exclusivo CANRES',
        title: 'Chorizos Personalizados a Medida',
        to: '/producto/chorizos-personalizados',
        cta: 'Crear mi receta (desde 16$/kg)',
        image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80',
        alt: 'Chorizos artesanales personalizados',
    },
    {
        theme: 'dark',
        eyebrow: 'Mayoreo & Eventos',
        title: 'Medias Canales & Cajas de Ahorro Familiar',
        to: '/tienda/canales',
        cta: 'Ver Precios Mayoristas',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        alt: 'Medias canales y cajas de carne',
    },
];

export default function EditorialBanners() {
    return (
        <section className="container-luxe grid gap-6 py-12 md:grid-cols-3">
            {BANNERS.map((b) => {
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
                            <Monogram className="h-10 w-auto opacity-80" variant="light" />
                            <p className="eyebrow mt-4 text-amber-300 font-bold">{b.eyebrow}</p>
                            <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                                {b.title}
                            </h3>
                        </div>

                        <div className="relative z-10 my-4 flex h-48 w-full items-center justify-center overflow-hidden rounded-xl">
                            <img
                                src={b.image}
                                alt={b.alt}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-xl"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        </div>

                        <div className="relative z-10">
                            <span className={isWine ? 'btn-gold w-full text-xs' : 'btn-outline-light w-full text-xs'}>
                                {b.cta}
                            </span>
                        </div>
                    </Link>
                );
            })}
        </section>
    );
}
