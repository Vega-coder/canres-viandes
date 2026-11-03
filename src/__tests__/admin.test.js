import { describe, it, expect, beforeEach } from 'vitest';
import { createInMemoryProductRepository } from '@/infrastructure/repositories/inMemoryProductRepository.js';
import { createLocalOrderRepository } from '@/infrastructure/repositories/localOrderRepository.js';
import { createDemoAuthGateway } from '@/infrastructure/gateways/authGateways.js';
import { createWhatsappGateway } from '@/infrastructure/gateways/whatsappGateway.js';
import { makeSaveProduct, makeDeleteProduct, makeToggleProductActive, makeListProductsForAdmin } from '@/application/admin/productAdmin.js';
import { makeChangeOrderStatus, makeGetDashboard } from '@/application/admin/orderAdmin.js';
import { makeSignInAdmin, makeGetCurrentAdmin } from '@/application/auth/authUseCases.js';
import { makePlaceOrder } from '@/application/orders/placeOrder.js';
import { makeBrowseCatalog } from '@/application/catalog/catalogUseCases.js';
import { validateProductInput } from '@/domain/catalog/product.js';
import { SEED_PRODUCTS } from '@/infrastructure/data/seedProducts.js';

const memoryStorage = () => {
    const data = new Map();
    return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: (k) => data.delete(k) };
};

const customer = { fullName: 'Marta Ruiz', email: 'marta@correo.com', phone: '3101234567', city: 'Montréal', address: '456 Rue Saint-Denis' };

const validMeatInput = {
    name: 'Tomahawk AAA', brand: 'Res AAA', gender: 'res', type: 'corte',
    unit: 'kg', price: '45', discountPercent: '0', stock: '10', notes: 'Hueso largo, Marmoleo superior', images: [],
    isActive: true, isFeatured: false, isNew: true,
};

let productRepository;
let orderRepository;

beforeEach(() => {
    productRepository = createInMemoryProductRepository(SEED_PRODUCTS, memoryStorage());
    orderRepository = createLocalOrderRepository(memoryStorage(), { onSaved: (o) => productRepository.decrementStock(o.items) });
});

describe('Validación de producto', () => {
    it('acepta un producto completo', () => {
        expect(validateProductInput(validMeatInput)).toEqual({});
    });
    it('marca precio, stock y descuento inválidos', () => {
        const errors = validateProductInput({ ...validMeatInput, price: '0', stock: '-1', discountPercent: '95' });
        expect(Object.keys(errors).sort()).toEqual(['discountPercent', 'price', 'stock']);
    });
});

describe('Administración de productos', () => {
    it('crea un producto con notas e id derivado', async () => {
        const saved = await makeSaveProduct({ productRepository })(validMeatInput);
        expect(saved.id).toBe('res-aaa-tomahawk-aaa');
        expect(saved.notes).toContain('Hueso largo');
        expect(saved.price).toBe(45);
    });

    it('permite configurar si tiene envío gratis o costo específico de envío', async () => {
        const save = makeSaveProduct({ productRepository });
        const free = await save({ ...validMeatInput, name: 'Corte Especial', hasFreeShipping: true });
        expect(free.hasFreeShipping).toBe(true);
        expect(free.shippingCost).toBe(0);

        const paid = await save({ ...validMeatInput, name: 'Corte Pesado', hasFreeShipping: false, shippingCost: '18' });
        expect(paid.hasFreeShipping).toBe(false);
        expect(paid.shippingCost).toBe(18);
    });

    it('permite vincular estilos culinarios y los preserva en el producto', async () => {
        const saved = await makeSaveProduct({ productRepository })({
            ...validMeatInput,
            name: 'Picaña Brasa',
            aromas: ['parrilla'],
        });
        expect(saved.aromas).toEqual(['parrilla']);
    });

    it('edita sin cambiar el slug publicado', async () => {
        const save = makeSaveProduct({ productRepository });
        const original = await productRepository.findById('lomo-ancho-rib-eye');
        const saved = await save({ ...original, name: 'Ribeye Edición Especial', price: '35', stock: '4', notes: 'Marmoleo superior' });
        expect(saved.slug).toBe(original.slug);
        expect(saved.name).toBe('Ribeye Edición Especial');
    });

    it('rechaza duplicados y datos inválidos con errores por campo', async () => {
        const save = makeSaveProduct({ productRepository });
        await save(validMeatInput);
        await expect(save(validMeatInput)).rejects.toMatchObject({ fields: { name: 'Producto duplicado' } });
        await expect(save({ ...validMeatInput, name: '' })).rejects.toMatchObject({ fields: { name: expect.any(String) } });
    });

    it('ocultar un producto lo saca de la tienda pero no del admin', async () => {
        await makeToggleProductActive({ productRepository })('lomo-ancho-rib-eye');
        const { products } = await makeBrowseCatalog({ productRepository })({});
        expect(products.find((p) => p.id === 'lomo-ancho-rib-eye')).toBeUndefined();
        const admin = await makeListProductsForAdmin({ productRepository })();
        expect(admin.find((p) => p.id === 'lomo-ancho-rib-eye').isActive).toBe(false);
    });

    it('elimina un producto', async () => {
        await makeDeleteProduct({ productRepository })('carne-molida-extra-magra');
        expect(await productRepository.findById('carne-molida-extra-magra')).toBeNull();
    });
});

describe('Administración de pedidos', () => {
    const placeFirstOrder = () =>
        makePlaceOrder({ productRepository, orderRepository, notificationGateway: createWhatsappGateway('57') })({
            items: [{ productId: 'lomo-ancho-rib-eye', name: 'Lomo Ancho Rib Eye', brand: 'Res AAA', quantity: 2 }],
            customer,
            paymentMethod: 'wompi',
        });

    it('descuenta stock en modo demo al confirmar el pago del pedido', async () => {
        const initialStock = (await productRepository.findById('lomo-ancho-rib-eye')).stock;
        const { order } = await placeFirstOrder();
        expect((await productRepository.findById('lomo-ancho-rib-eye')).stock).toBe(initialStock);
        await orderRepository.updateWompiPayment(order.code, 'tx-test-123', 'APPROVED');
        expect((await productRepository.findById('lomo-ancho-rib-eye')).stock).toBe(initialStock - 2);
    });

    it('solo permite transiciones válidas', async () => {
        const { order } = await placeFirstOrder();
        const change = makeChangeOrderStatus({ orderRepository });
        await expect(change(order.code, 'delivered')).rejects.toThrow('No se puede pasar');
        await change(order.code, 'confirmed');
        expect((await orderRepository.findByCode(order.code)).status).toBe('confirmed');
    });

    it('resume ventas en el tablero excluyendo cancelados', async () => {
        const { order } = await placeFirstOrder();
        const dashboard = makeGetDashboard({ orderRepository, productRepository });
        expect((await dashboard()).revenue).toBe(order.total);
        expect((await dashboard()).topProducts[0]).toMatchObject({ productId: 'lomo-ancho-rib-eye', units: 2 });

        await makeChangeOrderStatus({ orderRepository })(order.code, 'cancelled');
        const after = await dashboard();
        expect(after.revenue).toBe(0);
    });
});

describe('Autenticación demo', () => {
    const authGateway = createDemoAuthGateway({ email: 'admin@canres.test', password: 'demo-password', storage: memoryStorage() });

    it('inicia sesión solo con las credenciales configuradas', async () => {
        const signIn = makeSignInAdmin({ authGateway });
        const getCurrent = makeGetCurrentAdmin({ authGateway });
        await expect(signIn('admin@canres.test', 'mala')).rejects.toThrow();
        await expect(signIn('otro@test.com', 'demo-password')).rejects.toThrow();
        const user = await signIn('admin@canres.test', 'demo-password');
        expect(user.isAdmin).toBe(true);
        expect((await getCurrent()).email).toBe('admin@canres.test');
    });
});
