import { useState, useEffect } from 'react';import { Link, useNavigate } from 'react-router-dom';
import { useCases } from '@/infrastructure/container.js';
import { validateCustomer } from '@/domain/orders/order.js';
import { useCart } from '@/presentation/context/CartContext.jsx';
import { useAuth } from '@/presentation/context/AuthContext.jsx';
import { alertError } from '@/presentation/utils/swal.js';
import CheckoutForm from '@/presentation/components/checkout/CheckoutForm.jsx';
import OrderSummary from '@/presentation/components/checkout/OrderSummary.jsx';

const EMPTY_CUSTOMER = { fullName: '', email: '', phone: '', city: '', address: '', notes: '' };

export default function Checkout() {
    const { items, totals, clear } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(() => ({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        city: '',
        address: '',
        notes: '',
    }));
    const [errors, setErrors] = useState({});
    const paymentMethod = 'wompi';
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!user) return undefined;
        const timer = setTimeout(() => {
            setCustomer((prev) => ({
                ...prev,
                fullName: prev.fullName || user.fullName || '',
                email: prev.email || user.email || '',
                phone: prev.phone || user.phone || '',
            }));
        }, 0);
        return () => clearTimeout(timer);
    }, [user]);

    if (items.length === 0) {
        return (
            <div className="container-luxe flex flex-col items-center py-32 text-center">
                <h1 className="text-4xl">Tu pedido está vacío</h1>
                <p className="mt-3 text-taupe">Agrega cortes de carne o charcutería para continuar con tu pedido.</p>
                <Link to="/tienda" className="btn-brand mt-8">Ir a la tienda</Link>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomer((c) => ({ ...c, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const found = validateCustomer(customer);
        setErrors(found);
        if (Object.keys(found).length) return;

        setSubmitting(true);
        try {
            const { order, confirmationUrl } = await useCases.placeOrder({ items, customer, paymentMethod });

            if (paymentMethod === 'wompi') {
                try {
                    const result = await useCases.openWompiCheckout({
                        order,
                        customer,
                        redirectUrl: `${window.location.origin}/pedido/${order.code}`,
                    });

                    const transactionId = result?.transaction?.id;
                    const status = result?.status || 'PENDING';

                    if (transactionId) {
                        try {
                            await useCases.updateWompiPayment(order.code, transactionId, status);
                        } catch {
                            // Ignorar si falla la sincronización local en background
                        }
                    }

                    if (status === 'APPROVED' || (status === 'PENDING' && transactionId)) {
                        clear();
                        navigate(`/pedido/${order.code}${transactionId ? `?id=${transactionId}` : ''}`, {
                            state: {
                                order: { ...order, wompiTransactionId: transactionId, paymentStatus: status },
                                confirmationUrl,
                            },
                        });
                        return;
                    }

                    if (status === 'CANCELLED_BY_USER' || !transactionId) {
                        // El usuario cerró la ventana de Wompi sin pagar: se conserva el carrito intacto y no se altera el inventario
                        return;
                    }

                    alertError(
                        'Pago no completado',
                        'La transacción no fue aprobada por el banco. Tu carrito sigue guardado para que puedas reintentar con otro medio de pago.'
                    );
                } catch (wompiErr) {
                    alertError('Error con la pasarela Wompi', wompiErr.message || 'No pudimos abrir Wompi en este momento.');
                }
            } else {
                clear();
                navigate(`/pedido/${order.code}`, { state: { order, confirmationUrl } });
            }
        } catch (error) {
            if (error.fields) setErrors(error.fields);
            alertError('No pudimos confirmar tu pedido', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container-luxe py-12">
            <header className="mb-10 text-center">
                <p className="eyebrow text-taupe">Checkout</p>
                <h1 className="mt-3 text-4xl sm:text-5xl">Finalizar compra</h1>
            </header>
            <div className="grid gap-12 lg:grid-cols-[1fr_420px]">
                <div>
                    {isAuthenticated ? (
                        <div className="mb-8 flex flex-col justify-between gap-3 border border-gold/40 bg-gold/10 p-4 text-xs text-ink sm:flex-row sm:items-center">
                            <div>
                                <span className="font-semibold text-gold-dark">Sesión iniciada:</span> Comprando como{' '}
                                <span className="font-semibold">{user.fullName || user.email}</span> ({user.email}). Tu pedido quedará registrado en tu cuenta.
                            </div>
                            <Link to="/cuenta" className="font-medium text-gold-dark underline hover:text-ink">
                                Mi cuenta
                            </Link>
                        </div>
                    ) : (
                        <div className="mb-8 flex flex-col justify-between gap-3 border border-taupe/25 bg-cream/30 p-4 text-xs text-ink sm:flex-row sm:items-center">
                            <div>
                                <span className="font-semibold text-ink">¿Ya tienes cuenta?</span>{' '}
                                <Link to="/login?redirect=/checkout" className="font-semibold text-gold-dark underline hover:text-ink">
                                    Inicia sesión
                                </Link>{' '}
                                para autocompletar tus datos, o continúa como invitado.
                            </div>
                            <span className="inline-block self-start rounded bg-taupe/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-taupe sm:self-auto">
                                Compra como invitado
                            </span>
                        </div>
                    )}

                    <CheckoutForm
                        values={customer}
                        errors={errors}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        submitting={submitting}
                    />
                </div>
                <div className="lg:sticky lg:top-36 lg:self-start">
                    <OrderSummary items={items} totals={totals} />
                </div>
            </div>
        </div>
    );
}
