import { useState, useEffect } from 'react';
import { FREE_SHIPPING_THRESHOLD } from '@/domain/cart/cart.js';
import { formatMoney } from '@/domain/shared/money.js';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

const ANNOUNCEMENTS = [
    {
        id: 'slogan',
        text: (
            <>
                🥩 CANRES Viandes · <span className="font-bold text-brand-light">« La viande comme il faut »</span> · Tradition Colombienne & Savoir-Faire Québécois
            </>
        ),
    },
    {
        id: 'shipping',
        text: (
            <>
                🚚 Livraison réfrigérée express · <span className="font-bold text-gold">GRATUITE</span> dès{' '}
                <span className="font-semibold text-white">{formatMoney(FREE_SHIPPING_THRESHOLD)}</span>
            </>
        ),
    },
    {
        id: 'custom',
        text: (
            <>
                🔥 Charcuterie 100% Artisanale · <span className="text-brand-light font-bold">Chorizos personnalisés</span> à partir de 16 $/kg
            </>
        ),
    },
];

export default function AnnouncementBar() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
        }, 4500);
        return () => clearInterval(timer);
    }, []);

    const prev = () => setIndex((i) => (i - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
    const next = () => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length);

    return (
        <aside className="relative bg-ink py-2 text-cream/90 border-b border-white/5" aria-label="Avisos y beneficios">
            <div className="container-luxe flex items-center justify-between px-4 text-[10.5px] uppercase tracking-[0.16em]">
                <button
                    type="button"
                    onClick={prev}
                    aria-label="Aviso anterior"
                    className="p-1 hover:text-white transition"
                >
                    <HiOutlineChevronLeft className="h-3 w-3" />
                </button>
                <div className="flex-1 text-center font-medium overflow-hidden whitespace-nowrap text-ellipsis px-2">
                    {ANNOUNCEMENTS[index].text}
                </div>
                <button
                    type="button"
                    onClick={next}
                    aria-label="Aviso siguiente"
                    className="p-1 hover:text-white transition"
                >
                    <HiOutlineChevronRight className="h-3 w-3" />
                </button>
            </div>
        </aside>
    );
}
