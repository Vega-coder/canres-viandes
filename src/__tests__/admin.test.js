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

const customer = { fullName: 'Marta Ruiz', email: 'marta@correo.com', phone: '3101234567', city: 'Cali', address: 'Av 6N # 23-45' };

const validInput = {
    name: 'Light Blue', brand: 'Dolce & Gabbana', gender: 'mujer', type: 'fragancia', concentration: 'edt',
    volumeMl: '100', price: '420000', discountPercent: '0', stock: '5', notes: 'Limón, Manzana, Cedro', images: [],
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
        expect(validateProductInput(validInput)).toEqual({});
    });
    it('marca precio, stock y descuento inválidos', () => {
        const errors = validateProductInput({ ...validInput, price: '0', stock: '-1', discountPercent: '95' });
        expect(Object.keys(errors).sort()).toEqual(['discountPercent', 'price', 'stock']);
    });
});

describe('Administración de productos', () => {
    it('crea un producto con notas e id derivado', async () => {
        const saved = await makeSaveProduct({ productRepository })(validInput);
        expect(saved.id).toBe('dolce-gabbana-light-blue-100');
        expect(saved.notes).toEqual(['Limón', 'Manzana', 'Cedro']);
        expect(saved.price).toBe(420000);
        expect(await productRepository.findById(saved.id)).not.toBeNull();
    });

    it('permite guardar la pirámide olfativa por separado desde el admin (salida, corazón, base)', async () => {
        const inputWithPyramid = {
            ...validInput,
            name: 'Aventus Absolu',
            brand: 'Creed',
            topNotes: 'Grosella, Bergamota, Toronja',
            heartNotes: 'Jengibre, Canela, Cardamomo',
            baseNotes: 'Pimienta rosa, Pachulí, Vetiver',
        };
        const saved = await makeSaveProduct({ productRepository })(inputWithPyramid);
        expect(saved.topNotes).toEqual(['Grosella', 'Bergamota', 'Toronja']);
        expect(saved.heartNotes).toEqual(['Jengibre', 'Canela', 'Cardamomo']);
        expect(saved.baseNotes).toEqual(['Pimienta rosa', 'Pachulí', 'Vetiver']);
    });

    it('permite configurar si tiene envío gratis o costo específico de envío', async () => {
        const save = makeSaveProduct({ productRepository });
        const withFree = await save({
            ...validInput,
            name: 'Producto Envío Gratis',
            hasFreeShipping: true,
            shippingCost: '15000', // debe ignorarse porque hasFreeShipping es true
        });
        expect(withFree.hasFreeShipping).toBe(true);
        expect(withFree.shippingCost).toBe(0);

        const withCustomCost = await save({
            ...validInput,
            name: 'Producto Con Tarifa',
            hasFreeShipping: false,
            shippingCost: '12000',
        });
        expect(withCustomCost.hasFreeShipping).toBe(false);
        expect(withCustomCost.shippingCost).toBe(12000);
    });

    it('permite vincular familias olfativas / aromas (amaderados, cítricos, etc.) y los preserva en el producto', async () => {
        const save = makeSaveProduct({ productRepository });
        const saved = await save({
            ...validInput,
            name: 'Club de Nuit Intense Man',
            brand: 'Armaf',
            aromas: ['amaderados', 'citricos'],
        });
        expect(saved.aromas).toEqual(['amaderados', 'citricos']);
        expect(saved.notes).toContain('Amaderados');
        expect(saved.notes).toContain('Cítricos');
        expect(saved.notes).toContain('aroma:amaderados');
        expect(saved.notes).toContain('aroma:citricos');
    });

    it('edita sin cambiar el slug publicado', async () => {
        const save = makeSaveProduct({ productRepository });
        const original = await productRepository.findById('lattafa-asad-100');
        const saved = await save({ ...original, name: 'Asad Edición', price: '200000', stock: '4', notes: 'Tabaco, Vainilla', volumeMl: '100' });
        expect(saved.slug).toBe(original.slug);
        expect(saved.name).toBe('Asad Edición');
    });

    it('rechaza duplicados y datos inválidos con errores por campo', async () => {
        const save = makeSaveProduct({ productRepository });
        await save(validInput);
        await expect(save(validInput)).rejects.toMatchObject({ fields: { name: 'Producto duplicado' } });
        await expect(save({ ...validInput, name: '' })).rejects.toMatchObject({ fields: { name: expect.any(String) } });
    });

    it('ocultar un producto lo saca de la tienda pero no del admin', async () => {
        await makeToggleProductActive({ productRepository })('lattafa-asad-100');
        const { products } = await makeBrowseCatalog({ productRepository })({});
        expect(products.find((p) => p.id === 'lattafa-asad-100')).toBeUndefined();
        const admin = await makeListProductsForAdmin({ productRepository })();
        expect(admin.find((p) => p.id === 'lattafa-asad-100').isActive).toBe(false);
    });

    it('elimina un producto', async () => {
        await makeDeleteProduct({ productRepository })('maison-victorious-legacy-100');
        expect(await productRepository.findById('maison-victorious-legacy-100')).toBeNull();
    });
});

describe('Administración de pedidos', () => {
    const placeFirstOrder = () =>
        makePlaceOrder({ productRepository, orderRepository, notificationGateway: createWhatsappGateway('57') })({
            items: [{ productId: 'lattafa-yara-100', name: 'Yara', brand: 'Lattafa', quantity: 2 }],
            customer,
            paymentMethod: 'wompi',
        });

    it('descuenta stock en modo demo al confirmar el pago del pedido', async () => {
        const { order } = await placeFirstOrder();
        expect((await productRepository.findById('lattafa-yara-100')).stock).toBe(15);
        await orderRepository.updateWompiPayment(order.code, 'tx-test-123', 'APPROVED');
        expect((await productRepository.findById('lattafa-yara-100')).stock).toBe(13);
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
        expect((await dashboard()).topProducts[0]).toMatchObject({ productId: 'lattafa-yara-100', units: 2 });

        await makeChangeOrderStatus({ orderRepository })(order.code, 'cancelled');
        const after = await dashboard();
        expect(after.revenue).toBe(0);
        expect(after.lowStock[0]).toMatchObject({ id: 'afnan-rare-reef-100', stock: 0 });
    });
});

describe('Autenticación demo', () => {
    it('inicia sesión solo con las credenciales configuradas', async () => {
        const authGateway = createDemoAuthGateway({ email: 'admin@test.test', password: 'clave-segura', storage: memoryStorage() });
        const signIn = makeSignInAdmin({ authGateway });
        await expect(signIn('admin@test.test', 'otra')).rejects.toThrow('incorrectos');
        expect(await makeGetCurrentAdmin({ authGateway })()).toBeNull();
        await signIn('ADMIN@test.test ', 'clave-segura');
        expect(await makeGetCurrentAdmin({ authGateway })()).toMatchObject({ isAdmin: true });
    });
});
