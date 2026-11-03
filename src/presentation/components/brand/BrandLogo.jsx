import { brandToSlug } from '@/domain/catalog/brands.js';

export default function BrandLogo({ brand, className = 'h-14 w-auto' }) {
    const slug = brandToSlug(typeof brand === 'string' ? brand : brand?.slug || brand?.name || '');

    switch (slug) {
        case 'res-aaa':
            return (
                <div className={`flex flex-col items-center justify-center text-center ${className}`}>
                    <span className="font-display text-lg font-bold tracking-[0.2em] text-brand-dark">RES AAA</span>
                    <span className="text-[9px] uppercase tracking-[0.25em] text-brand-wine font-semibold">Sterling & Select</span>
                </div>
            );
        case 'charcuteria-artesanal':
            return (
                <div className={`flex flex-col items-center justify-center text-center ${className}`}>
                    <span className="font-display text-lg font-bold tracking-[0.16em] text-brand-wine">CHARCUTERÍA</span>
                    <span className="text-[9px] uppercase tracking-[0.25em] text-gold font-semibold">100% Artesanal</span>
                </div>
            );
        case 'cerdo-selecto':
            return (
                <div className={`flex flex-col items-center justify-center text-center ${className}`}>
                    <span className="font-display text-lg font-bold tracking-[0.18em] text-ink">CERDO SELECTO</span>
                    <span className="text-[9px] uppercase tracking-[0.22em] text-brand-red font-semibold">Granjas de Québec</span>
                </div>
            );
        case 'aves-de-corral':
            return (
                <div className={`flex flex-col items-center justify-center text-center ${className}`}>
                    <span className="font-display text-lg font-bold tracking-[0.18em] text-ink">AVES DE CORRAL</span>
                    <span className="text-[9px] uppercase tracking-[0.22em] text-gold font-semibold">Granja Fresca</span>
                </div>
            );
        case 'chivo-y-cordero':
            return (
                <div className={`flex flex-col items-center justify-center text-center ${className}`}>
                    <span className="font-display text-lg font-bold tracking-[0.18em] text-ink">CHIVO & CORDERO</span>
                    <span className="text-[9px] uppercase tracking-[0.22em] text-brand-wine font-semibold">Pastoreo Natural</span>
                </div>
            );
        default: {
            const label = (typeof brand === 'string' ? brand : brand?.name || 'CANRES VIANDES').toUpperCase();
            return (
                <div className={`flex flex-col items-center justify-center text-center ${className}`}>
                    <span className="font-display text-base font-bold tracking-[0.18em] text-ink">{label}</span>
                    <span className="text-[8px] uppercase tracking-[0.25em] text-brand-wine font-medium">Viandes Selectes</span>
                </div>
            );
        }
    }
}
