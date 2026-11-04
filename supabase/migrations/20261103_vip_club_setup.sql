-- =====================================================================
-- CANRES Viandes · Migración Oficial: Sistema Club VIP y Fidelización
-- 1. Columna is_vip en public.profiles (true por defecto para registrados)
-- 2. Columnas vip_discount e is_vip en public.orders
-- 3. Actualización de trigger handle_new_user()
-- 4. Actualización de función transaccional place_order()
-- =====================================================================

-- 1. Agregar columna is_vip a public.profiles
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS is_vip BOOLEAN NOT NULL DEFAULT true;

-- Asegurar que los perfiles existentes queden como VIP
UPDATE public.profiles
SET is_vip = true
WHERE is_vip IS NULL;

-- 2. Agregar columnas a public.orders
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS vip_discount NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS is_vip BOOLEAN NOT NULL DEFAULT false;

-- 3. Actualizar función trigger handle_new_user para asignar is_vip = true a todo nuevo registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_name text;
    v_phone text;
    v_avatar text;
    v_role text;
BEGIN
    v_name := coalesce(
        nullif(new.raw_user_meta_data ->> 'full_name', ''),
        nullif(new.raw_user_meta_data ->> 'name', ''),
        split_part(new.email, '@', 1)
    );
    v_phone := coalesce(new.raw_user_meta_data ->> 'phone', '');
    v_avatar := coalesce(
        nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
        nullif(new.raw_user_meta_data ->> 'picture', '')
    );
    v_role := coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'customer');

    IF new.email IN ('vsvsjd603@gmail.com', 'admin@canres.com') THEN
        v_role := 'superadmin';
    END IF;

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        phone,
        role,
        is_vip,
        activo,
        avatar_url,
        updated_at
    )
    VALUES (
        new.id,
        new.email,
        v_name,
        v_phone,
        v_role,
        true,
        true,
        v_avatar,
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
        phone = COALESCE(NULLIF(EXCLUDED.phone, ''), profiles.phone),
        avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), profiles.avatar_url),
        updated_at = now();

    RETURN new;
END;
$$;

-- 4. Actualizar place_order para registrar descuento VIP y usuario
CREATE OR REPLACE FUNCTION public.place_order(p_order jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_id uuid;
    v_item jsonb;
    v_product public.products;
    v_unit numeric(10,2);
    v_qty int;
    v_subtotal numeric(10,2) := 0;
    v_shipping numeric(10,2);
    v_payment_method text;
    v_is_vip boolean;
    v_vip_discount numeric(10,2) := 0;
    v_item_shipping numeric(10,2);
    v_max_item_shipping numeric(10,2) := 0;
BEGIN
    IF jsonb_array_length(coalesce(p_order -> 'items', '[]'::jsonb)) = 0 THEN
        RAISE EXCEPTION 'El pedido no tiene productos';
    END IF;

    v_payment_method := coalesce(p_order ->> 'paymentMethod', 'wompi');
    v_is_vip := coalesce((p_order ->> 'isVip')::boolean, (p_order -> 'customer' ->> 'isVip')::boolean, false);
    v_vip_discount := coalesce((p_order ->> 'vipDiscount')::numeric(10,2), (p_order -> 'customer' ->> 'vipDiscount')::numeric(10,2), 0);

    INSERT INTO public.orders (
        code, customer, payment_method, 
        subtotal, shipping, total, vip_discount, is_vip, user_id, wompi_transaction_id, payment_status
    )
    VALUES (
        p_order ->> 'code',
        p_order -> 'customer',
        v_payment_method,
        0, 0, 0,
        v_vip_discount,
        v_is_vip,
        coalesce(auth.uid(), (p_order ->> 'userId')::uuid),
        p_order ->> 'wompiTransactionId',
        coalesce(p_order ->> 'paymentStatus', 'pending')
    )
    RETURNING id INTO v_order_id;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_order -> 'items') LOOP
        v_qty := (v_item ->> 'quantity')::int;
        SELECT * INTO v_product FROM public.products
            WHERE id = v_item ->> 'productId' AND is_active FOR UPDATE;

        IF NOT FOUND THEN 
            RAISE EXCEPTION 'Producto no disponible: %', v_item ->> 'name'; 
        END IF;
        IF v_qty <= 0 OR v_product.stock < v_qty THEN
            RAISE EXCEPTION 'Stock insuficiente para %', v_product.name;
        END IF;

        v_unit := round(v_product.price * (1 - v_product.discount_percent / 100.0), 2);
        v_subtotal := v_subtotal + v_unit * v_qty;

        v_item_shipping := CASE 
            WHEN coalesce(v_product.has_free_shipping, false) = true THEN 0
            WHEN coalesce(v_product.shipping_cost, 0) <= 0 THEN 0
            ELSE coalesce(v_product.shipping_cost, 0)
        END;
        IF v_item_shipping > v_max_item_shipping THEN
            v_max_item_shipping := v_item_shipping;
        END IF;

        INSERT INTO public.order_items (order_id, product_id, name, brand, unit_price, quantity, line_total)
        VALUES (v_order_id, v_product.id, v_product.name, coalesce(v_item ->> 'brand', 'CANRES Viandes'), v_unit, v_qty, v_unit * v_qty);

        IF v_payment_method <> 'wompi' THEN
            UPDATE public.products SET stock = stock - v_qty WHERE id = v_product.id;
        END IF;
    END LOOP;

    -- Si el cliente es VIP y no vino descuento explícito, calculamos el 10%
    IF v_is_vip AND v_vip_discount = 0 THEN
        v_vip_discount := round(v_subtotal * 0.10, 2);
    END IF;

    -- Envío refrigerado gratis para pedidos desde $120 CAD
    v_shipping := CASE 
        WHEN v_subtotal >= 120 THEN 0
        WHEN (p_order ->> 'shipping') IS NOT NULL THEN greatest(0, (p_order ->> 'shipping')::numeric(10,2))
        ELSE coalesce(nullif(v_max_item_shipping, 0), 15)
    END;

    UPDATE public.orders
    SET subtotal = v_subtotal,
        shipping = v_shipping,
        vip_discount = v_vip_discount,
        is_vip = v_is_vip,
        total = greatest(0, v_subtotal - v_vip_discount) + v_shipping
    WHERE id = v_order_id;

    RETURN v_order_id;
END;
$$;
