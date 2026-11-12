import { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import {
    FaWhatsapp, FaCircleCheck, FaClock, FaCircleXmark, FaRotate,
    FaTruckFast, FaArrowUpRightFromSquare, FaPrint,
} from 'react-icons/fa6';
import { useCases } from '@/infrastructure/container.js';
import { PAYMENT_METHODS } from '@/domain/orders/order.js';
import { useAsync } from '@/presentation/hooks/useAsync.js';
import { useAuth } from '@/presentation/context/AuthContext.jsx';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import Monogram from '@/presentation/components/brand/Monogram.jsx';

export default function OrderConfirmation() {
    const { code } = useParams();
    const { state } = useLocation();
    const [searchParams] = useSearchParams();
    const { isAuthenticated } = useAuth();
    const { t, formatMoney } = useLanguage();

    const queryTxId = searchParams.get('id');
    const querySessionId = searchParams.get('session_id');

    const { data: fetched, loading } = useAsync(
        () => (state?.order ? Promise.resolve(state.order) : useCases.getOrder(code)),
        [code],
    );

    const [paymentUpdate, setPaymentUpdate] = useState(null);
    const [checkingStatus, setCheckingStatus] = useState(false);

    // Verificación automática de Wompi (Colombia)
    useEffect(() => {
        let active = true;
        const txId = queryTxId;
        if (!txId || !fetched || fetched.paymentMethod !== 'wompi' || fetched.paymentStatus === 'APPROVED') {
            return undefined;
        }

        useCases.getWompiTransactionStatus(txId)
            .then((data) => {
                if (!active || !data?.status) return;
                useCases.updateWompiPayment(fetched.code, txId, data.status).catch(() => {});
                setPaymentUpdate({
                    wompiTransactionId: txId,
                    paymentStatus: data.status,
                    status: data.status === 'APPROVED' ? 'confirmed' : fetched.status,
                });
            })
            .catch(() => {});

        return () => {
            active = false;
        };
    }, [queryTxId, fetched]);

    // Verificación automática de Stripe (Canadá - CAD)
    useEffect(() => {
        let active = true;
        const sessionId = querySessionId || fetched?.stripeSessionId;
        if (!sessionId || !fetched || fetched.paymentStatus === 'APPROVED') {
            return undefined;
        }

        useCases.getStripeSessionStatus(sessionId)
            .then((data) => {
                if (!active || !data) return;
                const isPaid = data.payment_status === 'paid' || data.status === 'complete';
                const statusStr = isPaid ? 'APPROVED' : data.status === 'open' ? 'PENDING' : 'DECLINED';
                useCases.updateStripePayment(fetched.code, sessionId, statusStr).catch(() => {});
                setPaymentUpdate({
                    stripeSessionId: sessionId,
                    paymentStatus: statusStr,
                    status: isPaid ? 'confirmed' : fetched.status,
                });
            })
            .catch(() => {});

        return () => {
            active = false;
        };
    }, [querySessionId, fetched]);

    const order = fetched ? { ...fetched, ...paymentUpdate } : null;

    if (loading && !order) return <div className="py-40 text-center text-taupe">{t('orderConfirmation.loading')}</div>;
    if (!order) {
        return (
            <div className="container-luxe py-32 text-center">
                <h1 className="text-4xl">{t('orderConfirmation.not_found_title')}</h1>
                <Link to="/" className="btn-dark mt-8">{t('orderConfirmation.back_home')}</Link>
            </div>
        );
    }

    const payment = PAYMENT_METHODS.find((m) => m.id === order.paymentMethod);
    const isStripe = order.paymentMethod === 'stripe' || Boolean(order.stripeSessionId) || Boolean(querySessionId);
    const isWompi = order.paymentMethod === 'wompi' || Boolean(order.wompiTransactionId);
    const isOnlineGateway = isStripe || isWompi;
    const gatewayStatus = order.paymentStatus || (order.stripeSessionId || order.wompiTransactionId ? 'PENDING' : null);

    const handleManualVerify = async () => {
        if (isStripe) {
            const sId = order.stripeSessionId || querySessionId;
            if (!sId) return;
            setCheckingStatus(true);
            try {
                const data = await useCases.getStripeSessionStatus(sId);
                if (data) {
                    const isPaid = data.payment_status === 'paid' || data.status === 'complete';
                    const statusStr = isPaid ? 'APPROVED' : data.status === 'open' ? 'PENDING' : 'DECLINED';
                    await useCases.updateStripePayment(order.code, sId, statusStr);
                    setPaymentUpdate({
                        stripeSessionId: sId,
                        paymentStatus: statusStr,
                        status: isPaid ? 'confirmed' : order.status,
                    });
                }
            } catch (err) {
                console.warn('Stripe verification error:', err);
            } finally {
                setCheckingStatus(false);
            }
            return;
        }

        const txId = order.wompiTransactionId || queryTxId;
        if (!txId) return;
        setCheckingStatus(true);
        try {
            const data = await useCases.getWompiTransactionStatus(txId);
            if (data?.status) {
                await useCases.updateWompiPayment(order.code, txId, data.status);
                setPaymentUpdate({
                    wompiTransactionId: txId,
                    paymentStatus: data.status,
                    status: data.status === 'APPROVED' ? 'confirmed' : order.status,
                });
            }
        } catch (err) {
            console.warn('Wompi verification error:', err);
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleRetryPayment = async () => {
        setCheckingStatus(true);
        try {
            if (isStripe || !isWompi) {
                await useCases.openStripeCheckout({
                    order,
                    customer: order.customer,
                    items: order.items || [],
                });
                return;
            }

            const res = await useCases.openWompiCheckout({
                order,
                customer: order.customer,
                redirectUrl: `${window.location.origin}/pedido/${order.code}`,
            });
            const txId = res?.transaction?.id;
            const status = res?.status || 'PENDING';
            if (txId) {
                await useCases.updateWompiPayment(order.code, txId, status);
                setPaymentUpdate({
                    wompiTransactionId: txId,
                    paymentStatus: status,
                    status: status === 'APPROVED' ? 'confirmed' : order.status,
                });
            }
        } catch (err) {
            console.error('Payment retry error:', err);
        } finally {
            setCheckingStatus(false);
        }
    };

    return (
        <div className="container-luxe max-w-3xl py-16">
            <div className="flex flex-col items-center text-center">
                <Monogram className="h-16 w-auto" />
                <p className="eyebrow mt-6 text-gold-dark">{t('orderConfirmation.thank_you')}</p>
                <h1 className="mt-3 text-4xl sm:text-5xl">{t('orderConfirmation.order_title', { code: order.code })}</h1>
                <p className="mt-3 text-sm text-taupe">{payment?.label}</p>

                {/* Banner de estado de pasarela segura (Stripe Canadá / Wompi) */}
                {isOnlineGateway && (
                    <div className="mt-6 w-full max-w-md rounded-xl border border-taupe/20 bg-cream/30 p-5 text-left">
                        <div className="flex items-center justify-between border-b border-taupe/15 pb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-taupe">{t('orderConfirmation.payment_status_title')}</span>
                            {gatewayStatus === 'APPROVED' && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                                    <FaCircleCheck className="h-3.5 w-3.5" /> {t('orderConfirmation.paid_approved')}
                                </span>
                            )}
                            {gatewayStatus === 'PENDING' && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                                    <FaClock className="h-3.5 w-3.5" /> {t('orderConfirmation.paid_pending')}
                                </span>
                            )}
                            {(gatewayStatus === 'DECLINED' || gatewayStatus === 'ERROR' || gatewayStatus === 'cancelled') && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                                    <FaCircleXmark className="h-3.5 w-3.5" /> {t('orderConfirmation.paid_declined')}
                                </span>
                            )}
                            {!gatewayStatus && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-taupe/15 px-3 py-1 text-xs font-semibold text-taupe">
                                    {t('orderConfirmation.paid_waiting')}
                                </span>
                            )}
                        </div>

                        <div className="mt-3 space-y-2 text-xs text-ink/80">
                            {(order.stripeSessionId || querySessionId) && (
                                <p className="font-mono text-[11px] text-taupe">
                                    Stripe Ref: <span className="font-semibold text-ink">{order.stripeSessionId || querySessionId}</span>
                                </p>
                            )}
                            {order.wompiTransactionId && (
                                <p className="font-mono text-[11px] text-taupe">
                                    {t('orderConfirmation.tx_id')} <span className="font-semibold text-ink">{order.wompiTransactionId}</span>
                                </p>
                            )}

                            {gatewayStatus === 'APPROVED' ? (
                                <p className="text-emerald-900">
                                    {t('orderConfirmation.approved_msg')}
                                </p>
                            ) : gatewayStatus === 'PENDING' ? (
                                <div>
                                    <p className="text-amber-900">
                                        {t('orderConfirmation.pending_msg')}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleManualVerify}
                                        disabled={checkingStatus}
                                        className="mt-3 inline-flex items-center gap-1.5 rounded border border-amber-400 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                                    >
                                        <FaRotate className={`h-3 w-3 ${checkingStatus ? 'animate-spin' : ''}`} />
                                        {checkingStatus ? t('orderConfirmation.verifying') : t('orderConfirmation.verify_now')}
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-red-900">
                                        {t('orderConfirmation.declined_msg')}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleRetryPayment}
                                        disabled={checkingStatus}
                                        className="btn-dark mt-3 px-4 py-2 text-xs"
                                    >
                                        {t('orderConfirmation.retry_payment')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tarjeta de Trazabilidad y Guía de Transporte para el Cliente */}
                {order.shippingGuideNumber ? (
                    <div className="mt-6 w-full max-w-md rounded-xl border border-emerald-300 bg-emerald-50/70 p-5 text-left shadow-sm">
                        <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-950">
                                <FaTruckFast className="h-4 w-4 text-emerald-700" /> {t('orderConfirmation.shipped_title')}
                            </span>
                            <span className="rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
                                {order.shippingCarrier || t('orderConfirmation.carrier')}
                            </span>
                        </div>
                        <div className="mt-3 space-y-2 text-xs text-ink/80">
                            <div className="flex items-center justify-between">
                                <span className="text-taupe">{t('orderConfirmation.guide_number')}</span>
                                <span className="font-mono text-sm font-bold text-ink">{order.shippingGuideNumber}</span>
                            </div>
                            <p className="text-[11px] text-emerald-900 leading-relaxed">
                                {t('orderConfirmation.shipped_msg', { city: order.customer?.city || '' })}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <a
                                    href={order.shippingTrackingUrl || `https://coordinadora.com/rastreo/guia/${order.shippingGuideNumber}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-dark flex items-center gap-1.5 px-3 py-1.5 text-xs"
                                >
                                    <FaArrowUpRightFromSquare className="h-3 w-3" /> {t('orderConfirmation.track_package')}
                                </a>
                                <button
                                    type="button"
                                    onClick={() => useCases.printShippingLabel(order)}
                                    className="btn-outline flex items-center gap-1.5 bg-white px-3 py-1.5 text-xs"
                                >
                                    <FaPrint className="h-3 w-3" /> {t('orderConfirmation.view_label')}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    wompiStatus === 'APPROVED' && (
                        <div className="mt-6 flex w-full max-w-md items-center gap-3 rounded-xl border border-taupe/20 bg-cream/30 p-4 text-left text-xs text-taupe">
                            <FaTruckFast className="h-5 w-5 text-ink shrink-0" />
                            <span>{t('orderConfirmation.preparing_msg')}</span>
                        </div>
                    )
                )}

                {state?.confirmationUrl && (
                    <>
                        <p className="mt-8 max-w-md text-sm text-ink/80">
                            {t('orderConfirmation.whatsapp_copy')}
                        </p>
                        <a href={state.confirmationUrl} target="_blank" rel="noreferrer" className="btn-gold mt-6 py-4">
                            <FaWhatsapp className="h-4 w-4" /> {t('orderConfirmation.whatsapp_notify')}
                        </a>
                    </>
                )}
            </div>

            <div className="mt-14 bg-white p-6 ring-1 ring-taupe/10 sm:p-8">
                <ul className="divide-y divide-taupe/15 text-sm">
                    {order.items.map((i) => (
                        <li key={i.productId} className="flex justify-between gap-4 py-3">
                            <span>{i.quantity} × {i.brand} {i.name}</span>
                            <span>{formatMoney(i.lineTotal)}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-4 space-y-2 border-t border-taupe/15 pt-4 text-sm">
                    <div className="flex justify-between"><span>{t('orderConfirmation.subtotal')}</span><span>{formatMoney(order.subtotal)}</span></div>
                    <div className="flex justify-between text-taupe"><span>{t('orderConfirmation.shipping')}</span><span>{order.shipping ? formatMoney(order.shipping) : t('orderConfirmation.free')}</span></div>
                    <div className="flex justify-between font-display text-2xl"><span>{t('orderConfirmation.total')}</span><span>{formatMoney(order.total)}</span></div>
                </div>
                <div className="mt-6 border-t border-taupe/15 pt-4 text-sm text-taupe">
                    <p className="text-ink">{order.customer.fullName}</p>
                    <p>{order.customer.address}, {order.customer.city}</p>
                    <p>{order.customer.phone} · {order.customer.email}</p>
                </div>
            </div>

            {!isAuthenticated && (
                <div className="mt-8 border border-gold/30 bg-gold/10 p-6 text-center">
                    <p className="font-display text-lg font-semibold text-ink">
                        {t('orderConfirmation.save_account_title')}
                    </p>
                    <p className="mt-1 text-xs text-taupe">
                        {t('orderConfirmation.save_account_desc', { email: order.customer.email })}
                    </p>
                    <Link
                        to={`/registro?redirect=/cuenta`}
                        className="btn-dark mt-4 inline-block px-6 py-3 text-xs"
                    >
                        {t('orderConfirmation.create_account_btn')}
                    </Link>
                </div>
            )}

            <div className="mt-10 text-center">
                <Link to="/tienda" className="btn-outline">{t('orderConfirmation.continue_shopping')}</Link>
            </div>
        </div>
    );
}
