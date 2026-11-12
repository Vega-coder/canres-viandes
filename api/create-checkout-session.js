import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: 'Falta configurar STRIPE_SECRET_KEY en el entorno' });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { order, customer, items, successUrl, cancelUrl } = body || {};

        if (!order || !order.code) {
            return res.status(400).json({ error: 'Falta información del pedido (order.code requerido)' });
        }

        const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://lavachecanres.com';

        // Construir items en formato de Stripe (en centavos CAD)
        const lineItems = (items || []).map((item) => {
            const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
            return {
                price_data: {
                    currency: 'cad',
                    product_data: {
                        name: item.name || item.title || 'Produit CANRES Viandes',
                        description: item.brand ? `Boucherie Artisanale · ${item.brand}` : undefined,
                        images: item.image && item.image.startsWith('http') ? [item.image] : undefined,
                    },
                    unit_amount: Math.round(unitPrice * 100),
                },
                quantity: Number(item.quantity) || 1,
            };
        });

        // Configuración de envío
        const shippingCost = Number(order.shipping ?? order.shippingCost ?? 0);
        const shippingOptions = shippingCost > 0 ? [
            {
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: Math.round(shippingCost * 100),
                        currency: 'cad',
                    },
                    display_name: 'Livraison locale réfrigérée (Québec/Montréal)',
                },
            },
        ] : [
            {
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: 0,
                        currency: 'cad',
                    },
                    display_name: 'Livraison gratuite / Envoi inclus',
                },
            },
        ];

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            customer_email: customer?.email || undefined,
            line_items: lineItems.length > 0 ? lineItems : [
                {
                    price_data: {
                        currency: 'cad',
                        product_data: {
                            name: `Commande CANRES Viandes #${order.code}`,
                        },
                        unit_amount: Math.round(Number(order.total) * 100),
                    },
                    quantity: 1,
                },
            ],
            shipping_options: shippingOptions,
            metadata: {
                orderCode: order.code,
                customerName: customer?.fullName || '',
                customerPhone: customer?.phone || '',
                customerCity: customer?.city || '',
                customerAddress: customer?.address || '',
            },
            client_reference_id: order.code,
            success_url: successUrl || `${origin}/pedido/${order.code}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${origin}/pedido/${order.code}?status=cancelled`,
        });

        return res.status(200).json({
            id: session.id,
            url: session.url,
        });
    } catch (err) {
        console.error('[Stripe API Error]:', err);
        return res.status(500).json({
            error: err.message || 'Error al crear sesión de pago en Stripe',
        });
    }
}
