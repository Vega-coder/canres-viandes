import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/presentation/context/AuthContext.jsx';
import { useCases } from '@/infrastructure/container.js';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import { HiOutlineShoppingBag, HiOutlineArrowRightOnRectangle, HiOutlineShieldCheck } from 'react-icons/hi2';

export default function Account() {
    const { user, isAuthenticated, loading: authLoading, signOut, isVip, vipConfig } = useAuth();
    const { t, formatMoney, language } = useLanguage();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    const vipPercent = vipConfig?.discountPercent || 10;
    const isFirstOrders = vipConfig?.mode === 'first_orders';
    const maxOrders = vipConfig?.maxOrders || 1;

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login?redirect=/cuenta', { replace: true });
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        if (!isAuthenticated) return undefined;
        let active = true;
        useCases.getUserOrders()
            .then((list) => {
                if (active) setOrders(list || []);
            })
            .catch(() => {
                if (active) setOrders([]);
            })
            .finally(() => {
                if (active) setLoadingOrders(false);
            });

        return () => {
            active = false;
        };
    }, [isAuthenticated]);

    if (authLoading || !user) {
        return <div className="container-luxe min-h-[60vh] py-20 text-center">…</div>;
    }

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'confirmed':
                return { label: t('account.status_confirmed'), cls: 'bg-blue-100 text-blue-800' };
            case 'shipped':
                return { label: t('account.status_shipped'), cls: 'bg-purple-100 text-purple-800' };
            case 'delivered':
                return { label: t('account.status_delivered'), cls: 'bg-emerald-100 text-emerald-800' };
            case 'cancelled':
                return { label: t('account.status_cancelled'), cls: 'bg-rose-100 text-rose-800' };
            default:
                return { label: t('account.status_pending'), cls: 'bg-amber-100 text-amber-800' };
        }
    };

    return (
        <div className="container-luxe py-12">
            {/* Cabecera del perfil */}
            <div className="flex flex-col justify-between gap-6 border-b border-taupe/15 pb-8 sm:flex-row sm:items-center">
                <div>
                    <p className="eyebrow text-taupe">{t('account.eyebrow')}</p>
                    <h1 className="mt-2 text-3xl sm:text-4xl">
                        {t('account.greeting', { name: user.fullName || user.email.split('@')[0] })}
                    </h1>
                    <p className="mt-1 text-sm text-taupe">
                        {user.email} {user.phone && `· ${user.phone}`}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {user.isAdmin && (
                        <Link to="/admin" className="btn-outline flex items-center gap-2 border-gold text-xs text-gold-dark hover:bg-gold hover:text-ink">
                            <HiOutlineShieldCheck className="h-4 w-4" />
                            {t('account.admin_panel')}
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="btn-outline flex items-center gap-2 text-xs"
                    >
                        <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                        {t('account.logout')}
                    </button>
                </div>
            </div>

            {/* Tarjeta de Membresía Club VIP */}
            <div className="mt-8 rounded-2xl bg-gradient-to-r from-amber-500/15 via-gold/20 to-amber-600/10 p-6 sm:p-8 border border-amber-300/60 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-3xl shadow-md">
                            👑
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                                    {t('account.vip_badge')}
                                </span>
                                {isVip && (
                                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-400/40">
                                        {t('account.vip_percent', { percent: vipPercent })}
                                    </span>
                                )}
                            </div>
                            <h2 className="font-display text-2xl font-bold text-ink mt-0.5">
                                Club VIP CANRES Viandes
                            </h2>
                        </div>
                    </div>
                    {isVip && (
                        <Link to="/tienda" className="btn-brand whitespace-nowrap self-start sm:self-auto text-xs shadow-md">
                            {t('account.explore_shop')}
                        </Link>
                    )}
                </div>
            </div>

            {/* Listado de pedidos */}
            <div className="mt-12">
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl">{t('account.my_orders')}</h2>
                    <span className="text-xs text-taupe">{orders.length}</span>
                </div>

                {loadingOrders ? (
                    <div className="py-12 text-center text-sm text-taupe">…</div>
                ) : orders.length === 0 ? (
                    <div className="mt-8 flex flex-col items-center justify-center rounded border border-dashed border-taupe/30 py-16 text-center">
                        <HiOutlineShoppingBag className="h-12 w-12 text-taupe/50" />
                        <p className="mt-4 font-display text-xl">{t('account.no_orders')}</p>
                        <p className="mt-1 text-xs text-taupe">{t('account.no_orders_hint')}</p>
                        <Link to="/tienda" className="btn-dark mt-6 text-xs">
                            {t('account.explore_shop')}
                        </Link>
                    </div>
                ) : (
                    <div className="mt-6 space-y-4">
                        {orders.map((o) => {
                            const status = getStatusInfo(o.status);
                            const locale = language === 'fr' ? 'fr-CA' : language === 'en' ? 'en-CA' : 'es-CO';
                            const dateStr = o.createdAt
                                ? new Date(o.createdAt).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
                                : '';

                            return (
                                <article
                                    key={o.id || o.code}
                                    className="flex flex-col justify-between gap-4 border border-taupe/15 bg-white p-5 transition hover:border-gold/60 sm:flex-row sm:items-center"
                                >
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-sm font-semibold tracking-wide">
                                                #{o.code}
                                            </span>
                                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${status.cls}`}>
                                                {status.label}
                                            </span>
                                            {o.shippingGuideNumber && (
                                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                                                    📦 {o.shippingCarrier}: {o.shippingGuideNumber}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-taupe">
                                            {dateStr}
                                        </p>
                                        <p className="mt-1 text-xs text-ink/80">
                                            {o.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase tracking-wider text-taupe">{t('cart.total')}</p>
                                            <p className="font-display text-lg font-semibold text-ink">
                                                {formatMoney(o.total)}
                                            </p>
                                        </div>
                                        <Link
                                            to={`/pedido/${o.code}`}
                                            className="btn-outline px-4 py-2 text-[10px]"
                                        >
                                            {t('account.view_detail')}
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
