import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLongRight } from 'react-icons/hi2';

const FEATURED_CUTS = [
    {
        id: 'rib-eye',
        name: 'Lomo Ancho Rib Eye AAA',
        brand: 'Res AAA',
        slug: 'lomo-ancho-rib-eye',
        price: '32.00 $ / kg',
        image: '/images/meat/meat_beef_cut.jpg',
        tag: 'Corte Estrella · Marmoleo Superior',
        glow: 'bg-brand-red/35',
    },
    {
        id: 'picanha',
        name: 'Punta de Picaña Sterling',
        brand: 'Res AAA',
        slug: 'punta-de-picanha-aaa',
        price: '20.00 $ / kg',
        image: '/images/meat/ribeye.jpg',
        tag: 'Grasa Uniforme · Asador al Carbón',
        glow: 'bg-gold/30',
    },
    {
        id: 'chorizo',
        name: 'Chorizo Jarabe de Caña',
        brand: 'Charcutería 100% Artesanal',
        slug: 'chorizo-jarabe-de-cana',
        price: '8.00 $ (pqte 450g)',
        image: '/images/meat/chorizos.jpg',
        tag: 'Receta de Autor · Tradición Colombiana',
        glow: 'bg-brand-wine/40',
    },
    {
        id: 'baby-back',
        name: 'Costilla Baby Back Carnuda',
        brand: 'Cerdo Selecto',
        slug: 'costilla-de-cerdo-baby',
        price: '12.00 $ / kg',
        image: '/images/meat/ribs.jpg',
        tag: 'Tierno & Carnudo · Ideal BBQ',
        glow: 'bg-brand-light/35',
    },
];

export default function Hero() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % FEATURED_CUTS.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [currentIndex]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: px * 12, y: -py * 12 });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
    };

    const activeCut = FEATURED_CUTS[currentIndex];

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1A0B0C] via-[#2D0A0E] to-[#121212] text-cream-light py-10 sm:py-16">
            {/* Luces y velo ambiental */}
            <div className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-brand-red/25 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-brand-wine/30 blur-3xl" />
            
            <div className="container-luxe relative grid min-h-[420px] items-center gap-8 md:grid-cols-2 md:gap-12">
                {/* Texto principal */}
                <div className="animate-fade-up">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[10.5px] font-bold tracking-[0.2em] text-cream-light backdrop-blur border border-white/10 uppercase">
                        <span className="h-2 w-2 rounded-full bg-brand-light animate-pulse" />
                        Boucherie Artisanale · Viandes d'Exception
                    </div>

                    <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl tracking-wide font-extrabold uppercase leading-[1.05] text-white">
                        La viande <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-200 to-red-500">
                            comme il faut.
                        </span>
                    </h1>

                    <p className="mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-cream/80">
                        La perfecta alianza entre la <strong className="text-white">tradición colombiana</strong> y el riguroso <strong className="text-white">savoir-faire québécois</strong>. Cortes nobles madurados, desposte artesanal a medida y embutidos de autor sin conservantes.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <Link to="/tienda" className="btn-brand px-6 py-3.5 text-xs tracking-wider shadow-lg shadow-brand-red/30">
                            Explorar Cortes <HiArrowLongRight className="h-4 w-4" />
                        </Link>
                        <Link to="/tienda/chorizos" className="btn-outline-light px-6 py-3.5 text-xs tracking-wider">
                            Charcutería Artesanal
                        </Link>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 text-left">
                        <div>
                            <span className="block font-display text-xl sm:text-2xl font-bold text-white">100%</span>
                            <span className="text-[10px] uppercase tracking-wider text-cream/70">Artesanal Puro</span>
                        </div>
                        <div>
                            <span className="block font-display text-xl sm:text-2xl font-bold text-brand-light">AAA</span>
                            <span className="text-[10px] uppercase tracking-wider text-cream/70">Cortes Certificados</span>
                        </div>
                        <div>
                            <span className="block font-display text-xl sm:text-2xl font-bold text-amber-400">16 $/kg</span>
                            <span className="text-[10px] uppercase tracking-wider text-cream/70">Chorizo Personalizado</span>
                        </div>
                    </div>
                </div>

                {/* Tarjeta de producto dinámico 3D */}
                <div className="relative flex flex-col items-center justify-center">
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
                                {FEATURED_CUTS.map((cut, index) => (
                                    <img
                                        key={cut.id}
                                        src={cut.image}
                                        alt={cut.name}
                                        className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                                            index === currentIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
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
                                        <p className="text-xs uppercase text-cream/70 font-mono">Desde</p>
                                        <p className="font-display text-lg sm:text-xl font-extrabold text-white">{activeCut.price}</p>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                                    {/* Indicadores de rotación */}
                                    <div className="flex gap-1.5">
                                        {FEATURED_CUTS.map((cut, index) => (
                                            <button
                                                key={cut.id}
                                                type="button"
                                                onClick={() => setCurrentIndex(index)}
                                                className={`h-1.5 rounded-full transition-all ${
                                                    index === currentIndex ? 'w-6 bg-brand-light' : 'w-2 bg-white/30'
                                                }`}
                                                aria-label={`Ver ${cut.name}`}
                                            />
                                        ))}
                                    </div>

                                    <Link
                                        to={`/producto/${activeCut.slug}`}
                                        className="text-xs font-bold text-white hover:text-brand-light flex items-center gap-1 transition"
                                    >
                                        Ver corte <HiArrowLongRight className="h-3.5 w-3.5" />
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
