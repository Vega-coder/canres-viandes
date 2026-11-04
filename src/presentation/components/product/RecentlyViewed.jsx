import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/context/AuthContext.jsx';
import SectionHeading from '@/presentation/components/ui/SectionHeading.jsx';
import ProductGrid from '@/presentation/components/product/ProductGrid.jsx';

const LEGACY_STORAGE_KEY = 'ap_recently_viewed';
const MAX_STORED = 10;

const getRecentlyViewedStorageKey = (userId) =>
    (userId ? `canres_recently_viewed_${userId}` : 'canres_recently_viewed_guest');

export default function RecentlyViewed({ currentProduct, currentProductId }) {
    const { user } = useAuth();
    const userId = user?.id || null;
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const targetId = currentProduct?.id || currentProductId;

    useEffect(() => {
        if (!targetId) return;

        let items = [];
        try {
            // Eliminar clave legada no aislada
            localStorage.removeItem(LEGACY_STORAGE_KEY);
            const key = getRecentlyViewedStorageKey(userId);
            const raw = localStorage.getItem(key);
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
                const key = getRecentlyViewedStorageKey(userId);
                localStorage.setItem(key, JSON.stringify(updated));
            } catch {
                // Ignorar
            }
        }
    }, [targetId, currentProduct, userId]);

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
