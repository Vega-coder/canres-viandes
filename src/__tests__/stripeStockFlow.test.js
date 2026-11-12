import { describe, it, expect, beforeEach } from 'vitest';
import { createInMemoryProductRepository } from '@/infrastructure/repositories/inMemoryProductRepository.js';
import { createLocalOrderRepository } from '@/infrastructure/repositories/localOrderRepository.js';
import { makePlaceOrder } from '@/application/orders/placeOrder.js';
import { createWhatsappGateway } from '@/infrastructure/gateways/whatsappGateway.js';

const memoryStorage = () => {
    const data = new Map();
    return {
        getItem: (k) => data.get(k) ?? null,
        setItem: (k, v) => data.set(k, v),
        removeItem: (k) => data.delete(k),
    };
};

const CANADIAN_CUSTOMER = {
    fullName: 'Jean-Philippe Gagnon',
    email: 'jp.gagnon@canres.ca',
    phone: '5148339822',
    city: 'Montréal',
    address: '450 Boulevard Saint-Laurent',
};

const RIB_EYE_AAA = {
    id: 'rib-eye-aaa-1kg',
    name: 'Lomo Ancho Rib Eye AAA',
    brand: 'CANRES Viandes',
    category: 'res',
    price: 32.00,
    unit: 'kg',
    stock: 15,
    isActive: true,
};

describe('Blindaje de Inventario y Flujo de Pagos con Stripe (Canadá CAD)', () => {
    let productRepo;
    let orderRepo;
    let placeOrder;

    beforeEach(() => {
        productRepo = createInMemoryProductRepository([RIB_EYE_AAA], memoryStorage());
        orderRepo = createLocalOrderRepository(memoryStorage(), {
            onSaved: (order) => productRepo.decrementStock(order.items),
            onPaymentApproved: (order) => {},
        });
        placeOrder = makePlaceOrder({
            productRepository: productRepo,
            orderRepository: orderRepo,
            notificationGateway: createWhatsappGateway('15148339822'),
        });
    });

    it('1. NO descuenta inventario si el cliente va a Stripe y abandona o cierra la ventana', async () => {
        // Stock inicial de carne: 15 kg
        const initial = await productRepo.findById('rib-eye-aaa-1kg');
        expect(initial.stock).toBe(15);

        // Cliente confirma datos en /checkout e inicia pago con Stripe (2 kg)
        const { order } = await placeOrder({
            items: [{ productId: 'rib-eye-aaa-1kg', name: 'Lomo Ancho Rib Eye AAA', quantity: 2 }],
            customer: CANADIAN_CUSTOMER,
            paymentMethod: 'stripe',
        });

        // Simulación: El cliente fue redirigido a Stripe Checkout pero cerró la pestaña sin pagar
        // EL INVENTARIO DEBE PERMANECER INTACTO EN 15 KG
        const stockAfterAbandon = await productRepo.findById('rib-eye-aaa-1kg');
        expect(stockAfterAbandon.stock).toBe(15);

        // El pedido permanece pendiente sin descontar productos
        const savedOrder = await orderRepo.findByCode(order.code);
        expect(savedOrder.status).toBe('pending');
        expect(savedOrder.paymentStatus).toBe('pending');
    });

    it('2. NO descuenta inventario si el pago es rechazado o cancelado en Stripe', async () => {
        const { order } = await placeOrder({
            items: [{ productId: 'rib-eye-aaa-1kg', name: 'Lomo Ancho Rib Eye AAA', quantity: 4 }],
            customer: CANADIAN_CUSTOMER,
            paymentMethod: 'stripe',
        });

        // Stripe responde con estado cancelado
        await orderRepo.updateStripePayment(order.code, 'cs_test_cancelled_99', 'cancelled');

        // El stock DEBE permanecer en 15 kg intacto
        const stockAfterFailed = await productRepo.findById('rib-eye-aaa-1kg');
        expect(stockAfterFailed.stock).toBe(15);

        const savedOrder = await orderRepo.findByCode(order.code);
        expect(savedOrder.status).toBe('cancelled');
        expect(savedOrder.paymentStatus).toBe('cancelled');
    });

    it('3. DESCUENTA inventario ÚNICAMENTE cuando Stripe confirma pago exitoso (payment_status: paid)', async () => {
        const { order } = await placeOrder({
            items: [{ productId: 'rib-eye-aaa-1kg', name: 'Lomo Ancho Rib Eye AAA', quantity: 3 }],
            customer: CANADIAN_CUSTOMER,
            paymentMethod: 'stripe',
        });

        // Antes del pago: 15 kg
        expect((await productRepo.findById('rib-eye-aaa-1kg')).stock).toBe(15);

        // Stripe Checkout completa el pago y redirige con éxito (payment_status: paid)
        await orderRepo.updateStripePayment(order.code, 'cs_live_success_123', 'paid');

        // Solo ahora se descuentan los 3 kg de carne (15 - 3 = 12 kg)
        const stockAfterApproval = await productRepo.findById('rib-eye-aaa-1kg');
        expect(stockAfterApproval.stock).toBe(12);

        // La orden se confirma oficialmente para preparación y despacho
        const savedOrder = await orderRepo.findByCode(order.code);
        expect(savedOrder.status).toBe('confirmed');
        expect(savedOrder.paymentStatus).toBe('APPROVED');
        expect(savedOrder.stripeSessionId).toBe('cs_live_success_123');
    });

    it('4. Protección de Idempotencia: Evita descontar doble si Stripe o la red reenvían la confirmación', async () => {
        const { order } = await placeOrder({
            items: [{ productId: 'rib-eye-aaa-1kg', name: 'Lomo Ancho Rib Eye AAA', quantity: 2 }],
            customer: CANADIAN_CUSTOMER,
            paymentMethod: 'stripe',
        });

        // Primera notificación exitosa de Stripe
        await orderRepo.updateStripePayment(order.code, 'cs_live_dup_001', 'paid');
        expect((await productRepo.findById('rib-eye-aaa-1kg')).stock).toBe(13);

        // Segunda notificación duplicada (por ejemplo webhook y redirección simultáneos)
        await orderRepo.updateStripePayment(order.code, 'cs_live_dup_001', 'paid');

        // El inventario NO debe descontarse una segunda vez, permanece en 13
        expect((await productRepo.findById('rib-eye-aaa-1kg')).stock).toBe(13);
    });

    it('5. Si el cliente cancela un intento pero luego reintenta y paga, solo descuenta una vez', async () => {
        // Intento 1: Cliente genera pedido pero cancela
        const { order } = await placeOrder({
            items: [{ productId: 'rib-eye-aaa-1kg', name: 'Lomo Ancho Rib Eye AAA', quantity: 5 }],
            customer: CANADIAN_CUSTOMER,
            paymentMethod: 'stripe',
        });
        await orderRepo.updateStripePayment(order.code, 'cs_live_cancelled_01', 'cancelled');
        expect((await productRepo.findById('rib-eye-aaa-1kg')).stock).toBe(15);

        // Intento 2: Cliente vuelve a su pedido, paga exitosamente en Stripe
        await orderRepo.updateStripePayment(order.code, 'cs_live_ok_02', 'paid');

        // Solo ahora se descuenta
        expect((await productRepo.findById('rib-eye-aaa-1kg')).stock).toBe(10);
        const finalOrder = await orderRepo.findByCode(order.code);
        expect(finalOrder.status).toBe('confirmed');
        expect(finalOrder.paymentStatus).toBe('APPROVED');
    });
});
