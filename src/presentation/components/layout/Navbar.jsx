import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    HiOutlineMagnifyingGlass,
    HiOutlineShoppingBag,
    HiOutlineBars3,
    HiOutlineXMark,
    HiOutlineUser,
    HiOutlineHeart,
} from 'react-icons/hi2';
import Logo from '@/presentation/components/brand/Logo.jsx';
import LanguageSelector from '@/presentation/components/ui/LanguageSelector.jsx';
import { useCart } from '@/presentation/context/CartContext.jsx';
import { useAuth } from '@/presentation/context/AuthContext.jsx';
import { useWishlist } from '@/presentation/context/WishlistContext.jsx';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';

const linkClass = ({ isActive }) =>
    `relative py-1 text-[11px] font-bold uppercase tracking-[0.14em] transition hover:text-brand-wine ${
        isActive ? 'text-brand-wine after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-brand-wine' : 'text-ink/80'
    }`;

function SearchForm({ onDone, className = '' }) {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    const submit = (e) => {
        e.preventDefault();
        const q = query.trim();
        navigate(q ? `/tienda?q=${encodeURIComponent(q)}` : '/tienda');
        onDone?.();
    };

    return (
        <form onSubmit={submit} className={`relative ${className}`} role="search">
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('nav.search_placeholder')}
                className="input py-2.5 pr-10 text-xs w-full"
                aria-label={t('nav.search_aria')}
            />
            <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe hover:text-brand-wine transition"
                aria-label={t('nav.search_button')}
            >
                <HiOutlineMagnifyingGlass className="h-4 w-4" />
            </button>
        </form>
    );
}

export default function Navbar() {
    const { t, formatMoney } = useLanguage();
    const { count, totals, open } = useCart();
    const { user, isAuthenticated, isVip, vipConfig } = useAuth();
    const vipPercent = vipConfig?.discountPercent || 10;
    const isFirstOrders = vipConfig?.mode === 'first_orders';
    const maxOrders = vipConfig?.maxOrders || 1;
    const bannerBenefitText = isFirstOrders
        ? (maxOrders === 1 ? t('nav.vip_benefit_first') : t('nav.vip_benefit_first_plural', { max: maxOrders }))
        : t('nav.vip_benefit_all');

    const { count: wishlistCount } = useWishlist();
    const { pathname } = useLocation();
    const [menuPath, setMenuPath] = useState(null);
    const [searchPath, setSearchPath] = useState(null);
    const menuOpen = menuPath === pathname;
    const searchOpen = searchPath === pathname;

    const navLinks = useMemo(
        () => [
            { to: '/', label: t('nav.home'), end: true },
            { to: '/tienda', label: t('nav.shop') },
            { to: '/tienda/res', label: t('nav.beef') },
            { to: '/tienda/cerdo', label: t('nav.pork') },
            { to: '/tienda/pollo', label: t('nav.chicken') },
            { to: '/tienda/chivo', label: t('nav.goat_lamb') },
            { to: '/tienda/chorizos', label: t('nav.sausages') },
            { to: '/tienda/canales', label: t('nav.wholesale') },
            { to: '/marcas', label: t('nav.brands') },
        ],
        [t],
    );

    const toggleMenu = useCallback(
        () => setMenuPath((p) => (p === pathname ? null : pathname)),
        [pathname],
    );
    const toggleSearch = useCallback(
        () => setSearchPath((p) => (p === pathname ? null : pathname)),
        [pathname],
    );
    const closeSearch = useCallback(() => setSearchPath(null), []);

    useEffect(() => {
        if (!menuOpen) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [menuOpen]);

    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-cream shadow-sm">
            {/* Barra superior de Beneficio Club VIP y selector rápido de idioma */}
            <div className="bg-gradient-to-r from-brand-wine via-brand-dark to-brand-wine text-white py-1.5 px-4 text-center text-[11px] font-medium tracking-wide">
                <div className="container-luxe flex items-center justify-between gap-2">
                    <div className="flex-1 text-center">
                        {isAuthenticated ? (
                            <div className="flex items-center justify-center gap-2">
                                {isVip ? (
                                    <>
                                        <span className="text-amber-300">👑</span>
                                        <span>
                                            {t('nav.vip_banner_member', {
                                                name: user?.fullName || user?.email?.split('@')[0],
                                                percent: vipPercent,
                                                benefit: bannerBenefitText,
                                            })}
                                        </span>
                                    </>
                                ) : (
                                    <span>
                                        {t('nav.vip_banner_welcome', {
                                            name: user?.fullName || user?.email?.split('@')[0],
                                        })}
                                    </span>
                                )}
                                <Link to="/cuenta" className="hidden sm:inline-block underline text-amber-300 hover:text-white ml-2 text-[10px]">
                                    {t('nav.my_account')}
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <span>{t('nav.vip_banner_guest', { percent: vipPercent, benefit: bannerBenefitText })}</span>
                                <Link to="/registro" className="underline font-bold text-amber-300 hover:text-white">
                                    {t('nav.vip_banner_guest_link')}
                                </Link>
                            </div>
                        )}
                    </div>
                    {/* Selector rápido de idioma en barra superior */}
                    <div className="shrink-0 flex items-center">
                        <LanguageSelector variant="top-bar" />
                    </div>
                </div>
            </div>

            <div className="container-luxe flex h-16 sm:h-20 items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={toggleMenu}
                        className="p-2 text-ink lg:hidden hover:text-brand-wine transition"
                        aria-label={menuOpen ? t('nav.close_menu') : t('nav.open_menu')}
                    >
                        {menuOpen ? <HiOutlineXMark className="h-6 w-6" /> : <HiOutlineBars3 className="h-6 w-6" />}
                    </button>
                    <Logo iconOnly />
                </div>

                <nav className="hidden items-center gap-5 lg:flex">
                    {navLinks.map((link) => (
                        <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="hidden md:block w-48 lg:w-56">
                        <SearchForm />
                    </div>

                    {/* Selector de idioma destacado en la barra principal */}
                    <div className="hidden sm:block">
                        <LanguageSelector />
                    </div>

                    <button
                        type="button"
                        onClick={toggleSearch}
                        className="p-2 text-ink md:hidden hover:text-brand-wine transition"
                        aria-label={t('nav.search_button')}
                    >
                        <HiOutlineMagnifyingGlass className="h-5 w-5" />
                    </button>

                    <Link
                        to="/favoritos"
                        className="relative p-2 text-ink hover:text-brand-wine transition"
                        aria-label={t('nav.wishlist_aria', { count: wishlistCount })}
                    >
                        <HiOutlineHeart className="h-5 w-5" />
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-wine text-[9px] font-bold text-white">
                                {wishlistCount}
                            </span>
                        )}
                    </Link>

                    <Link
                        to={isAuthenticated ? '/cuenta' : '/login'}
                        className="p-2 text-ink hover:text-brand-wine transition"
                        aria-label={isAuthenticated ? `${t('nav.account')}: ${user?.fullName || user?.name || ''}` : t('nav.sign_in')}
                    >
                        <HiOutlineUser className="h-5 w-5" />
                    </Link>

                    <button
                        type="button"
                        onClick={open}
                        className="flex shrink-0 items-center gap-2 rounded-full bg-brand-wine px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-brand-red transition active:scale-95 whitespace-nowrap"
                        aria-label={t('nav.cart_view_aria', { count, total: formatMoney(totals.total) })}
                    >
                        <HiOutlineShoppingBag className="h-4 w-4 shrink-0" />
                        <span className="font-bold">{count}</span>
                        <span className="hidden min-[480px]:inline font-semibold tracking-normal">· {formatMoney(totals.total)}</span>
                    </button>
                </div>
            </div>

            {searchOpen && (
                <div className="border-t border-cream bg-white p-3 md:hidden">
                    <SearchForm onDone={closeSearch} />
                </div>
            )}

            {menuOpen &&
                createPortal(
                    <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
                        <div
                            className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
                            onClick={toggleMenu}
                            aria-hidden="true"
                        />
                        <div className="relative flex w-full max-w-xs flex-col bg-white p-6 shadow-2xl overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-cream pb-4">
                                <Logo compact />
                                <button
                                    type="button"
                                    onClick={toggleMenu}
                                    className="p-2 text-ink hover:text-brand-wine"
                                    aria-label={t('nav.close_menu')}
                                >
                                    <HiOutlineXMark className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Selector de idioma destacado en el menú móvil */}
                            <div className="py-4 border-b border-cream">
                                <LanguageSelector variant="mobile-drawer" />
                            </div>

                            <nav className="mt-4 flex flex-col gap-3">
                                {navLinks.map((link) => (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        end={link.end}
                                        onClick={toggleMenu}
                                        className={({ isActive }) =>
                                            `py-2 text-sm font-bold uppercase tracking-wider transition ${
                                                isActive ? 'text-brand-wine' : 'text-ink/80 hover:text-brand-wine'
                                            }`
                                        }
                                    >
                                        {link.label}
                                    </NavLink>
                                ))}
                            </nav>

                            <div className="mt-auto border-t border-cream pt-6">
                                <Link
                                    to={isAuthenticated ? '/cuenta' : '/login'}
                                    onClick={toggleMenu}
                                    className="btn-brand w-full text-center text-xs"
                                >
                                    {isAuthenticated ? t('nav.account_and_orders') : t('nav.sign_in')}
                                </Link>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </header>
    );
}
