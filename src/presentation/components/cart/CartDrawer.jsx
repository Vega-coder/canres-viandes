import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineXMark, HiOutlineTrash } from 'react-icons/hi2';
import { useCart } from '@/presentation/context/CartContext.jsx';
import { MAX_QTY_PER_ITEM } from '@/domain/cart/cart.js';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import QuantityStepper from '@/presentation/components/ui/QuantityStepper.jsx';
import ProductImage from '@/presentation/components/product/ProductImage.jsx';
import FreeShippingProgress from './FreeShippingProgress.jsx';
import CartUpsell from './CartUpsell.jsx';

export default function CartDrawer() {
    const { t, formatMoney, formatUnit, translateProduct } = useLanguage();
    const { items: rawItems, totals, isOpen, close, setQuantity, remove } = useCart();
    const items = rawItems.map(translateProduct);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen) return undefined;
        const onKey = (e) => e.key === 'Escape' && close();
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [isOpen, close]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t('cart.drawer_title')}>
            <div className="absolute inset-0 bg-ink/50 backdrop-blur-xs" onClick={close} />
            <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream-light shadow-2xl">
                <header className="flex items-center justify-between border-b border-cream px-6 py-5 bg-white">
                    <h2 className="font-display text-xl font-bold uppercase tracking-wider text-ink">
                        {t('cart.drawer_title')}
                    </h2>
                    <button onClick={close} aria-label={t('nav.close_menu')} className="p-1 text-ink hover:text-brand-wine">
                        <HiOutlineXMark className="h-6 w-6" />
                    </button>
                </header>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                        <span className="text-4xl">🥩</span>
                        <p className="font-display text-xl font-bold uppercase">{t('cart.empty_title')}</p>
                        <p className="text-sm text-taupe max-w-xs">{t('cart.empty_desc')}</p>
                        <Link to="/tienda" onClick={close} className="btn-brand mt-2 text-xs">
                            {t('cart.empty_btn')}
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="px-6 pt-4">
                            <FreeShippingProgress missing={totals.missingForFreeShipping} />
                        </div>
                        <div className="flex-1 overflow-y-auto px-6">
                            <ul className="divide-y divide-cream">
                                {items.map((item) => (
                                    <li key={item.productId} className="flex gap-4 py-4">
                                        <ProductImage product={item} className="h-20 w-20 shrink-0 rounded-xl" />
                                        <div className="flex flex-1 flex-col">
                                            <p className="text-[10px] uppercase font-bold text-brand-wine">{item.brand}</p>
                                            <Link to={`/producto/${item.slug}`} onClick={close} className="font-display text-sm font-bold uppercase leading-tight hover:text-brand-wine">
                                                {item.name}
                                            </Link>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs font-bold text-ink">
                                                    {formatMoney(item.unitPrice * item.quantity)}
                                                </p>
                                                <span className="text-[10.5px] text-taupe font-medium">
                                                    ({formatMoney(item.unitPrice)} {formatUnit(item.unit)})
                                                </span>
                                            </div>
                                            <div className="mt-auto flex items-center justify-between pt-2">
                                                <div className="flex items-center gap-1.5">
                                                    <QuantityStepper
                                                        size="sm"
                                                        value={item.quantity}
                                                        max={Math.min(item.stock, MAX_QTY_PER_ITEM)}
                                                        onChange={(q) => setQuantity(item.productId, q)}
                                                    />
                                                    <span className="text-[11px] text-taupe font-medium">{item.unit || 'kg'}</span>
                                                </div>
                                                <button
                                                    onClick={() => remove(item.productId)}
                                                    className="text-taupe hover:text-brand-wine p-1"
                                                    aria-label={t('cart.remove_item', { name: item.name })}
                                                >
                                                    <HiOutlineTrash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <CartUpsell />
                        </div>

                        <footer className="space-y-3 border-t border-cream bg-white px-6 py-5">
                            {!totals.isVip && (
                                <div className="rounded-lg bg-gradient-to-r from-amber-500/15 via-gold/20 to-amber-500/10 p-3 text-xs border border-amber-300/60 shadow-xs">
                                    <p className="font-bold text-amber-900 flex items-center gap-1">
                                        <span>👑</span>
                                        <span>{t('cart.vip_upsell_title')}</span>
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-amber-800/90 leading-snug">
                                        <Link to="/registro" onClick={close} className="font-bold underline hover:text-ink">
                                            {t('cart.vip_register_link')}
                                        </Link>{' '}
                                        {t('cart.vip_upsell_desc')}
                                    </p>
                                </div>
                            )}
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-taupe uppercase">{t('cart.subtotal')}</span>
                                <span className="font-bold text-ink">{formatMoney(totals.subtotal)}</span>
                            </div>
                            {totals.vipDiscount > 0 && (
                                <div className="flex justify-between text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded border border-amber-200">
                                    <span className="flex items-center gap-1.5">
                                        <span>👑</span>
                                        <span>
                                            {t('cart.vip_discount', {
                                                percent: Math.round((totals.vipDiscountRate || 0.10) * 100),
                                            })}
                                        </span>
                                    </span>
                                    <span>-{formatMoney(totals.vipDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xs font-medium text-taupe">
                                <span className="uppercase">{t('cart.shipping')}</span>
                                <span className="font-bold text-ink">{totals.shipping ? formatMoney(totals.shipping) : t('cart.free')}</span>
                            </div>
                            <div className="flex justify-between font-display text-lg font-extrabold uppercase border-t border-cream pt-2">
                                <span>{t('cart.total')}</span>
                                <span className="text-brand-dark">{formatMoney(totals.total)}</span>
                            </div>

                            <div className="flex items-center justify-center gap-1.5 py-1 text-[10px] text-taupe">
                                <span>{t('cart.guarantee')}</span>
                            </div>

                            <button className="btn-brand w-full text-xs shadow-md" onClick={() => { close(); navigate('/checkout'); }}>
                                {t('cart.checkout_btn')}
                            </button>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="btn-outline w-full px-2 text-[10px]" onClick={() => { close(); navigate('/carrito'); }}>
                                    {t('cart.view_summary')}
                                </button>
                                <button className="btn-outline w-full px-2 text-[10px]" onClick={close}>
                                    {t('cart.continue_shopping')}
                                </button>
                            </div>
                        </footer>
                    </>
                )}
            </aside>
        </div>
    );
}
