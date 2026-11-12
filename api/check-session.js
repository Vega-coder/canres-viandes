import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: 'Falta configurar STRIPE_SECRET_KEY en el entorno' });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);

    try {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ error: 'session_id es requerido' });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        return res.status(200).json({
            id: session.id,
            status: session.status,
            payment_status: session.payment_status,
            customer_email: session.customer_details?.email,
            amount_total: session.amount_total,
            currency: session.currency,
            orderCode: session.metadata?.orderCode || session.client_reference_id,
        });
    } catch (err) {
        console.error('[Stripe Check Session Error]:', err);
        return res.status(500).json({
            error: err.message || 'Error al consultar la sesión de Stripe',
        });
    }
}
