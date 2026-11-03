import { Link } from 'react-router-dom';
import Monogram from './Monogram.jsx';

// Logo horizontal oficial de CANRES Viandes: Símbolo Toro + Nombre + Descriptor artesanal.
export default function Logo({ tone = 'dark', compact = false, iconOnly = false, className = '' }) {
    const isLight = tone === 'light';
    const textColor = isLight ? 'text-cream-light' : 'text-ink';
    const subColor = isLight ? 'text-brand-light' : 'text-brand-wine';

    return (
        <Link
            to="/"
            className={`flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3.5 transition hover:opacity-95 ${className}`}
            aria-label="CANRES Viandes, ir al inicio"
        >
            <Monogram
                className={compact ? 'h-9 w-auto shrink-0 sm:h-10' : 'h-11 w-auto shrink-0 sm:h-12'}
                variant={isLight ? 'light' : 'dark'}
            />
            {!iconOnly && (
                <span className="flex min-w-0 flex-col overflow-hidden whitespace-nowrap leading-none">
                    <span className={`font-display text-[17px] font-bold tracking-[0.16em] sm:text-2xl sm:tracking-[0.18em] ${textColor}`}>
                        CANRES
                    </span>
                    <span className={`mt-0.5 text-[10px] font-semibold tracking-[0.18em] sm:text-[11px] sm:tracking-[0.22em] ${subColor}`}>
                        Viandes · <span className="font-normal opacity-90 text-[9px]">Boucherie</span>
                    </span>
                </span>
            )}
        </Link>
    );
}
