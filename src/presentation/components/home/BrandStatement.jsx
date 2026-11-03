import Monogram from '@/presentation/components/brand/Monogram.jsx';

export default function BrandStatement() {
    const keywords = [
        'Progressive', 'Amicale', 'Disruptive', 'Dynamique', 'Joyeuse',
        'Inclusive', 'Simple', 'Naturelle', 'Accessible', 'Réaliste', 'Artisanale', 'Gourmet'
    ];

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#4A0A0C] via-brand-wine to-[#2A0506] py-20 text-cream-light">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red/20 blur-3xl animate-pulse-subtle" />
            
            <div className="container-luxe relative z-10 flex flex-col items-center text-center">
                <div className="animate-float">
                    <Monogram className="h-24 w-auto drop-shadow-[0_10px_25px_rgba(200,20,30,0.4)] sm:h-28" variant="light" />
                </div>
                
                <h2 className="mt-6 font-display text-3xl sm:text-5xl tracking-[0.16em] font-extrabold text-white uppercase">
                    CANRES VIANDES
                </h2>
                
                <p className="mt-2 text-sm sm:text-base font-serif italic text-amber-200 tracking-wide">
                    « La viande comme il faut »
                </p>

                <div className="brand-rule mt-6 w-32" />

                <div className="mt-8 max-w-3xl rounded-2xl bg-black/30 p-6 sm:p-10 backdrop-blur border border-white/10 shadow-2xl">
                    <h3 className="font-display text-xl sm:text-2xl font-bold tracking-wider text-amber-300 uppercase">
                        Notre Mission
                    </h3>
                    <p className="mt-4 text-sm sm:text-base leading-relaxed text-cream/90 font-sans text-justify sm:text-center">
                        Chez <strong className="text-white">CANRES</strong>, notre mission est de rehausser l'expérience de la viande en offrant des produits artisanaux de haute qualité qui allient la <strong className="text-white">tradition colombienne</strong> et le <strong className="text-white">savoir-faire québécois</strong>. Nous accompagnons chaque client dans le choix du meilleur morceau, en garantissant sa fraîcheur et sa saveur. De plus, nous nous engageons à une utilisation responsable du produit pour minimiser le gaspillage et honorer le métier de boucher. Nous servons avec passion et authenticité, en proposant des viandes et des charcuteries personnalisées qui rassemblent les cultures et créent des expériences mémorables.
                    </p>
                </div>

                {/* Mots-clés de la marque */}
                <div className="mt-10 flex flex-wrap justify-center gap-2 max-w-3xl">
                    {keywords.map((kw, i) => (
                        <span
                            key={kw}
                            className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cream/80 border border-white/10"
                        >
                            {kw}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
