import { getFinalPrice, isOnSale } from '@/domain/catalog/product.js';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';

export default function PriceTag({ product, size = 'md' }) {
    const { formatMoney, formatUnit } = useLanguage();
    const big = size === 'lg';
    const unitLabel = formatUnit(product.unit);

    return (
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
            <span className={`${big ? 'text-2xl sm:text-3xl font-extrabold text-brand-dark' : 'text-base font-bold text-ink'}`}>
                {formatMoney(getFinalPrice(product))}
            </span>
            {unitLabel && (
                <span className={`${big ? 'text-sm font-semibold' : 'text-xs font-medium'} text-taupe`}>
                    {unitLabel}
                </span>
            )}
            {isOnSale(product) && (
                <>
                    <span className={`${big ? 'text-base' : 'text-xs'} text-taupe line-through ml-1`}>
                        {formatMoney(product.price)}
                    </span>
                    <span className="text-[10px] font-bold text-brand-wine">
                        -{product.discountPercent}%
                    </span>
                </>
            )}
        </div>
    );
}
