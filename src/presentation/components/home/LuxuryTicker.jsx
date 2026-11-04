import { useLanguage } from '@/presentation/context/LanguageContext.jsx';

export default function LuxuryTicker() {
    const { isEn, isEs } = useLanguage();

    const items = isEn
        ? [
              'CANRES VIANDES · ARTISANAL BUTCHERY',
              'MEAT AS IT SHOULD BE',
              'COLOMBIAN TRADITION & QUEBEC CRAFTSMANSHIP',
              '100% HANDCRAFTED PRESERVATIVE-FREE CHARCUTERIE',
              'AAA BEEF & STERLING RESERVES',
              'CUSTOM SAUSAGES FROM $16/KG',
              'GUARANTEED REFRIGERATED DELIVERY',
          ]
        : isEs
        ? [
              'CANRES VIANDES · CARNICERÍA ARTESANAL',
              'LA CARNE COMO DEBE SER',
              'TRADICIÓN COLOMBIANA & SAVOIR-FAIRE QUÉBÉCOIS',
              'CHARCUTERÍA 100% ARTESANAL SIN CONSERVANTES',
              'RES AAA & RESERVAS STERLING',
              'CHORIZOS PERSONALIZADOS DESDE 16 $/KG',
              'ENVÍO REFRIGERADO GARANTIZADO',
          ]
        : [
              'CANRES VIANDES · BOUCHERIE ARTISANALE',
              'LA VIANDE COMME IL FAUT',
              'TRADITION COLOMBIENNE & SAVOIR-FAIRE QUÉBÉCOIS',
              'CHARCUTERIE 100% ARTISANALE SANS AGENTS DE CONSERVATION',
              'BOEUF AAA & RÉSERVES STERLING',
              'SAUCISSES SUR MESURE DÈS 16 $/KG',
              'LIVRAISON RÉFRIGÉRÉE GARANTIE',
          ];

    return (
        <div className="relative overflow-hidden border-y border-white/10 bg-ink py-2.5 text-amber-200" aria-hidden="true">
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused] whitespace-nowrap">
                {[...items, ...items, ...items].map((text, i) => (
                    <div key={i} className="mx-6 flex items-center gap-6 text-[10.5px] font-bold uppercase tracking-[0.22em]">
                        <span className="transition duration-300 hover:text-white">{text}</span>
                        <span className="text-brand-light">🥩</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
