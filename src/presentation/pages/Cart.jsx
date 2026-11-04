import { Link } from 'react-router-dom';
import { HiOutlineTrash, HiArrowLongLeft, HiArrowLongRight, HiOutlineShoppingBag } from 'react-icons/hi2';
import { useCart } from '@/presentation/context/CartContext.jsx';
import { MAX_QTY_PER_ITEM } from '@/domain/cart/cart.js';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import QuantityStepper from '@/presentation/components/ui/QuantityStepper.jsx';
import ProductImage from '@/presentation/components/product/ProductImage.jsx';
import FreeShippingProgress from '@/presentation/components/cart/FreeShippingProgress.jsx';
import CartUpsell from '@/presentation/components/cart/CartUpsell.jsx';

export default function Cart() {
    const { t, formatMoney } = useLanguage();
    const { items, count, totals, setQuantity, remove, clear } = useCart();

    if (items.length === 0) {
        return (
            <div className="container-luxe flex flex-col items-center py-32 text-center">
                <HiOutlineShoppingBag className="h-14 w-14 text-gold" />
                <h1 className="mt-6 text-4xl">{t('cart.empty_title')}</h1>
                <p className="mt-3 text-taupe">{t('cart.empty_desc')}</p>
                <Link to="/tienda" className="btn-brand mt-8">{t('cart.empty_btn')}</Link>
            </div>
        );
    }

    return (
        <div className="container-luxe py-12">
            <header className="mb-10 text-center">
                <p className="eyebrow text-taupe">{t('cart.page_title')}</p>
                <h1 className="mt-3 text-4xl sm:text-5xl">{t('cart.page_title')}</h1>
                <p className="mt-2 text-sm text-taupe">
                    {count} {count === 1 ? 'article' : 'articles'}
                </p>
            </header>

            <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
                <section>
                    <div className="hidden grid-cols-[1fr_140px_120px_32px] gap-4 border-b border-taupe/20 pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-taupe sm:grid">
                        <span>{t('cart.table_product')}</span>
                        <span className="text-center">{t('cart.table_qty')}</span>
                        <span className="text-right">{t('cart.table_total')}</span>
                        <span />
                    </div>
                    <ul className="divide-y divide-taupe/15">
                        {items.map((item) => (
                            <li key={item.productId} className="grid grid-cols-[80px_1fr] gap-4 py-6 sm:grid-cols-[1fr_140px_120px_32px] sm:items-center">
                                <div className="flex items-center gap-4 sm:col-span-1">
                                    <Link to={`/producto/${item.slug}`}>
                                        <ProductImage product={item} className="h-24 w-20 shrink-0" />
                                    </Link>
                                    <div className="hidden sm:block">
                                        <p className="eyebrow text-[9px] text-taupe">{item.brand}</p>
                                        <Link to={`/producto/${item.slug}`} className="font-display text-lg leading-tight hover:text-gold-dark">{item.name}</Link>
                                        <p className="mt-1 text-xs text-taupe">{formatMoney(item.unitPrice)} {t('cart.each')}</p>
                                        {item.hasFreeShipping || !item.shippingCost || item.shippingCost <= 0 ? (
                                            <span className="text-emerald-700 font-semibold text-[11px] block mt-0.5">{t('cart.free_ship_item')}</span>
                                        ) : (
                                            <span className="text-taupe text-[11px] block mt-0.5">
                                                {t('cart.shipping')}: {formatMoney(item.shippingCost)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Vista móvil: datos + controles apilados */}
                                <div className="flex flex-col gap-2 sm:contents">
                                    <div className="sm:hidden">
                                        <p className="eyebrow text-[9px] text-taupe">{item.brand}</p>
                                        <Link to={`/producto/${item.slug}`} className="font-display text-base leading-tight hover:text-gold-dark">{item.name}</Link>
                                        <p className="mt-1 text-xs text-taupe">{formatMoney(item.unitPrice)} {t('cart.each')}</p>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-center">
                                        <QuantityStepper
                                            size="sm"
                                            value={item.quantity}
                                            max={Math.min(item.stock, MAX_QTY_PER_ITEM)}
                                            onChange={(q) => setQuantity(item.productId, q)}
                                        />
                                        <span className="font-display font-bold sm:hidden">{formatMoney(item.unitPrice * item.quantity)}</span>
                                    </div>
                                </div>

                                <span className="hidden text-right font-display text-lg font-bold sm:block">{formatMoney(item.unitPrice * item.quantity)}</span>
                                <button
                                    onClick={() => remove(item.productId)}
                                    className="text-taupe hover:text-ink justify-self-end p-1"
                                    aria-label={t('cart.remove_item', { name: item.name })}
                                >
                                    <HiOutlineTrash className="h-5 w-5" />
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6 flex justify-between">
                        <Link to="/tienda" className="flex items-center gap-2 text-xs uppercase tracking-wider text-taupe hover:text-ink">
                            <HiArrowLongLeft className="h-4 w-4" /> {t('cart.continue_shopping')}
                        </Link>
                        <button onClick={clear} className="text-xs uppercase tracking-wider text-taupe hover:text-red-900">
                            {t('catalog.clear_filters')}
                        </button>
                    </div>

                    <div className="mt-12">
                        <CartUpsell />
                    </div>
                </section>

                <aside className="h-fit rounded-2xl bg-cream-light p-6 ring-1 ring-taupe/15">
                    <h2 className="font-display text-2xl">{t('checkout.order_summary')}</h2>
                    <div className="mt-6">
                        <FreeShippingProgress missing={totals.missingForFreeShipping} />
                    </div>
                    <dl className="mt-6 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-taupe">{t('cart.subtotal')}</dt>
                            <dd className="font-medium">{formatMoney(totals.subtotal)}</dd>
                        </div>
                        {totals.vipDiscount > 0 && (
                            <div className="flex justify-between text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded border border-amber-200">
                                <dt className="flex items-center gap-1.5">
                                    <span>👑</span>
                                    <span>{t('cart.vip_discount', { percent: Math.round((totals.vipDiscountRate || 0.10) * 100) })}</span>
                                </dt>
                                <dd>-{formatMoney(totals.vipDiscount)}</dd>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <dt className="text-taupe">{t('cart.shipping')}</dt>
                            <dd className="font-medium">{totals.shipping ? formatMoney(totals.shipping) : t('cart.free')}</dd>
                        </div>
                        <div className="flex justify-between border-t border-taupe/15 pt-3 font-display text-xl font-bold">
                            <dt>{t('cart.total')}</dt>
                            <dd className="text-gold-dark">{formatMoney(totals.total)}</dd>
                        </div>
                    </dl>
                    <Link to="/checkout" className="btn-brand mt-6 flex w-full items-center justify-center gap-2">
                        {t('cart.checkout_btn')} <HiArrowLongRight className="h-4 w-4" />
                    </Link>
                </aside>
            </div>
        </div>
    );
}
