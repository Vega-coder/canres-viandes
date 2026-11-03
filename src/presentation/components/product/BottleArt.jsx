import { useId } from 'react';

// Comprime el texto a un ancho fijo cuando es demasiado largo para la etiqueta.
const fitText = (text = '', maxChars = 12, width = 80) =>
    text.length > maxChars ? { textLength: width, lengthAdjust: 'spacingAndGlyphs' } : {};

// Ilustración SVG artesanal para cortes de carnicería cuando no hay imagen disponible.
export default function BottleArt({ product, className = 'h-full w-auto' }) {
    const uid = useId().replace(/:/g, '');
    const { from = '#660F12', to = '#141414' } = product?.palette || {};

    const name = product?.name || 'Corte Noble';
    const brand = product?.brand || 'CANRES Viandes';

    return (
        <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
            <defs>
                <radialGradient id={`bg${uid}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={from} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={to} />
                </radialGradient>
                <linearGradient id={`gold${uid}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#DFB260" />
                    <stop offset="50%" stopColor="#F5DF9E" />
                    <stop offset="100%" stopColor="#9C7A3C" />
                </linearGradient>
            </defs>

            {/* Círculo base con textura */}
            <circle cx="100" cy="100" r="90" fill={`url(#bg${uid})`} stroke={`url(#gold${uid})`} strokeWidth="3" />
            <circle cx="100" cy="100" r="82" fill="none" stroke="#FFFFFF" strokeOpacity="0.15" strokeDasharray="4 3" strokeWidth="1" />

            {/* Ícono de Carne / Boucherie */}
            <g transform="translate(100, 70)">
                <path
                    d="M-28 -10 C-36 -2 0 35 28 8 C35 -5 18 -25 -5 -25 C-18 -25 -24 -15 -28 -10 Z"
                    fill="none"
                    stroke={`url(#gold${uid})`}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                />
                <circle cx="-10" cy="-6" r="4" fill={`url(#gold${uid})`} opacity="0.8" />
            </g>

            {/* Sello de Marca */}
            <text
                x="100"
                y="118"
                textAnchor="middle"
                fontFamily="'Montserrat', sans-serif"
                fontSize="7.5"
                fontWeight="bold"
                letterSpacing="2.5"
                fill={`url(#gold${uid})`}
            >
                CANRES VIANDES
            </text>

            {/* Nombre del Corte */}
            <text
                x="100"
                y="136"
                textAnchor="middle"
                fontFamily="'Playfair Display', Georgia, serif"
                fontSize="9"
                fontWeight="bold"
                fill="#FFFFFF"
                {...fitText(name, 16, 120)}
            >
                {name}
            </text>

            {/* Categoría / Marca */}
            <text
                x="100"
                y="148"
                textAnchor="middle"
                fontFamily="'Montserrat', sans-serif"
                fontSize="6"
                letterSpacing="1.5"
                fill="#E5D6C5"
                opacity="0.8"
                {...fitText(brand.toUpperCase(), 18, 110)}
            >
                {brand.toUpperCase()}
            </text>

            {/* Estrellas de artesanía */}
            <text x="100" y="162" textAnchor="middle" fontSize="6" fill={`url(#gold${uid})`}>
                ★ ★ ★
            </text>
        </svg>
    );
}
