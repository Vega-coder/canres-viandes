import { useState, useEffect } from 'react';
import { useCases } from '@/infrastructure/container.js';
import { useCart } from '@/presentation/context/CartContext.jsx';
import { formatMoney, formatUnit } from '@/domain/shared/money.js';
import { getFinalPrice } from '@/domain/catalog/product.js';
import { HiPlus, HiCheck } from 'react-icons/hi2';
import ProductImage from '@/presentation/components/product/ProductImage.jsx';

export default function CartUpsell() {
    const { items, add } = useCart();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addedIds, setAddedIds] = useState(new Set());

    useEffect(() => {
        let mounted = true;
        useCases.browseCatalog()
            .then((result) => {
                if (!mounted) return;
                const available = (result?.products ?? []).filter((p) => p.stock > 0);
                setCandidates(available);
            })
            .catch(() => {})
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    const cartIds = new Set(items.map((i) => i.productId));
    const recommendations = candidates
        .filter((p) => !cartIds.has(p.id))
        .sort((a, b) => {
            if (a.gender === 'chorizos' && b.gender !== 'chorizos') return -1;
            if (b.gender === 'chorizos' && a.gender !== 'chorizos') return 1;
            return a.price - b.price;
        })
        .slice(0, 6);

    if (loading || recommendations.length === 0) return null;

    const handleAdd = (product) => {
        add(product, 1);
        setAddedIds((prev) => new Set(prev).add(product.id));
        setTimeout(() => {
            setAddedIds((prev) => {
                const next = new Set(prev);
                next.delete(product.id);
                return next;
            });
        }, 1600);
    };

    return (
        <div className="mt-6 border-t border-cream pt-5">
            <p className="eyebrow text-brand-wine font-bold text-[10px]">Agrega a tu Parrillada</p>
            <p className="text-xs text-taupe mt-0.5">Chorizos de autor y complementos ideales</p>

            <div className="mt-3 space-y-2.5">
                {recommendations.map((p) => {
                    const isAdded = addedIds.has(p.id);
                    return (
                        <div
                            key={p.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-cream bg-white p-2.5 shadow-2xs hover:border-brand-wine/30 transition"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <ProductImage product={p} className="h-12 w-12 shrink-0 rounded-lg" />
                                <div className="min-w-0">
                                    <p className="font-display text-xs font-bold uppercase truncate text-ink">{p.name}</p>
                                    <p className="text-[11px] font-bold text-brand-wine">
                                        {formatMoney(getFinalPrice(p))} <span className="text-[9.5px] font-normal text-taupe">{formatUnit(p.unit)}</span>
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleAdd(p)}
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition active:scale-90 ${
                                    isAdded
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-brand-wine text-white hover:bg-brand-red'
                                }`}
                                aria-label={`Agregar ${p.name}`}
                            >
                                {isAdded ? <HiCheck className="h-4 w-4" /> : <HiPlus className="h-4 w-4" />}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
