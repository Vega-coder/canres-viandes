import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineShoppingBag, HiHeart, HiOutlineHeart, HiCheck, HiStar } from 'react-icons/hi2';
import { isOnSale } from '@/domain/catalog/product.js';
import { formatMoney } from '@/domain/shared/money.js';
import { useCart } from '@/presentation/context/CartContext.jsx';
import { useWishlist } from '@/presentation/context/WishlistContext.jsx';
import ProductImage from './ProductImage.jsx';
import PriceTag from './PriceTag.jsx';

export default function ProductCard({ product }) {
    const { add } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [justAdded, setJustAdded] = useState(false);
    const isFav = isInWishlist(product.id);
    const soldOut = product.stock <= 0;

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        add(product);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1600);
    };

    return (
        <article className="group flex flex-col rounded-2xl bg-white p-3 border border-cream transition-all duration-300 hover:border-brand-wine/30 hover:shadow-xl hover:-translate-y-1">
            <div className="relative block overflow-hidden rounded-xl bg-cream-paper">
                <Link to={`/producto/${product.slug}`} className="block">
                    <ProductImage
                        product={product}
                        className="aspect-[4/3] sm:aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                </Link>

                {/* Badges superiores */}
                <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col gap-1">
                    {product.brand?.includes('AAA') && (
                        <span className="bg-brand-wine px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white rounded">
                            Grado AAA
                        </span>
                    )}
                    {product.gender === 'chorizos' && (
                        <span className="bg-brand-dark px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-200 rounded">
                            100% Artesanal
                        </span>
                    )}
                    {product.isNew && (
                        <span className="bg-ink px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white rounded">
                            Novedad
                        </span>
                    )}
                    {isOnSale(product) && (
                        <span className="bg-amber-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white rounded">
                            Oferta
                        </span>
                    )}
                    {soldOut && (
                        <span className="bg-taupe px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white rounded">
                            Agotado
                        </span>
                    )}
                </div>

                {/* Botón Favoritos */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product);
                    }}
                    aria-label={isFav ? `Quitar ${product.name} de favoritos` : `Guardar ${product.name} en favoritos`}
                    className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full transition shadow-sm active:scale-125 ${
                        isFav
                            ? 'bg-brand-wine text-white scale-105'
                            : 'bg-white/90 text-ink/70 hover:bg-white hover:text-brand-wine backdrop-blur-sm'
                    }`}
                >
                    {isFav ? <HiHeart className="h-4 w-4" /> : <HiOutlineHeart className="h-4 w-4" />}
                </button>

                {/* Notas rápidas en hover */}
                {product.notes?.length > 0 && (
                    <div className="pointer-events-none absolute inset-x-2 bottom-2 z-10 flex justify-center opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                        <span className="rounded-full bg-ink/90 px-3 py-1 text-[9.5px] font-semibold text-cream-light backdrop-blur-md shadow truncate max-w-[95%]">
                            🔪 {product.notes.slice(0, 2).join(' · ')}
                        </span>
                    </div>
                )}
            </div>

            <div className="mt-3 flex flex-1 flex-col">
                <p className="text-[10px] uppercase font-bold tracking-wider text-brand-wine">{product.brand}</p>
                <Link to={`/producto/${product.slug}`} className="mt-0.5 font-display text-base font-bold text-ink leading-snug hover:text-brand-wine transition">
                    {product.name}
                </Link>
                {product.subname && (
                    <p className="mt-0.5 text-xs text-taupe font-serif italic truncate">{product.subname}</p>
                )}

                <div className="mt-auto pt-3">
                    <PriceTag product={product} />

                    <div className="mt-2 flex items-center gap-1.5 text-[10.5px]">
                        {product.hasFreeShipping || !product.shippingCost || product.shippingCost <= 0 ? (
                            <span className="font-semibold text-emerald-700">❄️ Envío refrigerado gratis</span>
                        ) : (
                            <span className="text-taupe">Envío refrigerado: <span className="font-semibold text-ink">{formatMoney(product.shippingCost)}</span></span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={soldOut}
                        className={`mt-3 w-full rounded-lg px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95 ${
                            justAdded
                                ? 'bg-emerald-700 text-white shadow-md'
                                : 'bg-brand-wine text-white hover:bg-brand-red shadow-sm hover:shadow-brand-wine/25'
                        }`}
                        aria-label={`Agregar ${product.name} al carrito`}
                    >
                        {justAdded ? (
                            <>
                                <HiCheck className="h-4 w-4" />
                                <span>¡Agregado al pedido!</span>
                            </>
                        ) : (
                            <>
                                <HiOutlineShoppingBag className="h-4 w-4" />
                                <span>{soldOut ? 'Agotado' : 'Agregar al pedido'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </article>
    );
}
