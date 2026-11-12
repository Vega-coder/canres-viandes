// Pasarela de pago Stripe para Canadá (en dólares CAD).
// Soporta Stripe Checkout alojado: Tarjetas Visa, Mastercard, American Express, Apple Pay, Google Pay e Interac.

export const STRIPE_CONFIG = Object.freeze({
    publicKey: import.meta.env?.VITE_STRIPE_PUBLIC_KEY
        || 'pk_live_51Ua41KCNARo8kZ2aT5TUHJM17kBKgRA8Muw4qs8dfmuyodpWRwQo0sz5iIXpbABzgKC5fTEm8UEH9AJ2ap0AKzWn00f8uFblJ2',
    currency: 'CAD',
});

/**
 * @param {{
 *   publicKey?: string,
 *   currency?: string,
 * }} config
 */
export const createStripeGateway = ({
    publicKey = STRIPE_CONFIG.publicKey,
    currency = STRIPE_CONFIG.currency,
} = {}) => {
    return {
        isConfigured: Boolean(publicKey),
        publicKey,
        currency,

        /**
         * Crea una sesión de Stripe Checkout en el servidor y redirige al cliente a la página segura de pago.
         * @param {{
         *   order: { code: string, total: number, shipping?: number },
         *   customer: { email: string, fullName: string, phone?: string, city?: string, address?: string },
         *   items: Array<{ name: string, price: number, quantity: number, brand?: string, image?: string }>,
         *   redirectUrl?: string
         * }} params
         * @returns {Promise<{ sessionId: string, url: string }>}
         */
        openCheckout: async ({ order, customer, items, redirectUrl }) => {
            const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lavachecanres.com';
            const successUrl = `${origin}/pedido/${order.code}?session_id={CHECKOUT_SESSION_ID}`;
            const cancelUrl = `${origin}/pedido/${order.code}?status=cancelled`;

            const res = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order,
                    customer,
                    items,
                    successUrl,
                    cancelUrl,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'No se pudo iniciar el proceso de pago con Stripe');
            }

            const data = await res.json();
            if (data.url && typeof window !== 'undefined') {
                window.location.href = data.url;
            }

            return {
                sessionId: data.id,
                url: data.url,
            };
        },

        /**
         * Consulta el estado de una sesión de Stripe Checkout.
         * @param {string} sessionId
         * @returns {Promise<{ status: string, payment_status: string, orderCode?: string, id?: string } | null>}
         */
        getSessionStatus: async (sessionId) => {
            if (!sessionId) return null;
            try {
                const res = await fetch(`/api/check-session?session_id=${encodeURIComponent(sessionId)}`);
                if (!res.ok) return null;
                return await res.json();
            } catch {
                return null;
            }
        },
    };
};
