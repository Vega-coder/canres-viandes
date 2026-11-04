import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCases } from '@/infrastructure/container.js';
import { validateCustomer } from '@/domain/orders/order.js';
import { useCart } from '@/presentation/context/CartContext.jsx';
import { useAuth } from '@/presentation/context/AuthContext.jsx';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import { alertError } from '@/presentation/utils/swal.js';
import CheckoutForm from '@/presentation/components/checkout/CheckoutForm.jsx';
import OrderSummary from '@/presentation/components/checkout/OrderSummary.jsx';

export default function Checkout() {
    const { t } = useLanguage();
    const { items, totals, clear } = useCart();
    const { user } = useAuth();
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
                <h1 className="text-4xl">{t('checkout.empty_title')}</h1>
                <p className="mt-3 text-taupe">{t('checkout.empty_desc')}</p>
                <Link to="/tienda" className="btn-brand mt-8">{t('checkout.go_to_shop')}</Link>
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
        if (Object.keys(found).length > 0) return;

        setSubmitting(true);
        try {
            const redirectUrl = `${window.location.origin}/pedido/{code}`;
            const result = await useCases.placeOrder({
                items,
                customer,
                paymentMethod,
                redirectUrl,
            });

            clear();

            if (result.checkoutUrl) {
                window.location.href = result.checkoutUrl;
                return;
            }

            navigate(`/pedido/${result.order.code}`, {
                replace: true,
                state: { order: result.order },
            });
        } catch (err) {
            console.error('[Checkout Error]:', err);
            await alertError('No pudimos procesar tu pedido', err.message || 'Por favor verifica tus datos e inténtalo de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container-luxe py-12">
            <header className="mb-10 text-center">
                <p className="eyebrow text-taupe">{t('cart.page_title')}</p>
                <h1 className="mt-3 text-4xl sm:text-5xl">{t('cart.checkout_btn')}</h1>
            </header>

            <div className="grid gap-12 lg:grid-cols-[1fr_420px]">
                <CheckoutForm
                    values={customer}
                    errors={errors}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                />
                <aside className="h-fit">
                    <OrderSummary items={items} totals={totals} />
                </aside>
            </div>
        </div>
    );
}
