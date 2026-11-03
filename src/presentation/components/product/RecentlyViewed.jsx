import { useState, useEffect } from 'react';
import SectionHeading from '@/presentation/components/ui/SectionHeading.jsx';
import ProductGrid from '@/presentation/components/product/ProductGrid.jsx';

const STORAGE_KEY = 'ap_recently_viewed';
const MAX_STORED = 10;

export default function RecentlyViewed({ currentProduct, currentProductId }) {
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const targetId = currentProduct?.id || currentProductId;

    useEffect(() => {
        if (!targetId) return;

        let items = [];
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    items = parsed.filter((p) => p && typeof p === 'object' && p.id && p.name);
                }
            }
        } catch {
            items = [];
        }

        // Filtrar los que no sean el actual para mostrarlos en el historial
        const others = items.filter((p) => p.id !== targetId);
        setRecentlyViewed(others);

        // Guardar el actual al inicio de la lista si se pasó el objeto completo
        if (currentProduct?.id) {
            const compactProduct = {
                id: currentProduct.id,
                slug: currentProduct.slug,
                name: currentProduct.name,
                brand: currentProduct.brand || 'CANRES Viandes',
                gender: currentProduct.gender || 'res',
                unit: currentProduct.unit || 'kg',
                price: Number(currentProduct.price) || 0,
                discountPercent: Number(currentProduct.discountPercent) || 0,
                stock: Number(currentProduct.stock) || 0,
                images: currentProduct.images || [],
                palette: currentProduct.palette,
                notes: currentProduct.notes || [],
                isNew: Boolean(currentProduct.isNew),
                isFeatured: Boolean(currentProduct.isFeatured),
            };

            const updated = [compactProduct, ...items.filter((p) => p.id !== targetId)].slice(0, MAX_STORED);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch {
                // Ignorar
            }
        }
    }, [targetId, currentProduct]);

    if (!recentlyViewed.length) {
        return null;
    }

    return (
        <section className="border-t border-taupe/15 bg-cream/20 py-16 sm:py-20">
            <div className="container-luxe">
                <SectionHeading
                    eyebrow="Tu historial"
                    title="Vistos recientemente"
                />
                <ProductGrid products={recentlyViewed.slice(0, 4)} columns="lg:grid-cols-4" />
            </div>
        </section>
    );
}
