import { describe, it, expect, vi } from 'vitest';
import { createInMemoryProductRepository } from '@/infrastructure/repositories/inMemoryProductRepository.js';
import { createLocalOrderRepository } from '@/infrastructure/repositories/localOrderRepository.js';
import { createWhatsappGateway } from '@/infrastructure/gateways/whatsappGateway.js';
import { createDemoAuthGateway } from '@/infrastructure/gateways/authGateways.js';
import { makeBrowseCatalog, makeGetProductDetail } from '@/application/catalog/catalogUseCases.js';
import { makePlaceOrder } from '@/application/orders/placeOrder.js';
import {
    makeSignInCustomer, makeSignUpCustomer, makeSignInWithGoogle, makeGetCurrentUser,
    makeResetPassword, makeUpdatePassword,
} from '@/application/auth/authUseCases.js';
import { SEED_PRODUCTS } from '@/infrastructure/data/seedProducts.js';

const memoryStorage = () => {
    const data = new Map();
    return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
};

const productRepository = createInMemoryProductRepository(SEED_PRODUCTS);
const customer = { fullName: 'Luis Pérez', email: 'luis@correo.com', phone: '3157654321', city: 'Montréal', address: '123 Boulevard Saint-Laurent' };

describe('Casos de uso del catálogo', () => {
    const browse = makeBrowseCatalog({ productRepository });

    it('filtra por categoría', async () => {
        const { products } = await browse({ category: 'res' });
        expect(products.length).toBeGreaterThan(0);
        expect(products.every((p) => p.gender === 'res')).toBe(true);
    });

    it('filtra por aroma / estilo culinario', async () => {
        const { products } = await browse({ aroma: 'parrilla' });
        expect(products.length).toBeGreaterThan(0);
    });

    it('expone las marcas de la categoría aunque haya filtro de marca', async () => {
        const { products, brands } = await browse({ category: 'res', brands: ['Res AAA'] });
        expect(products.every((p) => p.brand === 'Res AAA')).toBe(true);
        expect(brands.length).toBeGreaterThanOrEqual(1);
    });

    it('devuelve detalle y relacionados', async () => {
        const getDetail = makeGetProductDetail({ productRepository });
        const { product, related } = await getDetail('lomo-ancho-rib-eye');
        expect(product.name).toBe('Lomo Ancho Rib Eye');
        expect(related.find((p) => p.id === product.id)).toBeUndefined();
        expect((await getDetail('no-existe')).product).toBeNull();
    });

    it('resuelve producto por ID o slug flexible para evitar errores 404', async () => {
        const getDetail = makeGetProductDetail({ productRepository });
        const { product: byId } = await getDetail('lomo-ancho-rib-eye');
        expect(byId?.name).toBe('Lomo Ancho Rib Eye');

        const { product: picanha } = await getDetail('punta-de-picanha-aaa');
        expect(picanha?.name).toBe('Punta de Picaña AAA');

        const { product: byPartial } = await getDetail('costilla-de-cerdo-baby');
        expect(byPartial?.name).toBe('Costilla de Cerdo (Baby Back)');
    });
});

describe('placeOrder', () => {
    const orderRepository = createLocalOrderRepository(memoryStorage());
    const placeOrder = makePlaceOrder({
        productRepository,
        orderRepository,
        notificationGateway: createWhatsappGateway('573001112233'),
        clock: () => new Date('2026-10-18T10:00:00Z'),
    });

    it('usa el precio del repositorio, no el que viene del navegador', async () => {
        const items = [{ productId: 'lomo-ancho-rib-eye', name: 'Lomo Ancho Rib Eye', brand: 'Res AAA', unitPrice: 1, quantity: 1, stock: 99 }];
        const { order, confirmationUrl } = await placeOrder({ items, customer, paymentMethod: 'wompi' });
        expect(order.items[0].unitPrice).toBe(32);
        expect(confirmationUrl).toContain('https://wa.me/573001112233');
        expect(await orderRepository.findByCode(order.code)).toMatchObject({ code: order.code });
    });

    it('rechaza productos agotados', async () => {
        const customRepo = createInMemoryProductRepository([
            { ...SEED_PRODUCTS[0], id: 'agotado', stock: 0 }
        ]);
        const customPlace = makePlaceOrder({
            productRepository: customRepo,
            orderRepository,
            notificationGateway: createWhatsappGateway('573001112233')
        });
        const items = [{ productId: 'agotado', name: 'Corte Agotado', unitPrice: 10, quantity: 1, stock: 0 }];
        await expect(customPlace({ items, customer, paymentMethod: 'wompi' })).rejects.toThrow('stock');
    });

    it('rechaza productos que ya no existen', async () => {
        const save = vi.fn();
        const place = makePlaceOrder({ productRepository, orderRepository: { save }, notificationGateway: createWhatsappGateway('57') });
        const items = [{ productId: 'fantasma', name: 'Fantasma', quantity: 1 }];
        await expect(place({ items, customer, paymentMethod: 'wompi' })).rejects.toThrow('disponible');
        expect(save).not.toHaveBeenCalled();
    });
});

describe('Autenticación de clientes', () => {
    const authGateway = createDemoAuthGateway({ email: 'admin@canres.test', password: 'admin-password', storage: memoryStorage() });
    const signUp = makeSignUpCustomer({ authGateway });
    const signIn = makeSignInCustomer({ authGateway });
    const getCurrentUser = makeGetCurrentUser({ authGateway });

    it('registra un nuevo cliente con datos válidos', async () => {
        const user = await signUp({
            fullName: 'Ana Gómez',
            email: 'ana@ejemplo.com',
            password: 'clave-segura-123',
            phone: '3001234567',
        });
        expect(user.email).toBe('ana@ejemplo.com');
        expect(user.fullName).toBe('Ana Gómez');
    });

    it('rechaza registros con contraseña corta o sin nombre', async () => {
        await expect(signUp({ fullName: '', email: 'x@y.com', password: '123' })).rejects.toThrow();
        await expect(signUp({ fullName: 'Pedro', email: 'x@y.com', password: '123' })).rejects.toThrow();
    });

    it('inicia sesión con el cliente registrado', async () => {
        await signUp({
            fullName: 'Carlos Ruiz',
            email: 'carlos@ejemplo.com',
            password: 'clave-segura-123',
        });
        const user = await signIn('carlos@ejemplo.com', 'clave-segura-123');
        expect(user.email).toBe('carlos@ejemplo.com');
        const current = await getCurrentUser();
        expect(current?.email).toBe('carlos@ejemplo.com');
    });

    it('inicia sesión con Google OAuth', async () => {
        const signInWithGoogle = makeSignInWithGoogle({ authGateway });
        const user = await signInWithGoogle('/');
        expect(user.email).toBe('cliente.google@canres.test');
        expect(user.fullName).toBe('Cliente Google Demo');
    });

    it('solicita restablecimiento de contraseña validando el correo', async () => {
        const reset = makeResetPassword({ authGateway });
        await expect(reset('')).rejects.toThrow();
        await expect(reset('correo-invalido')).rejects.toThrow();
        await expect(reset('cliente@ejemplo.com')).resolves.toMatchObject({ success: true });
    });

    it('actualiza la contraseña validando longitud mínima', async () => {
        const update = makeUpdatePassword({ authGateway });
        await expect(update('123')).rejects.toThrow();
        await expect(update('nueva-clave-segura')).resolves.toMatchObject({ success: true });
    });
});
