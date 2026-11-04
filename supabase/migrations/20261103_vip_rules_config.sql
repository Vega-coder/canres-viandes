-- =====================================================================
-- CANRES Viandes · Tabla de Configuraciones del Negocio (Store Settings)
-- Soporta: Reglas del Club VIP (descuento %, modo primera compra vs permanente)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1. Habilitar RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 2. Lectura pública (para que el frontend conozca el % y modo de descuento)
DROP POLICY IF EXISTS "Store settings are viewable by everyone" ON public.store_settings;
CREATE POLICY "Store settings are viewable by everyone"
    ON public.store_settings FOR SELECT
    USING (true);

-- 3. Inserción permitida
DROP POLICY IF EXISTS "Store settings are insertable by anyone authenticated" ON public.store_settings;
CREATE POLICY "Store settings are insertable by anyone authenticated"
    ON public.store_settings FOR INSERT
    WITH CHECK (true);

-- 4. Actualización permitida
DROP POLICY IF EXISTS "Store settings are updatable by anyone authenticated" ON public.store_settings;
CREATE POLICY "Store settings are updatable by anyone authenticated"
    ON public.store_settings FOR UPDATE
    USING (true);

-- 5. Sembrar configuración inicial de Club VIP
INSERT INTO public.store_settings (key, value)
VALUES (
    'vip_config',
    '{"enabled": true, "discountPercent": 10, "mode": "all_orders", "maxOrders": 1}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
