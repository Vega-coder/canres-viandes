import { Link } from 'react-router-dom';

const SPECIALTIES = [
    {
        title: 'RES AAA',
        subtitle: 'Boeuf Select & Sterling',
        to: '/tienda/res',
        image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80',
        alt: 'Cortes de res AAA',
    },
    {
        title: 'CERDO SELECTO',
        subtitle: 'Porc Fermier de Québec',
        to: '/tienda/cerdo',
        image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=600&q=80',
        alt: 'Cortes de cerdo selecto',
    },
    {
        title: 'CHARCUTERÍA',
        subtitle: '100% Saucisses Artisanales',
        to: '/tienda/chorizos',
        image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80',
        alt: 'Chorizos artesanales colombianos',
    },
];

export default function GenderExplore() {
    return (
        <section className="container-luxe py-10 sm:py-14">
            <h2 className="mb-6 text-center font-display text-xl font-bold uppercase tracking-[0.2em] text-ink sm:mb-8 sm:text-2xl md:text-3xl">
                Especialidades de la Casa
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {SPECIALTIES.map((g) => (
                    <Link
                        key={g.title}
                        to={g.to}
                        className="group relative block aspect-[4/3] sm:aspect-[4/5] overflow-hidden rounded-xl bg-ink shadow-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 ring-1 ring-taupe/15 hover:ring-2 hover:ring-brand-wine"
                    >
                        <img
                            src={g.image}
                            alt={g.alt}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4 text-center transition duration-500 group-hover:bg-black/40">
                            <span className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-widest text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] transition duration-300 group-hover:scale-105">
                                {g.title}
                            </span>
                            <span className="text-[11px] uppercase tracking-wider text-amber-200 mt-1">
                                {g.subtitle}
                            </span>
                            <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/60 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-brand-wine group-hover:border-brand-wine">
                                Ver cortes <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
