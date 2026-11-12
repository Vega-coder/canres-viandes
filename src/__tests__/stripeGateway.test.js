import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createStripeGateway,
    STRIPE_CONFIG,
} from '@/infrastructure/gateways/stripeGateway.js';

describe('Stripe Gateway (Canada CAD)', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('inicializa con la configuración de producción en CAD', () => {
        const gateway = createStripeGateway();
        expect(gateway.isConfigured).toBe(true);
        expect(gateway.currency).toBe('CAD');
        expect(gateway.publicKey).toBe(STRIPE_CONFIG.publicKey);
        expect(gateway.publicKey.startsWith('pk_live_')).toBe(true);
    });

    it('llama a /api/create-checkout-session con los datos del pedido y cliente', async () => {
        const gateway = createStripeGateway({
            publicKey: 'pk_live_test_123',
            currency: 'CAD',
        });

        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                id: 'cs_test_session_123',
                url: 'https://checkout.stripe.com/c/pay/cs_test_session_123',
            }),
        });
        globalThis.fetch = mockFetch;

        const order = { code: 'CAN-1001', total: 64, shipping: 10 };
        const customer = { fullName: 'Marc Tremblay', email: 'marc@example.ca', phone: '5141234567' };
        const items = [{ name: 'Lomo Ancho AAA', price: 32, quantity: 2 }];

        const result = await gateway.openCheckout({ order, customer, items });

        expect(mockFetch).toHaveBeenCalledWith(
            '/api/create-checkout-session',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
        );
        expect(result.sessionId).toBe('cs_test_session_123');
        expect(result.url).toBe('https://checkout.stripe.com/c/pay/cs_test_session_123');
    });

    it('consulta el estado de la sesión correctamente vía /api/check-session', async () => {
        const gateway = createStripeGateway();

        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                id: 'cs_test_999',
                payment_status: 'paid',
                status: 'complete',
                amount_total: 6400,
            }),
        });
        globalThis.fetch = mockFetch;

        const session = await gateway.getSessionStatus('cs_test_999');

        expect(mockFetch).toHaveBeenCalledWith('/api/check-session?session_id=cs_test_999');
        expect(session.payment_status).toBe('paid');
        expect(session.status).toBe('complete');
    });

    it('maneja errores de red retornando null sin lanzar excepción no controlada', async () => {
        const gateway = createStripeGateway();
        globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        const session = await gateway.getSessionStatus('cs_error_123');
        expect(session).toBeNull();
    });
});
