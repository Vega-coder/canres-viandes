import { Link } from 'react-router-dom';

const STYLES = [
    {
        title: 'PARRILLA & BRASA',
        tag: 'Ribeye AAA, Picaña & Asador',
        to: '/tienda?q=parrilla',
        image: '/images/products/beef-ribeye.jpg',
        alt: 'Cortes para parrilla al carbón',
    },
    {
        title: 'CHARCUTERÍA ARTESANAL',
        tag: 'Chorizos de Autor & Butifarra',
        to: '/tienda/chorizos',
        image: '/images/products/chorizo-artesanal.jpg',
        alt: 'Chorizos 100% artesanales sin gluten',
    },
    {
        title: 'AHUMADO & BBQ',
        tag: 'Baby Back, Pork Belly & Alitas',
        to: '/tienda?q=bbq',
        image: '/images/products/pork-baby-ribs.jpg',
        alt: 'Cortes BBQ y ahumados',
    },
    {
        title: 'HORNO & ASADOS LENTOS',
        tag: 'Pierna Cordero, Paletas & Chivo',
        to: '/tienda?q=horno',
        image: '/images/products/lamb-shank.jpg',
        alt: 'Cortes para hornear',
    },
    {
        title: 'SARTÉN & SELLADO',
        tag: 'Bife New York & Molida Magra',
        to: '/tienda?q=sarten',
        image: '/images/products/beef-newyork.jpg',
        alt: 'Sellado rápido y smash burgers',
    },
    {
        title: 'TRADICIÓN COLOMBIANA',
        tag: 'Sobrebarriga, Sancochos & Picadas',
        to: '/tienda?q=colombiana',
        image: '/images/products/beef-sobrebarriga.jpg',
        alt: 'Cortes tradicionales de Colombia',
    },
];

export default function AromaExplore() {
    return (
        <section className="bg-cream-light py-12 sm:py-16">
            <div className="container-luxe">
                <div className="text-center">
                    <p className="eyebrow text-brand-wine font-bold">Inspiración Butcher</p>
                    <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-ink">
                        Explora por Estilo & Ocasión
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-taupe">
                        Cada corte tiene su punto exacto. Elige tu método de preparación y te llevamos el corte ideal cortado al gusto.
                    </p>
                </div>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {STYLES.map((st) => (
                        <Link
                            key={st.title}
                            to={st.to}
                            className="group relative h-64 overflow-hidden rounded-2xl shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <img
                                src={st.image}
                                alt={st.alt}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                            <div className="absolute bottom-5 left-5 right-5 text-cream-light">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                                    {st.tag}
                                </span>
                                <h3 className="mt-1 font-display text-xl font-bold uppercase tracking-wider text-white">
                                    {st.title}
                                </h3>
                                <span className="mt-2 inline-flex items-center text-xs font-semibold text-brand-light group-hover:underline">
                                    Ver productos →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
