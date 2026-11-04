import { FREE_SHIPPING_THRESHOLD } from '@/domain/cart/cart.js';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import { HiOutlineTruck, HiCheckCircle } from 'react-icons/hi2';

export default function FreeShippingProgress({ missing }) {
    const { t, formatMoney } = useLanguage();
    const clampedMissing = Math.max(0, missing);
    const pct = Math.min(100, Math.max(0, Math.round(((FREE_SHIPPING_THRESHOLD - clampedMissing) / FREE_SHIPPING_THRESHOLD) * 100)));

    return (
        <div className="rounded-xl border border-brand-wine/20 bg-brand-wine/5 p-3.5">
            <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-ink">
                    {pct >= 100 ? (
                        <>
                            <HiCheckCircle className="h-4 w-4 text-emerald-600" />
                            <strong className="text-emerald-700 font-bold">{t('cart.free_ship_congrats')}</strong>
                        </>
                    ) : (
                        <>
                            <HiOutlineTruck className="h-4 w-4 text-brand-wine" />
                            <span>
                                {t('cart.free_ship_missing', { amount: formatMoney(clampedMissing) })}
                            </span>
                        </>
                    )}
                </span>
                <span className="font-mono text-[11px] font-bold text-taupe">{pct}%</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-cream ring-1 ring-brand-wine/20">
                <div
                    className="h-full bg-brand-gradient transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
