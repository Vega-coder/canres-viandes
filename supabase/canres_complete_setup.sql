-- =====================================================================
-- CANRES Viandes · Setup Completo de Base de Datos Supabase
-- Incluye tablas, índices, RPCs transaccionales, RLS y Catálogo Oficial (44 Cortes)
-- Ejecuta este script completo en el SQL Editor de tu nuevo proyecto Supabase.
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- 1. TABLA DE MARCAS / LÍNEAS
create table if not exists public.brands (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    created_at timestamptz not null default now()
);

-- 2. TABLA DE PRODUCTOS (CORTES DE CARNE ARTESANALES)
create table if not exists public.products (
    id text primary key,
    slug text not null unique,
    name text not null,
    subname text default '',
    brand_id uuid references public.brands (id) on delete set null,
    description text not null default '',
    gender text not null default 'res',
    type text not null default 'corte',
    unit text not null default 'kg',
    concentration text,
    volume_ml int,
    price numeric(10,2) not null check (price >= 0),
    discount_percent int not null default 0 check (discount_percent between 0 and 90),
    stock int not null default 0 check (stock >= 0),
    notes text[] not null default '{}',
    top_notes text[] not null default '{}',
    heart_notes text[] not null default '{}',
    base_notes text[] not null default '{}',
    cooking_methods text[] not null default '{}',
    images text[] not null default '{}',
    palette jsonb not null default '{}'::jsonb,
    is_new boolean not null default false,
    is_featured boolean not null default false,
    is_active boolean not null default true,
    has_free_shipping boolean not null default false,
    shipping_cost numeric(10,2) not null default 0 check (shipping_cost >= 0),
    created_at timestamptz not null default now()
);

create index if not exists products_gender_idx on public.products (gender);
create index if not exists products_slug_idx on public.products (slug);
create index if not exists products_active_idx on public.products (is_active);

-- 3. PERFILES DE CLIENTES / ADMIN
create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    full_name text default '',
    phone text default '',
    role text not null default 'customer',
    created_at timestamptz not null default now()
);

-- 4. PEDIDOS
create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    canal varchar(20) not null default 'online',
    code text not null unique,
    status text not null default 'pending'
        check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    customer jsonb not null,
    payment_method text not null,
    subtotal numeric(10,2) not null default 0,
    shipping numeric(10,2) not null default 0,
    total numeric(10,2) not null default 0,
    wompi_transaction_id text,
    payment_status text default 'pending',
    shipping_carrier text,
    shipping_guide_number text,
    shipping_label_url text,
    shipping_status text,
    shipping_tracking_url text,
    shipping_data jsonb,
    shipping_error text,
    user_id uuid references auth.users (id) on delete set null,
    created_at timestamptz not null default now()
);

create index if not exists orders_code_idx on public.orders (code);
create index if not exists orders_user_id_idx on public.orders (user_id);

-- 5. LÍNEAS DE PEDIDO
create table if not exists public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders (id) on delete cascade,
    product_id text not null references public.products (id),
    name text not null,
    brand text not null,
    unit_price numeric(10,2) not null,
    quantity int not null check (quantity > 0),
    line_total numeric(10,2) not null
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- 6. RESEÑAS DE PRODUCTOS
create table if not exists public.product_reviews (
    id uuid primary key default gen_random_uuid(),
    product_id text not null references public.products (id) on delete cascade,
    user_id uuid references auth.users (id) on delete set null,
    author_name varchar(100) not null,
    city varchar(100) default 'Colombia',
    rating smallint not null check (rating between 1 and 5),
    title varchar(150),
    comment text not null,
    longevity varchar(50) default 'Excelente',
    sillage varchar(50) default 'Alta terneza',
    is_verified boolean not null default false,
    helpful_count int not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists reviews_product_id_idx on public.product_reviews (product_id);

-- 7. FUNCIONES RPC TRANSACCIONALES
create or replace function public.place_order(p_order jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
    v_order_id uuid;
    v_item jsonb;
    v_product public.products;
    v_unit numeric(10,2);
    v_qty int;
    v_subtotal numeric(10,2) := 0;
    v_shipping numeric(10,2);
    v_payment_method text;
begin
    if jsonb_array_length(coalesce(p_order -> 'items', '[]'::jsonb)) = 0 then
        raise exception 'El pedido no tiene productos';
    end if;

    v_payment_method := coalesce(p_order ->> 'paymentMethod', 'wompi');

    insert into public.orders (
        code, customer, payment_method, 
        subtotal, shipping, total, user_id, wompi_transaction_id, payment_status
    )
    values (
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
            raise exception 'Producto no disponible: %', v_item ->> 'name'; 
        end if;
        if v_qty <= 0 or v_product.stock < v_qty then
            raise exception 'Stock insuficiente para %', v_product.name;
        end if;

        v_unit := round(v_product.price * (1 - v_product.discount_percent / 100.0), 2);
        v_subtotal := v_subtotal + v_unit * v_qty;

        insert into public.order_items (order_id, product_id, name, brand, unit_price, quantity, line_total)
        values (v_order_id, v_product.id, v_product.name, coalesce(v_item ->> 'brand', 'CANRES Viandes'), v_unit, v_qty, v_unit * v_qty);

        if v_payment_method <> 'wompi' then
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

create or replace function public.get_order_by_code(p_code text)
returns jsonb language sql stable security definer set search_path = public as $$
    select to_jsonb(o) || jsonb_build_object(
        'order_items', coalesce((
            select jsonb_agg(to_jsonb(i))
            from public.order_items i
            where i.order_id = o.id
        ), '[]'::jsonb)
    )
    from public.orders o
    where o.code = p_code;
$$;

create or replace function public.update_order_status(p_code text, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
    update public.orders set status = p_status where code = p_code;
end;
$$;

create or replace function public.update_order_wompi_payment(
    p_order_code text,
    p_transaction_id text,
    p_status text
)
returns void language plpgsql security definer set search_path = public as $$
declare
    v_order public.orders;
    v_item public.order_items;
begin
    select * into v_order from public.orders where code = p_order_code for update;
    if not found then return; end if;

    if p_status = 'APPROVED' and v_order.payment_status <> 'APPROVED' then
        for v_item in select * from public.order_items where order_id = v_order.id loop
            update public.products set stock = greatest(0, stock - v_item.quantity) where id = v_item.product_id;
        end loop;
        update public.orders set status = 'confirmed', payment_status = 'APPROVED', wompi_transaction_id = p_transaction_id where id = v_order.id;
    elsif p_status in ('DECLINED', 'ERROR') then
        update public.orders set payment_status = p_status, wompi_transaction_id = p_transaction_id where id = v_order.id;
    else
        update public.orders set payment_status = p_status, wompi_transaction_id = p_transaction_id where id = v_order.id;
    end if;
end;
$$;

-- Permisos RPC
grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.get_order_by_code(text) to anon, authenticated;
grant execute on function public.update_order_status(text, text) to anon, authenticated;
grant execute on function public.update_order_wompi_payment(text, text, text) to anon, authenticated;

-- 8. POLÍTICAS RLS (Row Level Security)
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.product_reviews enable row level security;
alter table public.profiles enable row level security;

-- Brands: acceso total
create policy "Brands are viewable by everyone" on public.brands for select using (true);
create policy "Brands are insertable by anyone" on public.brands for insert with check (true);
create policy "Brands are updatable by anyone" on public.brands for update using (true);

-- Products: acceso de lectura y gestión
create policy "Products are viewable by everyone" on public.products for select using (true);
create policy "Products are insertable by anyone" on public.products for insert with check (true);
create policy "Products are updatable by anyone" on public.products for update using (true);
create policy "Products are deletable by anyone" on public.products for delete using (true);

-- Orders: consulta y creación
create policy "Orders viewable by everyone" on public.orders for select using (true);
create policy "Orders insertable by everyone" on public.orders for insert with check (true);
create policy "Orders updatable by everyone" on public.orders for update using (true);

-- Order Items: acceso
create policy "Order items viewable by everyone" on public.order_items for select using (true);
create policy "Order items insertable by everyone" on public.order_items for insert with check (true);

-- Reviews: acceso
create policy "Reviews are viewable by everyone" on public.product_reviews for select using (true);
create policy "Reviews are insertable by anyone" on public.product_reviews for insert with check (true);
create policy "Reviews are updatable by anyone" on public.product_reviews for update using (true);

-- Profiles: acceso
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Profiles are insertable by owner" on public.profiles for insert with check (true);
create policy "Profiles are updatable by owner" on public.profiles for update using (true);

-- =====================================================================
-- 9. CARGA DE MARCAS / LÍNEAS DE CANRES
-- =====================================================================
insert into public.brands (name) values
    ('Res AAA'),
    ('Cerdo Selecto'),
    ('Aves de Corral'),
    ('Chivo y Cordero'),
    ('Charcutería Artesanal')
on conflict (name) do nothing;

-- =====================================================================
-- 10. CARGA DE CATÁLOGO OFICIAL (44 CORTES DE CANRES VIANDES)
-- =====================================================================
insert into public.products (
    id, slug, name, subname, brand_id, description, gender, type, unit,
    price, discount_percent, stock, notes, cooking_methods, images, palette, is_new, is_featured
) values
    ('lomo-ancho-rib-eye', 'lomo-ancho-rib-eye', 'Lomo Ancho Rib Eye', 'Faux-filet / Ribeye AAA', (select id from public.brands where name = 'Res AAA'), 'El rey indiscutible de la parrilla. Corte de lomo ancho con abundante marmoleo intramuscular que se funde en la cocción, otorgando una terneza legendaria y un sabor profundo inigualable.', 'res', 'corte', 'kg', 32, 0, 35, array['Marmoleo AAA superior','Máxima jugosidad','Corte grueso de alta gama','Maduración en frío']::text[], array['Parrilla','Sartén de hierro','Asador']::text[], array['/images/meat/meat_beef_cut.jpg','/images/meat/ribs.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, true),
    ('lomo-chatas-new-york', 'lomo-chatas-new-york', 'Lomo Chatas New York', 'Contre-filet / Strip Loin AAA', (select id from public.brands where name = 'Res AAA'), 'Corte clásico de bife angosto o contra-filete con una distintiva pestaña de grasa exterior que carameliza en la brasa. Equilibrado, magro y jugoso.', 'res', 'corte', 'kg', 28, 0, 25, array['Textura firme y tierna','Borde de grasa exterior dorado','Corte New York Steak']::text[], array['Parrilla','Sartén','Plancha']::text[], array['/images/meat/ribeye.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, true),
    ('punta-de-picanha-aaa', 'punta-de-picanha-aaa', 'Punta de Picaña AAA', 'Haut de surlonge / Picanha AAA', (select id from public.brands where name = 'Res AAA'), 'La emblemática picaña con su generosa capa de grasa superior. Al asarse lentamente en brasa, la grasa impregna cada fibra dando un bocado mantecoso y sabroso.', 'res', 'corte', 'kg', 20, 0, 30, array['Capa uniforme de grasa','Ideal para espadas al carbón','Corte estrella sudamericano']::text[], array['Espada al carbón','Parrilla','Ahumador']::text[], array['/images/meat/ribeye.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, true),
    ('picanha-sterling', 'picanha-sterling', 'Picaña Sterling Silver', 'Picanha Réserve Sterling', (select id from public.brands where name = 'Res AAA'), 'Selección de picaña de grado Sterling Silver. Máxima uniformidad, terneza garantizada y marmoleado superior para conocedores exigentes.', 'res', 'corte', 'kg', 30, 0, 15, array['Certificación Sterling','Marmoleo extra selecto','Reserva de carnicero']::text[], array['Parrilla','Spit-Roast','Ahumador']::text[], array['/images/meat/ribs.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, true, true),
    ('espaldilla-aaa', 'espaldilla-aaa', 'Espaldilla AAA', 'Palette de boeuf AAA', (select id from public.brands where name = 'Res AAA'), 'Corte noble de la espaldilla de res AAA. Excelente para braseados, cocción lenta y estofados tradicionales donde la carne se deshebra con facilidad.', 'res', 'corte', 'kg', 28, 0, 20, array['Colágeno soluble','Rico en sabor umami','Perfecto para asados lentos']::text[], array['Horno','Cocción lenta','Guisos gourmet']::text[], array['/images/meat/meat_steak_raw.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('sobrebarriga', 'sobrebarriga', 'Sobrebarriga Tradicional', 'Bavette de flanc / Flank steak', (select id from public.brands where name = 'Res AAA'), 'El clásico de la gastronomía colombiana. Cocinada al horno o en salsa con hierbas y especias hasta quedar tierna y suave.', 'res', 'corte', 'kg', 24, 0, 22, array['Tradición colombiana','Ideal al horno o en salsa','Carne tierna y fibrosa']::text[], array['Horno con cerveza','En salsa criolla','Parrilla']::text[], array['/images/meat/steak.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, true),
    ('carne-molida-extra-magra', 'carne-molida-extra-magra', 'Carne Molida Extra-Magra', 'Boeuf haché extra-maigre', (select id from public.brands where name = 'Res AAA'), 'Molida 100% de cortes seleccionados de res, con proporción 90/10 para un balance perfecto entre jugosidad y salud.', 'res', 'corte', 'kg', 17.8, 0, 50, array['90/10 Magro','Molida fresca del día','Sin aditivos ni preservantes']::text[], array['Hamburguesas artesanales','Albóndigas','Salsas boloñesas']::text[], array['/images/meat/steak.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('lengua-de-res', 'lengua-de-res', 'Lengua de Res Fresca', 'Langue de boeuf fraîche', (select id from public.brands where name = 'Res AAA'), 'Lengua de res fresca de primera calidad. Textura tierna al cocerse lentamente con especias tradicionales.', 'res', 'corte', 'kg', 23, 0, 12, array['Delicadeza artesanal','Textura aterciopelada','Limpia y fresca']::text[], array['Guisada en salsa criolla','Alcaparrada','En vinagreta']::text[], array['/images/meat/meat_steak_raw.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('cola-de-res', 'cola-de-res', 'Cola de Res', 'Queue de boeuf (Oxtail)', (select id from public.brands where name = 'Res AAA'), 'Corte por excelencia para sancochos, sopas consistentes y guisos reconfortantes con alta concentración de colágeno natural.', 'res', 'corte', 'kg', 23, 0, 15, array['Rica en colágeno y gelatina','Para caldos densos y sabrosos','Corte tradicional']::text[], array['Sancocho','Estofado oxtail','Cocción lenta']::text[], array['/images/meat/meat_steak_raw.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('higado-de-res', 'higado-de-res', 'Hígado de Res', 'Foie de boeuf frais', (select id from public.brands where name = 'Res AAA'), 'Hígado fresco de res, ideal para el tradicional bistec encebollado o preparaciones rápidas a la plancha.', 'res', 'corte', 'kg', 10, 0, 18, array['Alto en hierro y vitaminas','Fresco del día','Fileteado limpio']::text[], array['Encebollado','Plancha rápida','Salteado']::text[], array['/images/meat/meat_steak_raw.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('rinon-de-res', 'rinon-de-res', 'Riñón de Res', 'Rognons de boeuf', (select id from public.brands where name = 'Res AAA'), 'Riñón fresco de res seleccionado para guisos tradicionales, al vino o al jerez.', 'res', 'corte', 'kg', 10, 0, 14, array['Víscera seleccionada','Limpieza minuciosa']::text[], array['Al jerez','Guisado','Plancha']::text[], array['/images/meat/meat_steak_raw.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('bofe-de-res', 'bofe-de-res', 'Bofe de Res', 'Poumon de boeuf traditionnel', (select id from public.brands where name = 'Res AAA'), 'Ingrediente clásico de la fritanga y picadas artesanales, hervido con especias y frito hasta dorar.', 'res', 'corte', 'kg', 10, 0, 15, array['Tradición de picada','Crocante frito','Auténtico sabor']::text[], array['Frito crocante','Guisado','Picada']::text[], array['/images/meat/meat_steak_raw.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('costilla-de-cerdo-baby', 'costilla-de-cerdo-baby', 'Costilla de Cerdo (Baby Back)', 'Côtes levées de porc dos (Baby Back)', (select id from public.brands where name = 'Cerdo Selecto'), 'Costillar Baby Back tierno y carnudo. Perfecto para hornear a baja temperatura con glaseado agridulce o ahumar lentamente al estilo BBQ.', 'cerdo', 'corte', 'kg', 12, 0, 40, array['Carne tierna entre huesos','Ideal con salsa barbacoa','Costillar parejo']::text[], array['Ahumador BBQ','Horno glaseado','Parrilla']::text[], array['/images/meat/ribs.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, true),
    ('panceta-avec-couenne', 'panceta-avec-couenne', 'Panceta con Cuero (Avec Couenne)', 'Flanc de porc avec couenne (Chicharrón)', (select id from public.brands where name = 'Cerdo Selecto'), 'La panceta ideal para lograr el chicharrón crujiente perfecto. Excelente relación carne magra y tocino para freír, hornear o confitar.', 'cerdo', 'corte', 'kg', 10.74, 0, 35, array['Ideal para chicharrón crocante','Equilibrio carne y tocino','Corte fresco de primera']::text[], array['Air fryer','Horno crocante','Fritura tradicional']::text[], array['/images/meat/porkbelly.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, true),
    ('panceta-sans-couenne', 'panceta-sans-couenne', 'Panceta sin Cuero (Sans Couenne)', 'Flanc de porc sans couenne / Pork Belly', (select id from public.brands where name = 'Cerdo Selecto'), 'Tocino entreverado sin cuero, ideal para rebanadas gruesas a la brasa, bao buns, o preparaciones ahumadas.', 'cerdo', 'corte', 'kg', 11, 0, 28, array['Pork belly deshuesado','Fácil de rebanar y asar','Suavidad pura']::text[], array['Parrilla','Horno glaseado','Ahumado']::text[], array['/images/meat/porkbelly.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('hombro-de-cerdo', 'hombro-de-cerdo', 'Hombro de Cerdo', 'Épaule de porc fraîche (Boston Butt)', (select id from public.brands where name = 'Cerdo Selecto'), 'Hombro de cerdo fresco con marmoleo perfecto para desmechar (pulled pork), lechona o carnitas mexicanas.', 'cerdo', 'corte', 'kg', 8.5, 0, 30, array['Inmejorable para pulled pork','Jugoso y suave','Económico y rendidor']::text[], array['Pulled pork','Horno lento','Carnitas']::text[], array['/images/meat/porkbelly.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('pierna-de-cerdo', 'pierna-de-cerdo', 'Pierna de Cerdo', 'Cuisseau de porc / Jambon frais', (select id from public.brands where name = 'Cerdo Selecto'), 'Pierna de cerdo limpia y magra. Perfecta para asar entera al horno con adobo especial o cortar en filetes jugosos.', 'cerdo', 'corte', 'kg', 8.5, 0, 25, array['Carne magra y sana','Excelente rendimiento','Ideal para hornear entero']::text[], array['Horno navideño','Milanesas','Guisos']::text[], array['/images/meat/porkbelly.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('costilla-de-falda', 'costilla-de-falda', 'Costilla de Falda de Cerdo', 'Côtes de flanc (St. Louis style)', (select id from public.brands where name = 'Cerdo Selecto'), 'Costilla de falda con un balance sustancioso de carne y sabor parrillero. Muy rendidora para reuniones y asados.', 'cerdo', 'corte', 'kg', 8.5, 0, 20, array['Mayor contenido de carne','Sabor intenso a costilla','Precio excepcional']::text[], array['Parrilla','Ahumador','Sancocho']::text[], array['/images/meat/ribs.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('costilla-de-epaule-caja-13kg', 'costilla-de-epaule-caja-13kg', 'Costilla de Épaule (Caja 13 kg)', 'Boîte 13 kg de côtes d''épaule (5.29$/kg)', (select id from public.brands where name = 'Cerdo Selecto'), 'Caja de 13 kilogramos de costilla de paleta de cerdo a precio mayorista. La mejor opción para restaurantes, eventos familiares y freeze.', 'cerdo', 'caja', 'caja-13kg', 70, 0, 15, array['Caja completa de 13 kg','A sólo $5.29 / kg','Ahorro mayorista garantizado']::text[], array['Asados masivos','Restaurantes','Freezer familiar']::text[], array['/images/meat/ribs.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, true),
    ('media-canal-cerdo', 'media-canal-cerdo', 'Media Canal de Cerdo', 'Demi-carcasse de porc (5.50$/kg)', (select id from public.brands where name = 'Cerdo Selecto'), 'Media canal entera de cerdo seleccionada bajo estrictas normas sanitarias. Ideal para negocios de hostelería o desposte personalizado.', 'canales', 'canal', 'kg', 5.5, 0, 10, array['Corte limpio de media canal','Fresco garantizado','Precio directo de carnicero']::text[], array['Desposte artesanal','Mayoreo','Carnicería']::text[], array['/images/meat/porkbelly.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('pechuga-de-pollo', 'pechuga-de-pollo', 'Pechuga de Pollo Fresca', 'Poitrine de poulet désossée fraîche', (select id from public.brands where name = 'Aves de Corral'), 'Filetes de pechuga de pollo de granja seleccionados a mano, jugosos, frescos y listos para cocinar.', 'pollo', 'corte', 'kg', 13.55, 0, 45, array['Deshuesada y sin piel','Fresca nunca congelada','Pura proteína magra']::text[], array['Parrilla','Plancha','Horno saludable']::text[], array['/images/meat/butcher.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, true),
    ('alas-bbq-caja-4kg', 'alas-bbq-caja-4kg', 'Alas BBQ (Caja de 4 kg)', 'Ailes de poulet BBQ (Boîte 4 kg)', (select id from public.brands where name = 'Aves de Corral'), 'Caja de 4 kg de alitas de pollo frescas, calibradas uniformemente para dorar parejo en la parrilla o freidora de aire.', 'pollo', 'caja', 'caja-4kg', 52, 0, 25, array['Caja de 4 kg','Corte split wing & drumette','Crocantes por fuera']::text[], array['Air fryer','Horno crocante','Parrilla BBQ']::text[], array['/images/meat/butcher.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, true),
    ('pollo-duro-campesino', 'pollo-duro-campesino', 'Pollo Duro Campesino', 'Poule lourde traditionnelle pour bouillon', (select id from public.brands where name = 'Aves de Corral'), 'Pollo de crianza rústica tradicional, indispensable para el auténtico sancocho o sopas curativas llenas de sabor campesino.', 'pollo', 'corte', 'kg', 7.5, 0, 20, array['Sabor campesino intenso','Ideal para sancochos','Carne firme y aromática']::text[], array['Sancocho de gallina','Caldos sustanciosos','Guisos tradicionales']::text[], array['/images/meat/butcher.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('mollejas-de-pollo-5kg', 'mollejas-de-pollo-5kg', 'Mollejas de Pollo (Boîte 5 kg)', 'Gésiers de poulet (Boîte 5 kg à 8.50$/kg)', (select id from public.brands where name = 'Aves de Corral'), 'Mollejas frescas de pollo en presentación de 5 kg. Deliciosas guisadas con tomate y cebolla o asadas con especias.', 'pollo', 'corte', 'kg', 8.5, 0, 15, array['Textura firme y tierna','Presentación en caja de 5 kg','Limpieza profesional']::text[], array['Guisadas','Parrilla con limón','Confitadas']::text[], array['/images/meat/butcher.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('corazones-de-pollo-5kg', 'corazones-de-pollo-5kg', 'Corazones de Pollo (Boîte 5 kg)', 'Coeurs de poulet (Boîte 5 kg à 8.50$/kg)', (select id from public.brands where name = 'Aves de Corral'), 'Corazones de pollo frescos ideales para brochetas a la brasa al estilo rodizio o salteados con hierbas y mantequilla.', 'pollo', 'corte', 'kg', 8.5, 0, 15, array['Clásico de churrasquería','Bocado jugoso','Caja de 5 kg']::text[], array['Espetadas brasileiras','Salteado con ajo','Brochetas']::text[], array['/images/meat/butcher.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('pierna-de-cordero', 'pierna-de-cordero', 'Pierna de Cordero', 'Gigot d''agneau frais entier', (select id from public.brands where name = 'Chivo y Cordero'), 'Pieza entera de gigot de cordero tierno. Maridado con romero, ajo fresco y vino blanco para un asado inolvidable.', 'chivo', 'corte', 'kg', 16.5, 0, 18, array['Carne tierna y aromática','Pieza entera seleccionada','Gourmet']::text[], array['Horno con romero y ajo','Parrilla a fuego lento','Asado provenzal']::text[], array['/images/meat/meat_steak_raw.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, true),
    ('cuarto-delantero-chivo', 'cuarto-delantero-chivo', 'Cuarto Delantero de Chivo', 'Quart avant de chèvre / Cabrito', (select id from public.brands where name = 'Chivo y Cordero'), 'Cuarto delantero de chivo joven. Especial para birria, estofados al coco o el tradicional chivo al horno.', 'chivo', 'corte', 'kg', 15.79, 0, 14, array['Carne magra y delicada','Tradición caribeña y santandereana','Muy aromática']::text[], array['Chivo al curry','Horno con cerveza','Birria o caldereta']::text[], array['/images/meat/meat_steak_raw.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('carcasa-entera-chivo', 'carcasa-entera-chivo', 'Carcasa Entera de Chivo', 'Carcasse entière de chèvre (15.50$/kg)', (select id from public.brands where name = 'Chivo y Cordero'), 'Carcasa entera de chivo joven seleccionada para asados tradicionales a la estaca o celebraciones especiales.', 'chivo', 'canal', 'kg', 15.5, 0, 8, array['Chivo entero eviscerado','Ideal para asados a la cruz','Sabor auténtico']::text[], array['Asado a la cruz','Barbacoa en fosa','Eventos campestres']::text[], array['/images/meat/meat_steak_raw.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('chorizo-jarabe-de-cana', 'chorizo-jarabe-de-cana', 'Chorizo con Jarabe de Caña', 'Saucisse artisanale au sirop de canne (450g)', (select id from public.brands where name = 'Charcutería Artesanal'), 'Receta insignia de CANRES. Fusión artesanal de cerdo y res sazonados con un toque sutil y caramelizado de jarabe de caña tradicional.', 'chorizos', 'charcuteria', '450g', 8, 0, 40, array['Toque dulce de panela / caña pura','100% Cerdo y Res artesanal','Sin gluten']::text[], array['Parrilla','Plancha','Arepa montañera']::text[], array['/images/meat/chorizos.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, true),
    ('chorizo-arandano-rojo-tomillo', 'chorizo-arandano-rojo-tomillo', 'Chorizo Arándano Rojo & Tomillo', 'Saucisse canneberges & thym frais (450g)', (select id from public.brands where name = 'Charcutería Artesanal'), 'Un tributo directo al savoir-faire québécois: arándanos rojos silvestres que aportan notas ácidas y dulces equilibradas con tomillo aromático.', 'chorizos', 'charcuteria', '450g', 8, 0, 35, array['Canneberges québécoises','Tomillo silvestre','Sabor refinado gourmet']::text[], array['Parrilla','Horno gourmet','Tabla de quesos']::text[], array['/images/meat/chorizos.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, true, true),
    ('chorizo-italiano', 'chorizo-italiano', 'Chorizo Italiano Tradicional', 'Saucisse italienne douce au fenouil (450g)', (select id from public.brands where name = 'Charcutería Artesanal'), 'Elaborado bajo la receta italiana clásica con hinojo dulce tostado, vino blanco y especias aromáticas.', 'chorizos', 'charcuteria', '450g', 8, 0, 40, array['Semillas de hinojo','Ajo asado','Hierbas mediterráneas']::text[], array['Pasta artesanal','Parrilla','Pan baguette']::text[], array['/images/meat/chorizos.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('chorizo-italiano-picante', 'chorizo-italiano-picante', 'Chorizo Italiano Picante', 'Saucisse italienne piquante (450g)', (select id from public.brands where name = 'Charcutería Artesanal'), 'Intensidad italiana con hojuelas de chile peperoncino y pimentón ahumado. Picor balanceado que estimula el paladar sin opacar la carne.', 'chorizos', 'charcuteria', '450g', 8, 0, 35, array['Peperoncino calibrado','Pimentón ahumado','Calor agradable']::text[], array['Parrilla','Pizza artesanal','Sartén']::text[], array['/images/meat/chorizos.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('chorizo-habanero-arandano', 'chorizo-habanero-arandano', 'Chorizo Habanero & Arándano Rojo', 'Saucisse habanero & canneberges (450g)', (select id from public.brands where name = 'Charcutería Artesanal'), 'Una explosión de contrastes audaces: el picor frutal del chile habanero balanceado exquisitamente por la acidez de los arándanos rojos.', 'chorizos', 'charcuteria', '450g', 8, 0, 30, array['Contraste dulce y ardiente','Chile habanero fresco','Audaz y adictivo']::text[], array['Parrilla al carbón','Hamburguesas','Picada']::text[], array['/images/meat/chorizos.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, true),
    ('chorizo-jalapeno-cheddar', 'chorizo-jalapeno-cheddar', 'Chorizo Jalapeño & Cheddar', 'Saucisse jalapeño & cheddar québécois fondu (450g)', (select id from public.brands where name = 'Charcutería Artesanal'), 'Cargado con cubos generosos de queso cheddar québécois que se derriten al calor de la brasa, combinados con jalapeño fresco.', 'chorizos', 'charcuteria', '450g', 8, 0, 45, array['Queso cheddar en cubos fundidos','Jalapeño fresco picado','Top ventas']::text[], array['Parrilla con fuego indirecto','Hot dogs artesanales']::text[], array['/images/meat/chorizos.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, true),
    ('chorizo-santa-rosa-style', 'chorizo-santa-rosa-style', 'Chorizo Santa Rosa Style', 'Saucisse traditionnelle de Santa Rosa de Cabal (450g)', (select id from public.brands where name = 'Charcutería Artesanal'), 'Homenaje a la cuna del chorizo en Colombia: Santa Rosa de Cabal. Embutido en tripa natural con cebolla junca fresca, ajo y notas sutiles de comino.', 'chorizos', 'charcuteria', '450g', 8, 0, 50, array['Patrimonio gastronómico','Cebolla de rama y comino','Sabor inconfundible']::text[], array['Asador al carbón','Hervido en cerveza y dorado','Con arepa y limón']::text[], array['/images/meat/chorizos.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, true),
    ('chorizo-miel-ajo-mostaza', 'chorizo-miel-ajo-mostaza', 'Chorizo Miel, Ajo & Mostaza', 'Saucisse miel pur, ail rôti & moutarde de Dijon (450g)', (select id from public.brands where name = 'Charcutería Artesanal'), 'Miel natural de flores combinada con pasta de ajo rostizado y mostaza en grano. Suavidad, perfume y caramelización inmediata.', 'chorizos', 'charcuteria', '450g', 8, 0, 30, array['Miel de abeja pura','Ajo rostizado','Granos de mostaza antigua']::text[], array['Parrilla','Horno','Aperitivo']::text[], array['/images/meat/chorizos.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('chorizo-merguez', 'chorizo-merguez', 'Chorizo Merguez Artesanal', 'Véritable merguez de boeuf & agneau aux épices (450g)', (select id from public.brands where name = 'Charcutería Artesanal'), 'Auténtica merguez elaborada con carne de res y cordero sazonada con pasta de harissa casera, semillas de cilantro y comino moruno.', 'chorizos', 'charcuteria', '450g', 8, 0, 28, array['Elaborado con res y cordero','Harissa artesanal','Comino y cilantro']::text[], array['Parrilla fuerte','Cuscús','Bocadillos']::text[], array['/images/meat/chorizos.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('butifarra-artesanal', 'butifarra-artesanal', 'Butifarra Artesanal', 'Butifarra traditionnelle avec citron vert (450g)', (select id from public.brands where name = 'Charcutería Artesanal'), 'La auténtica butifarra caribeña elaborada con carne de cerdo y res molida fina con pimienta picante de olor y servida con limón.', 'chorizos', 'charcuteria', '450g', 8, 0, 35, array['Receta de la costa caribe','Pimienta de olor fresca','Bolitas artesanales']::text[], array['Hervida y dorada','Parrilla','Con bollos de yuca y limón']::text[], array['/images/meat/chorizos.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, true),
    ('chorizos-personalizados', 'chorizos-personalizados', 'Chorizos Personalizados al Gusto', 'Saucisses sur mesure aux ingrédients de votre choix (Min. 3 kg)', (select id from public.brands where name = 'Charcutería Artesanal'), 'Crea tu propia receta de embutidos: seleccionamos la proporción de carne y los ingredientes que desees (quesos, pimientos, hierbas, frutas, vinos o especias exclusivas). Elaboración artesanal en 24-48h.', 'personalizados', 'personalizado', 'kg', 16, 0, 99, array['Mínimo de pedido: 3 kg','Ingredientes y perfil a tu gusto','Embutido artesanal exclusivo']::text[], array['Parrilla a gusto','Personalizado al 100%']::text[], array['/images/meat/chorizos.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, true, true),
    ('media-canal-aaa-res-207kg', 'media-canal-aaa-res-207kg', 'Media Canal AAA (Coupé en 4) (~207 kg)', 'Demi-carcasse de boeuf AAA divisée en 4 (15.47$/kg)', (select id from public.brands where name = 'Res AAA'), 'Media res de grado AAA dividida en cuatro cuartos para fácil transporte y maduración. Rendimiento excepcional de cortes nobles.', 'canales', 'canal', 'kg', 15.47, 0, 4, array['Calidad grado AAA','Cortada en 4 cuartos para manejo','Peso promedio 207 kg']::text[], array['Desposte mayorista','Restaurantes','Carnicerías']::text[], array['/images/meat/meat_steak_raw.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('cuarto-trasero-res-aaa-88kg', 'cuarto-trasero-res-aaa-88kg', 'Cuarto Trasero de Res AAA (~88 kg)', 'Quart arrière de boeuf AAA (16.94$/kg)', (select id from public.brands where name = 'Res AAA'), 'Cuarto trasero entero de novillo grado AAA que concentra los cortes más valorados para la parrilla: lomo, picaña y bife.', 'canales', 'canal', 'kg', 16.94, 0, 6, array['Incluye lomo, picaña, cadera y pierna','El cuarto más codiciado','Grado AAA']::text[], array['Desposte de cortes de primera','Picaña, lomo y piernas']::text[], array['/images/meat/meat_steak_raw.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('cuarto-delantero-res-aaa-116kg', 'cuarto-delantero-res-aaa-116kg', 'Cuarto Delantero AAA (~116 kg)', 'Quart avant de boeuf AAA (14.74$/kg)', (select id from public.brands where name = 'Res AAA'), 'Cuarto delantero de novillo AAA con costillar, sobrebarriga y espaldilla. Excelente relación precio-carne.', 'canales', 'canal', 'kg', 14.74, 0, 6, array['Ideal para briskets y ahumados','Alto rendimiento de carne magra','Grado AAA']::text[], array['Brisket, costilla, chuck y molidas']::text[], array['/images/meat/meat_steak_raw.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('media-canal-aa-res-205kg', 'media-canal-aa-res-205kg', 'Media Canal AA (Coupé en 4) (~205 kg)', 'Demi-carcasse de boeuf AA divisée en 4 (15.17$/kg)', (select id from public.brands where name = 'Res AAA'), 'Media res grado AA, excelente balance para negocios gastronómicos con alta rotación de carne magra.', 'canales', 'canal', 'kg', 15.17, 0, 5, array['Grado AA balanceado','Dividido en 4 para corte fácil','Gran rendimiento']::text[], array['Restaurantes y carnicerías']::text[], array['/images/meat/meat_steak_raw.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, false),
    ('caja-carne-con-hueso-11kg', 'caja-carne-con-hueso-11kg', 'Caja de Carne con Hueso (11 kg)', 'Boîte de viande avec os 11 kg pour ragoûts et soupes', (select id from public.brands where name = 'Res AAA'), 'Caja de 11 kg surtida con cortes de carne pegada al hueso, tuétano y ossobuco para sancochos memorables y fondos de cocina ricos en colágeno.', 'canales', 'caja', 'caja-11kg', 150, 0, 12, array['11 kg seleccionados','Huesos con médula y carne adherida','Precio por caja']::text[], array['Sopas sustanciosas','Caldos de hueso gelatinoso','Guisos lentos']::text[], array['/images/meat/meat_steak_raw.jpg']::text[], '{"from":"#660F12","to":"#141414","accent":"#8B0000"}'::jsonb, false, true)
on conflict (id) do update set
    name = excluded.name,
    subname = excluded.subname,
    price = excluded.price,
    stock = excluded.stock,
    description = excluded.description,
    notes = excluded.notes,
    cooking_methods = excluded.cooking_methods,
    images = excluded.images,
    is_new = excluded.is_new,
    is_featured = excluded.is_featured;
