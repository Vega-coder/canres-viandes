import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HiOutlineShieldCheck, HiOutlineTruck, HiOutlineLockClosed, HiHeart, HiOutlineHeart, HiOutlineSparkles, HiStar, HiOutlineFire } from 'react-icons/hi2';
import { useCases } from '@/infrastructure/container.js';
import { getStockLabel } from '@/domain/catalog/product.js';
import { MAX_QTY_PER_ITEM, FREE_SHIPPING_THRESHOLD } from '@/domain/cart/cart.js';
import { formatMoney, formatUnit } from '@/domain/shared/money.js';
import { useAsync } from '@/presentation/hooks/useAsync.js';
import { useCart } from '@/presentation/context/CartContext.jsx';
import { useWishlist } from '@/presentation/context/WishlistContext.jsx';
import ProductGallery from '@/presentation/components/product/ProductGallery.jsx';
import PriceTag from '@/presentation/components/product/PriceTag.jsx';
import ProductGrid from '@/presentation/components/product/ProductGrid.jsx';
import QuantityStepper from '@/presentation/components/ui/QuantityStepper.jsx';
import SectionHeading from '@/presentation/components/ui/SectionHeading.jsx';
import ProductReviews from '@/presentation/components/product/ProductReviews.jsx';
import RecentlyViewed from '@/presentation/components/product/RecentlyViewed.jsx';
import NotFound from './NotFound.jsx';

export default function ProductDetail() {
    const { slug } = useParams();
    const { data, loading } = useAsync(() => useCases.getProductDetail(slug), [slug]);

    if (loading) {
        return (
            <div className="container-luxe grid animate-pulse gap-12 py-12 md:grid-cols-2">
                <div className="aspect-square bg-cream rounded-2xl" />
                <div className="space-y-4">
                    <div className="h-4 w-1/4 bg-cream rounded" />
                    <div className="h-10 w-2/3 bg-cream rounded" />
                </div>
            </div>
        );
    }
    if (!data?.product) return <NotFound />;

    return <ProductView key={slug} product={data.product} related={data.related} />;
}

function ProductView({ product, related }) {
    const { add } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isFav = isInWishlist(product.id);
    const [qty, setQty] = useState(1);
    const soldOut = product.stock <= 0;
    const maxQty = Math.min(product.stock, MAX_QTY_PER_ITEM);
    const hasFreeShip = product.hasFreeShipping || !product.shippingCost || product.shippingCost <= 0;

    const details = [
        ['Línea', product.brand],
        ['Unidad de venta', product.unit ? formatUnit(product.unit).replace('/', '').trim() : 'kg'],
        ['Categoría', product.gender ? product.gender.toUpperCase() : 'GENERAL'],
        ['Origen', 'Québec & Tradición Colombiana'],
        ['Empaque', 'Al vacío refrigerado hermético'],
        ['Entrega', hasFreeShip ? 'Envío refrigerado GRATIS' : `${formatMoney(product.shippingCost)} (Gratis desde ${formatMoney(FREE_SHIPPING_THRESHOLD)})`],
    ].filter(([, v]) => v);

    return (
        <>
            <div className="container-luxe py-8 sm:py-12">
                <nav className="mb-6 text-[11px] uppercase tracking-wider text-taupe" aria-label="Ruta">
                    <Link to="/" className="hover:text-brand-wine">Inicio</Link> / <Link to="/tienda" className="hover:text-brand-wine">Carnicería</Link> / <Link to={`/tienda/${product.gender || ''}`} className="hover:text-brand-wine">{(product.gender || 'Cortes').toUpperCase()}</Link> / <span className="text-ink font-bold">{product.name}</span>
                </nav>

                <div className="grid gap-10 md:grid-cols-2 lg:gap-14 items-start">
                    <ProductGallery product={product} />

                    <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                            <span className="eyebrow text-brand-wine font-bold">{product.brand}</span>
                            {product.reviewsCount > 0 && (
                                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                                    <HiStar className="h-4 w-4 fill-current" />
                                    <span>{Number(product.ratingAverage || 5).toFixed(1)}</span>
                                    <span className="text-taupe font-normal">({product.reviewsCount})</span>
                                </div>
                            )}
                        </div>

                        <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink leading-tight uppercase">
                            {product.name}
                        </h1>
                        {product.subname && (
                            <p className="mt-1 text-sm sm:text-base font-serif italic text-taupe">{product.subname}</p>
                        )}

                        <div className="mt-5"><PriceTag product={product} size="lg" /></div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className={`text-xs font-semibold ${product.stock <= 3 ? 'text-amber-600' : 'text-emerald-700'}`}>
                                ● {getStockLabel(product)}
                            </span>
                            <span className="text-taupe/40">·</span>
                            {hasFreeShip ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                                    <HiOutlineTruck className="h-3.5 w-3.5" /> Envío refrigerado GRATIS
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-0.5 text-xs font-medium text-ink ring-1 ring-taupe/20">
                                    <HiOutlineTruck className="h-3.5 w-3.5 text-brand-wine" /> Envío refrigerado: <strong>{formatMoney(product.shippingCost)}</strong>
                                </span>
                            )}
                        </div>

                        <p className="mt-5 leading-relaxed text-ink/80 text-sm sm:text-base">{product.description}</p>

                        {/* Métodos de Cocción Recomendados */}
                        {product.cookingMethods?.length > 0 && (
                            <div className="mt-6 rounded-xl bg-cream-light/70 p-4 border border-cream">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-wine flex items-center gap-1.5">
                                    <HiOutlineFire className="h-4 w-4" /> Métodos de Preparación Recomendados
                                </h3>
                                <div className="mt-2.5 flex flex-wrap gap-2">
                                    {product.cookingMethods.map((m) => (
                                        <span key={m} className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-ink shadow-xs border border-cream">
                                            🔥 {m}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notas y Atributos del Corte */}
                        {product.notes?.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                                {product.notes.map((n) => (
                                    <span key={n} className="rounded-full bg-brand-wine/10 px-3 py-1 text-[11px] font-semibold text-brand-wine">
                                        ✓ {n}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Selector de cantidad y botón Agregar */}
                        <div className="mt-8 flex flex-col sm:flex-row items-stretch gap-4 border-t border-cream pt-6">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase text-taupe">Cantidad:</span>
                                <QuantityStepper value={qty} onChange={setQty} min={1} max={maxQty} disabled={soldOut} />
                                <span className="text-xs font-medium text-taupe">{product.unit || 'kg'}</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => add(product, qty)}
                                disabled={soldOut}
                                className="btn-brand flex-1 py-3.5 text-xs shadow-lg shadow-brand-wine/25"
                            >
                                {soldOut ? 'Corte Agotado' : `Agregar al Pedido · ${formatMoney(product.price * qty)}`}
                            </button>

                            <button
                                type="button"
                                onClick={() => toggleWishlist(product)}
                                aria-label="Favorito"
                                className={`flex h-12 w-12 items-center justify-center rounded-xl border transition ${
                                    isFav ? 'bg-brand-wine text-white border-brand-wine' : 'border-cream bg-white text-ink hover:text-brand-wine'
                                }`}
                            >
                                {isFav ? <HiHeart className="h-5 w-5" /> : <HiOutlineHeart className="h-5 w-5" />}
                            </button>
                        </div>

                        {/* Ficha técnica y garantías */}
                        <div className="mt-8 divide-y divide-cream border-t border-b border-cream">
                            {details.map(([label, val]) => (
                                <div key={label} className="flex justify-between py-2 text-xs">
                                    <span className="text-taupe uppercase font-semibold">{label}</span>
                                    <span className="font-bold text-ink">{val}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-taupe">
                            <div className="flex items-center gap-2">
                                <HiOutlineShieldCheck className="h-5 w-5 text-brand-wine shrink-0" />
                                <span>Cadena de frío y corte limpio garantizado</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <HiOutlineLockClosed className="h-5 w-5 text-brand-wine shrink-0" />
                                <span>Pago seguro & facturación formal</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="reviews" className="mt-16">
                    <ProductReviews product={product} productId={product.id} productName={product.name} />
                </div>

                {related?.length > 0 && (
                    <div className="mt-16 border-t border-cream pt-12">
                        <SectionHeading eyebrow="Cortes Relacionados" title="Otros cortes que te pueden gustar" />
                        <ProductGrid products={related} />
                    </div>
                )}

                <RecentlyViewed currentProduct={product} currentProductId={product.id} />
            </div>
        </>
    );
}
