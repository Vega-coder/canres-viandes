-- =====================================================================
-- MIGRACIÓN: SOPORTE SEGURO DE INVENTARIO PARA STRIPE (CANADÁ - CAD)
-- =====================================================================

-- 1. Actualizar restricción de métodos de pago en la tabla orders para incluir 'stripe'
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check 
    check (payment_method in ('transfer', 'cod', 'nequi', 'daviplata', 'efectivo', 'tarjeta', 'wompi', 'stripe'));

-- 2. Asegurar que las columnas para trazabilidad de pagos online existan
alter table public.orders add column if not exists wompi_transaction_id text;
alter table public.orders add column if not exists payment_status text default 'pending';

-- 3. Actualizar place_order para NO descontar stock si el pago es online (wompi o stripe)
-- El stock solo se descontará cuando la pasarela confirme el pago como 'APPROVED'.
create or replace function public.place_order(p_order jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
    v_order_id uuid;
    v_item jsonb;
    v_product public.products;
    v_unit numeric;
    v_qty int;
    v_subtotal numeric := 0;
    v_shipping numeric;
    v_tenant_id uuid;
    v_sede_id uuid;
    v_canal text;
    v_payment_method text;
begin
    if jsonb_array_length(coalesce(p_order -> 'items', '[]'::jsonb)) = 0 then
        raise exception 'El pedido no tiene productos';
    end if;

    v_tenant_id := coalesce((p_order ->> 'tenantCompanyId')::uuid, '00000000-0000-0000-0000-000000000001'::uuid);
    v_sede_id := coalesce((p_order ->> 'sedeId')::uuid, '00000000-0000-0000-0000-000000000010'::uuid);
    v_canal := coalesce(p_order ->> 'canal', 'online');
    v_payment_method := coalesce(p_order ->> 'paymentMethod', 'stripe');

    insert into public.orders (
        tenant_company_id, sede_id, canal, code, customer, payment_method, 
        subtotal, shipping, total, user_id, wompi_transaction_id, payment_status
    )
    values (
        v_tenant_id,
        v_sede_id,
        v_canal,
        p_order ->> 'code',
        p_order -> 'customer',
        v_payment_method,
        0, 0, 0,
        auth.uid(),
        p_order ->> 'wompiTransactionId',
        coalesce(p_order ->> 'paymentStatus', 'pending')
    )
    returning id into v_order_id;

    for v_item in select * from jsonb_array_elements(p_order -> 'items') loop
        v_qty := (v_item ->> 'quantity')::int;
        select * into v_product from public.products
            where id = v_item ->> 'productId' and is_active for update;

        if not found then
            raise exception 'Producto % no existe o está inactivo', v_item ->> 'productId';
        end if;
        if v_qty <= 0 or v_product.stock < v_qty then
            raise exception 'Stock insuficiente para %', v_product.name;
        end if;

        v_unit := round(v_product.price * (1 - v_product.discount_percent / 100.0), 2);
        v_subtotal := v_subtotal + (v_unit * v_qty);

        insert into public.order_items (order_id, product_id, name, brand, unit_price, quantity, line_total)
        values (v_order_id, v_product.id, v_product.name, coalesce(v_item ->> 'brand', 'CANRES Viandes'), v_unit, v_qty, v_unit * v_qty);

        -- BLINDAJE DE STOCK:
        -- Solo descontar inventario inmediatamente para métodos manuales (contra entrega o transferencia)
        -- Para Stripe y Wompi, el inventario se descuenta atómicamente cuando el pago es 'APPROVED'.
        if v_payment_method not in ('wompi', 'stripe') then
            update public.products set stock = stock - v_qty where id = v_product.id;
        end if;
    end loop;

    v_shipping := case when v_subtotal >= 150 then 0 else 15 end;

    update public.orders
        set subtotal = v_subtotal, shipping = v_shipping, total = v_subtotal + v_shipping
        where id = v_order_id;

    return v_order_id;
end;
$$;

grant execute on function public.place_order(jsonb) to anon, authenticated;
