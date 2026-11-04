import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiOutlineTrash, HiOutlineShare } from 'react-icons/hi2';
import { useWishlist } from '@/presentation/context/WishlistContext.jsx';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import ProductGrid from '@/presentation/components/product/ProductGrid.jsx';
import { toast } from '@/presentation/utils/swal.js';

export default function Wishlist() {
    const { t } = useLanguage();
    const { items, count, clearWishlist } = useWishlist();

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(url);
                toast(t('wishlist.share_copied'), 'success');
            } catch {
                toast(t('wishlist.share_error'), 'info');
            }
        }
    };

    return (
        <div className="container-luxe py-12">
            <header className="mb-10 border-b border-taupe/15 pb-8 text-center">
                <p className="eyebrow text-gold-dark">{t('wishlist.eyebrow')}</p>
                <h1 className="mt-3 font-display text-4xl sm:text-5xl">{t('wishlist.title')}</h1>
                <p className="mt-2 text-sm text-taupe">
                    {count === 0
                        ? t('wishlist.count_zero')
                        : count === 1
                        ? t('wishlist.count_one')
                        : t('wishlist.count_other', { count })}
                </p>
            </header>

            {count === 0 ? (
                <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cream ring-1 ring-taupe/20">
                        <HiOutlineHeart className="h-10 w-10 text-taupe" />
                    </div>
                    <h2 className="mt-6 font-display text-2xl">{t('wishlist.empty_title')}</h2>
                    <p className="mt-2 text-sm text-taupe leading-relaxed">
                        {t('wishlist.empty_desc')}
                    </p>
                    <Link to="/tienda" className="btn-brand mt-8 px-8 py-3.5">
                        {t('wishlist.explore_btn')}
                    </Link>
                </div>
            ) : (
                <>
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-taupe/10 pb-4">
                        <p className="text-xs uppercase tracking-wider text-taupe">
                            {count} {count === 1 ? 'article' : 'articles'}
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-1.5 text-xs text-taupe hover:text-gold-dark transition"
                                title="Copiar enlace"
                            >
                                <HiOutlineShare className="h-4 w-4" />
                                <span>{t('wishlist.share_btn')}</span>
                            </button>
                            <span className="text-taupe/40">·</span>
                            <button
                                onClick={clearWishlist}
                                className="flex items-center gap-1.5 text-xs text-taupe hover:text-red-800 transition"
                            >
                                <HiOutlineTrash className="h-4 w-4" />
                                <span>{t('catalog.clear_filters')}</span>
                            </button>
                        </div>
                    </div>

                    <ProductGrid products={items} />
                </>
            )}
        </div>
    );
}
