export default function LuxuryTicker() {
    const ITEMS = [
        'CANRES VIANDES · BOUCHERIE ARTISANALE',
        'LA VIANDE COMME IL FAUT',
        'TRADITION COLOMBIENNE & SAVOIR-FAIRE QUÉBÉCOIS',
        'CHARCUTERIE 100% ARTISANALE SANS CONSERVATEURS',
        'BOEUF AAA & RÉSERVES STERLING',
        'CHORIZOS SUR MESURE DÈS 16 $/KG',
        'LIVRAISON RÉFRIGÉRÉE GARANTIE',
    ];

    return (
        <div className="relative overflow-hidden border-y border-white/10 bg-ink py-2.5 text-amber-200" aria-hidden="true">
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused] whitespace-nowrap">
                {[...ITEMS, ...ITEMS, ...ITEMS].map((text, i) => (
                    <div key={i} className="mx-6 flex items-center gap-6 text-[10.5px] font-bold uppercase tracking-[0.22em]">
                        <span className="transition duration-300 hover:text-white">{text}</span>
                        <span className="text-brand-light">🥩</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
