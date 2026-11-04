import Monogram from '@/presentation/components/brand/Monogram.jsx';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';

export default function BrandStatement() {
    const { t, isEn, isEs } = useLanguage();

    const keywords = isEn
        ? [
              'Progressive', 'Friendly', 'Disruptive', 'Dynamic', 'Joyful',
              'Inclusive', 'Simple', 'Natural', 'Accessible', 'Authentic', 'Artisanal', 'Gourmet'
          ]
        : isEs
        ? [
              'Progresista', 'Cercana', 'Disruptiva', 'Dinámica', 'Alegre',
              'Inclusiva', 'Simple', 'Natural', 'Accesible', 'Realista', 'Artesanal', 'Gourmet'
          ]
        : [
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
                    {t('brandStatement.brandName')}
                </h2>

                <p className="mt-2 text-sm sm:text-base font-serif italic text-amber-200 tracking-wide">
                    {t('brandStatement.tagline')}
                </p>

                <div className="brand-rule mt-6 w-32" />

                <div className="mt-8 max-w-3xl rounded-2xl bg-black/30 p-6 sm:p-10 backdrop-blur border border-white/10 shadow-2xl">
                    <h3 className="font-display text-xl sm:text-2xl font-bold tracking-wider text-amber-300 uppercase">
                        {t('brandStatement.missionTitle')}
                    </h3>
                    <p className="mt-4 text-sm sm:text-base leading-relaxed text-cream/90 font-sans text-justify sm:text-center">
                        {t('brandStatement.missionText')}
                    </p>
                </div>

                {/* Mots-clés de la marque */}
                <div className="mt-10 flex flex-wrap justify-center gap-2 max-w-3xl">
                    {keywords.map((kw) => (
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
