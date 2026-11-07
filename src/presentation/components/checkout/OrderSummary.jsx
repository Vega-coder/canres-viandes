import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import ProductImage from '@/presentation/components/product/ProductImage.jsx';
import FreeShippingProgress from '@/presentation/components/cart/FreeShippingProgress.jsx';

export default function OrderSummary({ items: rawItems, totals }) {
    const { t, formatMoney, translateProduct } = useLanguage();
    const items = (rawItems || []).map(translateProduct);

    return (
        <div className="bg-white p-6 shadow-sm ring-1 ring-taupe/10 sm:p-8">
            <h2 className="font-display text-2xl">{t('checkout.order_summary')}</h2>
            <ul className="mt-6 divide-y divide-taupe/15">
                {items.map((i) => (
                    <li key={i.productId} className="flex items-center gap-4 py-4">
                        <div className="relative">
                            <ProductImage product={i} className="h-16 w-14" />
                            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-cream-light">{i.quantity}</span>
                        </div>
                        <div className="flex-1">
                            <p className="eyebrow text-[9px] text-taupe">{i.brand}</p>
                            <p className="font-display leading-tight">{i.name}</p>
                            {i.hasFreeShipping || !i.shippingCost || i.shippingCost <= 0 ? (
                                <span className="text-[10px] font-semibold text-emerald-700">{t('cart.free_ship_item')}</span>
                            ) : (
                                <span className="text-[10px] text-taupe">{t('cart.shipping')}: {formatMoney(i.shippingCost)}</span>
                            )}
                        </div>
                        <p className="text-sm">{formatMoney(i.unitPrice * i.quantity)}</p>
                    </li>
                ))}
            </ul>
            <div className="mt-4 space-y-3 border-t border-taupe/15 pt-5 text-sm">
                <FreeShippingProgress missing={totals.missingForFreeShipping} />
                <div className="flex justify-between pt-2">
                    <span>{t('cart.subtotal')}</span>
                    <span>{formatMoney(totals.subtotal)}</span>
                </div>
                {totals.vipDiscount > 0 && (
                    <div className="flex justify-between text-amber-800 font-semibold bg-amber-50 px-2.5 py-1.5 rounded border border-amber-200">
                        <span className="flex items-center gap-1.5">
                            <span>👑</span>
                            <span>{t('cart.vip_discount', { percent: Math.round((totals.vipDiscountRate || 0.10) * 100) })}</span>
                        </span>
                        <span>-{formatMoney(totals.vipDiscount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-taupe">
                    <span>{t('cart.shipping')}</span>
                    <span>{totals.shipping ? formatMoney(totals.shipping) : t('cart.free')}</span>
                </div>
                <div className="flex justify-between border-t border-taupe/15 pt-4 font-display text-2xl">
                    <span>{t('cart.total')}</span>
                    <span>{formatMoney(totals.total)}</span>
                </div>
            </div>
        </div>
    );
}
