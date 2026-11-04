import { useState, useEffect, useMemo } from 'react';
import { FREE_SHIPPING_THRESHOLD } from '@/domain/cart/cart.js';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

export default function AnnouncementBar() {
    const { t, formatMoney, isFr, isEn } = useLanguage();
    const [index, setIndex] = useState(0);

    const announcements = useMemo(
        () => [
            {
                id: 'slogan',
                text: (
                    <>
                        🥩 CANRES Viandes ·{' '}
                        <span className="font-bold text-brand-light">« La viande comme il faut »</span> ·{' '}
                        {isEn
                            ? 'Colombian Tradition & Quebec Craftsmanship'
                            : 'Tradition Colombienne & Savoir-Faire Québécois'}
                    </>
                ),
            },
            {
                id: 'shipping',
                text: (
                    <>
                        🚚{' '}
                        {isEn
                            ? 'Express refrigerated delivery · '
                            : 'Livraison réfrigérée express · '}
                        <span className="font-bold text-gold">
                            {isEn ? 'FREE' : isFr ? 'GRATUITE' : 'GRATIS'}
                        </span>{' '}
                        {isEn ? 'from ' : isFr ? 'dès ' : 'desde '}
                        <span className="font-semibold text-white">
                            {formatMoney(FREE_SHIPPING_THRESHOLD)}
                        </span>
                    </>
                ),
            },
            {
                id: 'custom',
                text: (
                    <>
                        🔥{' '}
                        <span className="text-brand-light font-bold">
                            {isEn
                                ? '100% Artisan Charcuterie'
                                : 'Charcuterie 100% Artisanale'}
                        </span>{' '}
                        ·{' '}
                        {isEn
                            ? 'Custom sausages from $16/kg'
                            : isFr
                            ? 'Saucisses personnalisées à partir de 16 $/kg'
                            : 'Chorizos personalizados a partir de 16 $/kg'}
                    </>
                ),
            },
        ],
        [isEn, isFr, formatMoney],
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % announcements.length);
        }, 4500);
        return () => clearInterval(timer);
    }, [announcements.length]);

    const prev = () => setIndex((i) => (i - 1 + announcements.length) % announcements.length);
    const next = () => setIndex((i) => (i + 1) % announcements.length);

    const currentAnnouncement = announcements[index % announcements.length];

    return (
        <aside
            className="relative bg-ink py-2 text-cream/90 border-b border-white/5"
            aria-label={t('announcements.slogan')}
        >
            <div className="container-luxe flex items-center justify-between px-4 text-[10.5px] uppercase tracking-[0.16em]">
                <button
                    type="button"
                    onClick={prev}
                    aria-label={t('announcements.prev_aria')}
                    className="p-1 hover:text-white transition"
                >
                    <HiOutlineChevronLeft className="h-3 w-3" />
                </button>
                <div className="flex-1 text-center font-medium overflow-hidden whitespace-nowrap text-ellipsis px-2">
                    {currentAnnouncement?.text}
                </div>
                <button
                    type="button"
                    onClick={next}
                    aria-label={t('announcements.next_aria')}
                    className="p-1 hover:text-white transition"
                >
                    <HiOutlineChevronRight className="h-3 w-3" />
                </button>
            </div>
        </aside>
    );
}
