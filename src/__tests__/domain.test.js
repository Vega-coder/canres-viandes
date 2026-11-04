import { describe, it, expect } from 'vitest';
import { createProduct, getFinalPrice, slugify } from '@/domain/catalog/product.js';
import { filterProducts, sortProducts, matchesAroma } from '@/domain/catalog/filters.js';
import { AROMAS, getAromaBySlug } from '@/domain/catalog/aromas.js';
import { addItem, updateQuantity, removeItem, calculateTotals, FREE_SHIPPING_THRESHOLD, SHIPPING_COST, MAX_QTY_PER_ITEM } from '@/domain/cart/cart.js';
import { buildOrder, validateCustomer, canTransition } from '@/domain/orders/order.js';
import { brandToSlug, buildBrandsCatalog, resolveBrandBySlug, getBrandMetadata } from '@/domain/catalog/brands.js';

const ribeye = createProduct({
    id: 'ribeye',
    name: 'Lomo Ancho Rib Eye',
    brand: 'Res AAA',
    gender: 'res',
    price: 32,
    stock: 5,
    notes: ['Marmoleo AAA', 'Parrilla'],
    shippingCost: SHIPPING_COST,
});

const costilla = createProduct({
    id: 'costilla',
    name: 'Costilla Baby Back',
    brand: 'Cerdo Selecto',
    gender: 'cerdo',
    price: 24,
    discountPercent: 50,
    stock: 2,
    isFeatured: true,
});

const customer = { fullName: 'Ana Gómez', email: 'ana@correo.com', phone: '300 123 4567', city: 'Montréal', address: '123 Boulevard Saint-Laurent' };

describe('Producto', () => {
    it('normaliza slugs sin tildes', () => {
        expect(slugify('Picaña Sterling & Lomo')).toBe('picana-sterling-lomo');
    });

    it('aplica el descuento al precio final', () => {
        expect(getFinalPrice(costilla)).toBe(12);
    });

    it('rechaza productos sin nombre o con precio inválido', () => {
        expect(() => createProduct({ price: 10 })).toThrow();
        expect(() => createProduct({ name: 'X', price: -1 })).toThrow();
    });

    it('calcula métricas de reseñas dinámicas de la tabla de comentarios', () => {
        const withReviews = createProduct({
            name: 'Ribeye',
            price: 32,
            reviews: [{ rating: 5 }, { rating: 4 }]
        });
        expect(withReviews.reviewsCount).toBe(2);
        expect(withReviews.ratingAverage).toBe(4.5);

        const withoutReviews = createProduct({
            name: 'Picaña',
            price: 20,
            reviews: []
        });
        expect(withoutReviews.reviewsCount).toBe(0);
        expect(withoutReviews.ratingAverage).toBeNull();
    });
});

describe('Filtros del catálogo', () => {
    it('busca por notas ignorando tildes y mayúsculas', () => {
        expect(filterProducts([ribeye, costilla], { query: 'MARMOLEO' })).toEqual([ribeye]);
    });

    it('filtra por aroma / estilo culinario', () => {
        expect(matchesAroma(ribeye, 'parrilla')).toBe(true);
        expect(filterProducts([ribeye, costilla], { aroma: 'parrilla' })).toEqual([ribeye]);
    });

    it('filtra por género y precio final', () => {
        expect(filterProducts([ribeye, costilla], { gender: 'cerdo' })).toEqual([costilla]);
        expect(filterProducts([ribeye, costilla], { maxPrice: 40 })).toHaveLength(2);
    });

    it('ordena por precio final', () => {
        const [first] = sortProducts([ribeye, costilla], 'price-desc');
        expect(first.id).toBe('ribeye');
        expect(sortProducts([ribeye, costilla], 'featured')[0].id).toBe('costilla');
    });
});

describe('Estilos y Métodos Culinarios', () => {
    it('contiene los 6 estilos culinarios principales de CANRES', () => {
        expect(AROMAS).toHaveLength(6);
        const slugs = AROMAS.map((a) => a.slug);
        expect(slugs).toEqual([
            'parrilla',
            'charcuteria',
            'ahumado',
            'horno',
            'sarten',
            'tradicion',
        ]);
    });

    it('resuelve estilo por slug ignorando mayúsculas', () => {
        expect(getAromaBySlug('PARRILLA')?.name).toBe('Parrilla & Brasa');
        expect(getAromaBySlug('inexistente')).toBeNull();
    });

    it('comprueba coincidencia culinaria tanto por array explícito como por palabras clave', () => {
        const prodConAroma = createProduct({
            id: 'test-parrilla',
            name: 'Parrilla Cut',
            brand: 'Res AAA',
            price: 30,
            aromas: ['parrilla'],
        });
        expect(matchesAroma(prodConAroma, 'parrilla')).toBe(true);
        expect(matchesAroma(prodConAroma, 'horno')).toBe(false);

        const prodConKeywords = createProduct({
            id: 'test-ribeye',
            name: 'Corte Asador al Carbón',
            brand: 'Res AAA',
            price: 32,
            notes: ['Parrilla a fuego directo'],
        });
        expect(matchesAroma(prodConKeywords, 'parrilla')).toBe(true);
    });
});

describe('Carrito', () => {
    it('acumula cantidades y respeta el stock', () => {
        let cart = addItem([], costilla, 1);
        cart = addItem(cart, costilla, 5);
        expect(cart[0].quantity).toBe(2);
    });

    it('no supera el máximo por producto', () => {
        const big = createProduct({ id: 'b', name: 'B', price: 1, stock: 100 });
        expect(addItem([], big, 50)[0].quantity).toBe(MAX_QTY_PER_ITEM);
    });

    it('elimina la línea al dejar cantidad 0', () => {
        const cart = addItem([], ribeye, 1);
        expect(updateQuantity(cart, 'ribeye', 0)).toEqual([]);
        expect(removeItem(cart, 'ribeye')).toEqual([]);
    });

    it('cobra envío por debajo del umbral y lo regala por encima', () => {
        const small = calculateTotals(addItem([], ribeye, 1));
        expect(small.shipping).toBe(SHIPPING_COST);
        expect(small.missingForFreeShipping).toBe(FREE_SHIPPING_THRESHOLD - 32);

        const large = calculateTotals(addItem([], ribeye, 5));
        expect(large.shipping).toBe(0);
        expect(calculateTotals([]).total).toBe(0);
    });

    it('no cobra envío si el producto no tiene costo de envío configurado o tiene envío gratis', () => {
        const decant = createProduct({ id: 'decant', name: 'Muestra Embutido', brand: 'Res AAA', price: 10, stock: 10 });
        const small = calculateTotals(addItem([], decant, 1));
        expect(small.shipping).toBe(0);
        expect(small.total).toBe(10);
        expect(small.missingForFreeShipping).toBe(0);

        const freeProduct = createProduct({ id: 'fp', name: 'Corte Envío Gratis', price: 150, stock: 2, hasFreeShipping: true });
        const freeTotals = calculateTotals(addItem([], freeProduct, 1));
        expect(freeTotals.shipping).toBe(0);
    });

    it('combina envíos usando el costo de envío más alto cuando hay varios productos', () => {
        const p1 = createProduct({ id: 'p1', name: 'Corte 1', price: 10, stock: 5, shippingCost: 5, hasFreeShipping: false });
        const p2 = createProduct({ id: 'p2', name: 'Corte 2', price: 10, stock: 5, shippingCost: 12, hasFreeShipping: false });
        let cart = addItem([], p1, 1);
        cart = addItem(cart, p2, 1);
        const totals = calculateTotals(cart);
        expect(totals.shipping).toBe(12);
    });

    it('aplica 10% de descuento del Club VIP cuando isVip es true', () => {
        const p = createProduct({ id: 'p1', name: 'Picaña Premium', price: 100, stock: 5, shippingCost: 15 });
        const cart = addItem([], p, 1);
        const regularTotals = calculateTotals(cart, { isVip: false });
        expect(regularTotals.subtotal).toBe(100);
        expect(regularTotals.vipDiscount).toBe(0);
        expect(regularTotals.total).toBe(115);

        const vipTotals = calculateTotals(cart, { isVip: true });
        expect(vipTotals.isVip).toBe(true);
        expect(vipTotals.vipDiscount).toBe(10); // 10% de 100
        expect(vipTotals.discountedSubtotal).toBe(90);
        expect(vipTotals.total).toBe(105); // 90 + 15
    });
});

describe('Pedidos', () => {
    it('valida los datos del cliente', () => {
        expect(Object.keys(validateCustomer(customer))).toHaveLength(0);
        expect(Object.keys(validateCustomer({ ...customer, email: 'invalido' })).length).toBeGreaterThan(0);
        expect(Object.keys(validateCustomer({ ...customer, phone: '' })).length).toBeGreaterThan(0);
    });

    it('construye un pedido con código y totales', () => {
        const order = buildOrder({
            items: [{ productId: 'ribeye', name: 'Lomo Ancho Rib Eye', brand: 'Res AAA', unitPrice: 32, quantity: 2, unit: 'kg' }],
            customer,
            paymentMethod: 'wompi',
            now: new Date('2026-10-18T10:00:00Z'),
        });
        expect(order.code).toMatch(/^CANRES-261018-[A-Z0-9]{4}$/);
        expect(order.subtotal).toBe(64);
        expect(order.status).toBe('pending');
    });

    it('falla con carrito vacío o método de pago inválido', () => {
        expect(() => buildOrder({ items: [], customer, paymentMethod: 'wompi' })).toThrow('vacío');
        expect(() => buildOrder({ items: [{ productId: '1', name: 'X', unitPrice: 1, quantity: 1 }], customer, paymentMethod: 'cheque' })).toThrow('pago');
    });

    it('construye pedido con beneficios VIP correctamente', () => {
        const item = { productId: '1', name: 'Ribeye', brand: 'Res AAA', unitPrice: 100, quantity: 1, stock: 10, shippingCost: 15 };
        const order = buildOrder({
            items: [item],
            customer,
            paymentMethod: 'wompi',
            isVip: true,
            userId: 'user-vip-123',
        });
        expect(order.isVip).toBe(true);
        expect(order.userId).toBe('user-vip-123');
        expect(order.vipDiscount).toBe(10);
        expect(order.total).toBe(105); // 90 + 15
        expect(order.customer.isVip).toBe(true);
    });

    it('solo permite transiciones válidas de estado', () => {
        expect(canTransition('pending', 'confirmed')).toBe(true);
        expect(canTransition('confirmed', 'shipped')).toBe(true);
        expect(canTransition('delivered', 'pending')).toBe(false);
        expect(canTransition('cancelled', 'confirmed')).toBe(false);
    });
});

describe('Líneas y Marcas', () => {
    it('convierte nombres a slugs normalizados', () => {
        expect(brandToSlug('Res AAA')).toBe('res-aaa');
        expect(brandToSlug('Charcutería Artesanal')).toBe('charcuteria-artesanal');
    });

    it('construye catálogo dinámico de marcas contando productos', () => {
        const catalog = buildBrandsCatalog([ribeye, costilla]);
        expect(catalog).toHaveLength(2);
        expect(catalog[0].count).toBe(1);
    });

    it('resuelve metadatos de marcas conocidas o genera valores elegantes por defecto', () => {
        const meta = getBrandMetadata('Res AAA');
        expect(meta.name).toBe('Res AAA');
        expect(meta.description).toContain('AAA');

        const unknown = getBrandMetadata('Marca Nueva');
        expect(unknown.name).toBe('Marca Nueva');
    });
});
