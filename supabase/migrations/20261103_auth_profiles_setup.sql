-- =====================================================================
-- CANRES Viandes · Migración Oficial de Autenticación y Perfiles
-- Inspirado en la arquitectura robusta de OCAPLUS
-- Soporta: Email/Password, Google OAuth, Roles, y Sincronización Automática
-- =====================================================================

-- 1. Asegurar extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Asegurar columnas completas en public.profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'customer',
    activo BOOLEAN NOT NULL DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Si la tabla ya existía con columnas parciales, agregamos las faltantes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'activo') THEN
        ALTER TABLE public.profiles ADD COLUMN activo BOOLEAN NOT NULL DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
END $$;

-- 3. Constraint de roles permitidos
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('customer', 'admin', 'superadmin', 'gerente', 'cajero', 'mesero', 'cocinero'));

-- 4. Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_activo ON public.profiles(activo);

-- 5. Trigger para sincronizar automáticamente auth.users con public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_name text;
    v_phone text;
    v_role text;
    v_avatar text;
BEGIN
    -- Extraer nombre desde metadatos (Google OAuth envía 'full_name' o 'name')
    v_name := COALESCE(
        NULLIF(new.raw_user_meta_data ->> 'full_name', ''),
        NULLIF(new.raw_user_meta_data ->> 'name', ''),
        split_part(new.email, '@', 1)
    );

    v_phone := COALESCE(new.raw_user_meta_data ->> 'phone', '');
    v_role := COALESCE(NULLIF(new.raw_user_meta_data ->> 'role', ''), 'customer');
    v_avatar := COALESCE(
        NULLIF(new.raw_user_meta_data ->> 'avatar_url', ''),
        NULLIF(new.raw_user_meta_data ->> 'picture', '')
    );

    -- Asegurar rol permitido
    IF v_role NOT IN ('customer', 'admin', 'superadmin', 'gerente', 'cajero', 'mesero', 'cocinero') THEN
        v_role := 'customer';
    END IF;

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        phone,
        role,
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Políticas de Seguridad RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner or admin" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insertable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles updatable by owner" ON public.profiles;

-- Lectura de perfiles
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Inserción por trigger / usuario autenticado
CREATE POLICY "Profiles are insertable by owner"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- Actualización exclusiva por el dueño del perfil o admin
CREATE POLICY "Profiles are updatable by owner"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'superadmin')
    ));

-- 7. Backfill: sincronizar usuarios de auth.users existentes que no tengan perfil
INSERT INTO public.profiles (id, email, full_name, phone, role, activo)
SELECT
    u.id,
    u.email,
    COALESCE(
        NULLIF(u.raw_user_meta_data ->> 'full_name', ''),
        NULLIF(u.raw_user_meta_data ->> 'name', ''),
        split_part(u.email, '@', 1)
    ) AS full_name,
    COALESCE(u.raw_user_meta_data ->> 'phone', '') AS phone,
    COALESCE(NULLIF(u.raw_user_meta_data ->> 'role', ''), 'customer') AS role,
    true AS activo
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
