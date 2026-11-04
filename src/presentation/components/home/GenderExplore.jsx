import { Link } from 'react-router-dom';

const SPECIALTIES = [
    {
        title: 'RES AAA',
        subtitle: 'Boeuf Select & Sterling',
        to: '/tienda/res',
        image: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/meat_beef_cut.jpg',
        alt: 'Cortes de res AAA',
        badge: 'Grado AAA',
    },
    {
        title: 'CERDO SELECTO',
        subtitle: 'Porc Fermier de Québec',
        to: '/tienda/cerdo',
        image: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739784/canres-viandes/porkbelly.jpg',
        alt: 'Cortes de cerdo selecto',
        badge: 'Granja',
    },
    {
        title: 'CHORIZOS ARTESANALES',
        subtitle: '100% Saucisses de Autor',
        to: '/tienda/chorizos',
        image: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/chorizos.jpg',
        alt: 'Chorizos artesanales colombianos',
        badge: '★ Especialidad',
        highlight: true,
    },
    {
        title: 'POLLO DE GRANJA',
        subtitle: 'Volaille Fraîche & BBQ',
        to: '/tienda/pollo',
        image: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739781/canres-viandes/butcher.jpg',
        alt: 'Pollo fresco y alitas BBQ',
        badge: 'Fresco',
    },
    {
        title: 'CHIVO & CORDERO',
        subtitle: 'Agneau & Chèvre de Pastoreo',
        to: '/tienda/chivo',
        image: 'https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg',
        alt: 'Pierna de cordero y chivo',
        badge: 'Pastoreo',
    },
];

export default function GenderExplore() {
    return (
        <section className="container-luxe py-10 sm:py-14">
            <div className="text-center mb-8">
                <p className="eyebrow text-gold-dark font-bold">Nuestras Líneas de Carnicería</p>
                <h2 className="mt-1 font-display text-2xl font-bold uppercase tracking-[0.16em] text-ink sm:text-3xl">
                    Especialidades de la Casa
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-taupe">
                    Secciones dedicadas con cortes frescos garantizados, cadena de frío y empacados al vacío.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {SPECIALTIES.map((g) => (
                    <Link
                        key={g.title}
                        to={g.to}
                        className={`group relative block aspect-[3/4] sm:aspect-[4/5] overflow-hidden rounded-xl bg-ink shadow-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 ring-1 ${
                            g.highlight
                                ? 'ring-2 ring-gold shadow-lg shadow-gold/10 hover:ring-brand-wine'
                                : 'ring-taupe/15 hover:ring-2 hover:ring-brand-wine'
                        }`}
                    >
                        <img
                            src={g.image}
                            alt={g.alt}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-between bg-gradient-to-t from-black/85 via-black/40 to-black/20 p-3 sm:p-4 text-center transition duration-500 group-hover:from-black/90">
                            {/* Badge superior */}
                            <div className="w-full flex justify-end">
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${
                                        g.highlight
                                            ? 'bg-gold text-ink font-extrabold shadow-sm'
                                            : 'bg-black/60 text-white/90 backdrop-blur-xs'
                                    }`}
                                >
                                    {g.badge}
                                </span>
                            </div>

                            {/* Títulos y CTA inferior */}
                            <div className="w-full flex flex-col items-center">
                                <span className="font-display text-sm sm:text-base md:text-lg font-extrabold uppercase tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] transition duration-300 group-hover:scale-105">
                                    {g.title}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider text-amber-200/90 mt-0.5 line-clamp-1">
                                    {g.subtitle}
                                </span>
                                <span className="mt-2.5 inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/60 px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-brand-wine group-hover:border-brand-wine">
                                    Ver sección <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
