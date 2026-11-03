// Catálogo oficial de CANRES Viandes · Boucherie Artisanale & Charcuterie.
// Basado fielmente en la lista de precios oficial (Res, Cerdo, Pollo, Chivo/Cordero, Chorizos Artesanales y Mayoristas).

export const SEED_PRODUCTS = [
    {
        "id": "lomo-ancho-rib-eye",
        "slug": "lomo-ancho-rib-eye",
        "name": "Lomo Ancho Rib Eye",
        "subname": "Faux-filet / Ribeye AAA",
        "brand": "Res AAA",
        "gender": "res",
        "type": "corte",
        "unit": "kg",
        "price": 32.0,
        "discountPercent": 0,
        "stock": 35,
        "cookingMethods": [
            "Parrilla",
            "Sartén de hierro",
            "Asador"
        ],
        "notes": [
            "Marmoleo AAA superior",
            "Máxima jugosidad",
            "Corte grueso de alta gama",
            "Maduración en frío"
        ],
        "description": "El rey indiscutible de la parrilla. Corte de lomo ancho con abundante marmoleo intramuscular que se funde en la cocción, otorgando una terneza legendaria y un sabor profundo inigualable.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/meat_beef_cut.jpg",
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739785/canres-viandes/ribs.jpg"
        ]
    },
    {
        "id": "lomo-chatas-new-york",
        "slug": "lomo-chatas-new-york",
        "name": "Lomo Chatas New York",
        "subname": "Contre-filet / Strip Loin AAA",
        "brand": "Res AAA",
        "gender": "res",
        "type": "corte",
        "unit": "kg",
        "price": 28.0,
        "discountPercent": 0,
        "stock": 25,
        "cookingMethods": [
            "Parrilla",
            "Sartén",
            "Plancha"
        ],
        "notes": [
            "Textura firme y tierna",
            "Borde de grasa exterior dorado",
            "Corte New York Steak"
        ],
        "description": "Corte clásico de bife angosto o contra-filete con una distintiva pestaña de grasa exterior que carameliza en la brasa. Equilibrado, magro y jugoso.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739785/canres-viandes/ribeye.jpg"
        ]
    },
    {
        "id": "punta-de-picanha-aaa",
        "slug": "punta-de-picanha-aaa",
        "name": "Punta de Picaña AAA",
        "subname": "Haut de surlonge / Picanha AAA",
        "brand": "Res AAA",
        "gender": "res",
        "type": "corte",
        "unit": "kg",
        "price": 20.0,
        "discountPercent": 0,
        "stock": 30,
        "cookingMethods": [
            "Espada al carbón",
            "Parrilla",
            "Ahumador"
        ],
        "notes": [
            "Capa uniforme de grasa",
            "Ideal para espadas al carbón",
            "Corte estrella sudamericano"
        ],
        "description": "La emblemática picaña con su generosa capa de grasa superior. Al asarse lentamente en brasa, la grasa impregna cada fibra dando un bocado mantecoso y sabroso.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739785/canres-viandes/ribeye.jpg"
        ]
    },
    {
        "id": "picanha-sterling",
        "slug": "picanha-sterling",
        "name": "Picaña Sterling Silver",
        "subname": "Picanha Réserve Sterling",
        "brand": "Res AAA",
        "gender": "res",
        "type": "corte",
        "unit": "kg",
        "price": 30.0,
        "discountPercent": 0,
        "stock": 15,
        "cookingMethods": [
            "Parrilla",
            "Spit-Roast",
            "Ahumador"
        ],
        "notes": [
            "Certificación Sterling",
            "Marmoleo extra selecto",
            "Reserva de carnicero"
        ],
        "description": "Selección de picaña de grado Sterling Silver. Máxima uniformidad, terneza garantizada y marmoleado superior para conocedores exigentes.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": true,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739785/canres-viandes/ribs.jpg"
        ]
    },
    {
        "id": "espaldilla-aaa",
        "slug": "espaldilla-aaa",
        "name": "Espaldilla AAA",
        "subname": "Palette de boeuf AAA",
        "brand": "Res AAA",
        "gender": "res",
        "type": "corte",
        "unit": "kg",
        "price": 28.0,
        "discountPercent": 0,
        "stock": 20,
        "cookingMethods": [
            "Horno",
            "Cocción lenta",
            "Guisos gourmet"
        ],
        "notes": [
            "Colágeno soluble",
            "Rico en sabor umami",
            "Perfecto para asados lentos"
        ],
        "description": "Corte noble de la espaldilla de res AAA. Excelente para braseados, cocción lenta y estofados tradicionales donde la carne se deshebra con facilidad.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg"
        ]
    },
    {
        "id": "sobrebarriga",
        "slug": "sobrebarriga",
        "name": "Sobrebarriga Tradicional",
        "subname": "Bavette de flanc / Flank steak",
        "brand": "Res AAA",
        "gender": "res",
        "type": "corte",
        "unit": "kg",
        "price": 24.0,
        "discountPercent": 0,
        "stock": 22,
        "cookingMethods": [
            "Horno con cerveza",
            "En salsa criolla",
            "Parrilla"
        ],
        "notes": [
            "Tradición colombiana",
            "Ideal al horno o en salsa",
            "Carne tierna y fibrosa"
        ],
        "description": "El clásico de la gastronomía colombiana. Cocinada al horno o en salsa con hierbas y especias hasta quedar tierna y suave.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739786/canres-viandes/steak.jpg"
        ]
    },
    {
        "id": "carne-molida-extra-magra",
        "slug": "carne-molida-extra-magra",
        "name": "Carne Molida Extra-Magra",
        "subname": "Boeuf haché extra-maigre",
        "brand": "Res AAA",
        "gender": "res",
        "type": "corte",
        "unit": "kg",
        "price": 17.8,
        "discountPercent": 0,
        "stock": 50,
        "cookingMethods": [
            "Hamburguesas artesanales",
            "Albóndigas",
            "Salsas boloñesas"
        ],
        "notes": [
            "90/10 Magro",
            "Molida fresca del día",
            "Sin aditivos ni preservantes"
        ],
        "description": "Molida 100% de cortes seleccionados de res, con proporción 90/10 para un balance perfecto entre jugosidad y salud.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739786/canres-viandes/steak.jpg"
        ]
    },
    {
        "id": "lengua-de-res",
        "slug": "lengua-de-res",
        "name": "Lengua de Res Fresca",
        "subname": "Langue de boeuf fraîche",
        "brand": "Res AAA",
        "gender": "res",
        "type": "corte",
        "unit": "kg",
        "price": 23.0,
        "discountPercent": 0,
        "stock": 12,
        "cookingMethods": [
            "Guisada en salsa criolla",
            "Alcaparrada",
            "En vinagreta"
        ],
        "notes": [
            "Delicadeza artesanal",
            "Textura aterciopelada",
            "Limpia y fresca"
        ],
        "description": "Lengua de res fresca de primera calidad. Textura tierna al cocerse lentamente con especias tradicionales.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg"
        ]
    },
    {
        "id": "cola-de-res",
        "slug": "cola-de-res",
        "name": "Cola de Res",
        "subname": "Queue de boeuf (Oxtail)",
        "brand": "Res AAA",
        "gender": "res",
        "type": "corte",
        "unit": "kg",
        "price": 23.0,
        "discountPercent": 0,
        "stock": 15,
        "cookingMethods": [
            "Sancocho",
            "Estofado oxtail",
            "Cocción lenta"
        ],
        "notes": [
            "Rica en colágeno y gelatina",
            "Para caldos densos y sabrosos",
            "Corte tradicional"
        ],
        "description": "Corte por excelencia para sancochos, sopas consistentes y guisos reconfortantes con alta concentración de colágeno natural.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg"
        ]
    },
    {
        "id": "higado-de-res",
        "slug": "higado-de-res",
        "name": "Hígado de Res",
        "subname": "Foie de boeuf frais",
        "brand": "Res AAA",
        "gender": "res",
        "type": "corte",
        "unit": "kg",
        "price": 10.0,
        "discountPercent": 0,
        "stock": 18,
        "cookingMethods": [
            "Encebollado",
            "Plancha rápida",
            "Salteado"
        ],
        "notes": [
            "Alto en hierro y vitaminas",
            "Fresco del día",
            "Fileteado limpio"
        ],
        "description": "Hígado fresco de res, ideal para el tradicional bistec encebollado o preparaciones rápidas a la plancha.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg"
        ]
    },
    {
        "id": "rinon-de-res",
        "slug": "rinon-de-res",
        "name": "Riñón de Res",
        "subname": "Rognons de boeuf",
        "brand": "Res AAA",
        "gender": "res",
        "type": "corte",
        "unit": "kg",
        "price": 10.0,
        "discountPercent": 0,
        "stock": 14,
        "cookingMethods": [
            "Al jerez",
            "Guisado",
            "Plancha"
        ],
        "notes": [
            "Víscera seleccionada",
            "Limpieza minuciosa"
        ],
        "description": "Riñón fresco de res seleccionado para guisos tradicionales, al vino o al jerez.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg"
        ]
    },
    {
        "id": "bofe-de-res",
        "slug": "bofe-de-res",
        "name": "Bofe de Res",
        "subname": "Poumon de boeuf traditionnel",
        "brand": "Res AAA",
        "gender": "res",
        "type": "corte",
        "unit": "kg",
        "price": 10.0,
        "discountPercent": 0,
        "stock": 15,
        "cookingMethods": [
            "Frito crocante",
            "Guisado",
            "Picada"
        ],
        "notes": [
            "Tradición de picada",
            "Crocante frito",
            "Auténtico sabor"
        ],
        "description": "Ingrediente clásico de la fritanga y picadas artesanales, hervido con especias y frito hasta dorar.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg"
        ]
    },
    {
        "id": "costilla-de-cerdo-baby",
        "slug": "costilla-de-cerdo-baby",
        "name": "Costilla de Cerdo (Baby Back)",
        "subname": "Côtes levées de porc dos (Baby Back)",
        "brand": "Cerdo Selecto",
        "gender": "cerdo",
        "type": "corte",
        "unit": "kg",
        "price": 12.0,
        "discountPercent": 0,
        "stock": 40,
        "cookingMethods": [
            "Ahumador BBQ",
            "Horno glaseado",
            "Parrilla"
        ],
        "notes": [
            "Carne tierna entre huesos",
            "Ideal con salsa barbacoa",
            "Costillar parejo"
        ],
        "description": "Costillar Baby Back tierno y carnudo. Perfecto para hornear a baja temperatura con glaseado agridulce o ahumar lentamente al estilo BBQ.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739785/canres-viandes/ribs.jpg"
        ]
    },
    {
        "id": "panceta-avec-couenne",
        "slug": "panceta-avec-couenne",
        "name": "Panceta con Cuero (Avec Couenne)",
        "subname": "Flanc de porc avec couenne (Chicharrón)",
        "brand": "Cerdo Selecto",
        "gender": "cerdo",
        "type": "corte",
        "unit": "kg",
        "price": 10.74,
        "discountPercent": 0,
        "stock": 35,
        "cookingMethods": [
            "Air fryer",
            "Horno crocante",
            "Fritura tradicional"
        ],
        "notes": [
            "Ideal para chicharrón crocante",
            "Equilibrio carne y tocino",
            "Corte fresco de primera"
        ],
        "description": "La panceta ideal para lograr el chicharrón crujiente perfecto. Excelente relación carne magra y tocino para freír, hornear o confitar.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739784/canres-viandes/porkbelly.jpg"
        ]
    },
    {
        "id": "panceta-sans-couenne",
        "slug": "panceta-sans-couenne",
        "name": "Panceta sin Cuero (Sans Couenne)",
        "subname": "Flanc de porc sans couenne / Pork Belly",
        "brand": "Cerdo Selecto",
        "gender": "cerdo",
        "type": "corte",
        "unit": "kg",
        "price": 11.0,
        "discountPercent": 0,
        "stock": 28,
        "cookingMethods": [
            "Parrilla",
            "Horno glaseado",
            "Ahumado"
        ],
        "notes": [
            "Pork belly deshuesado",
            "Fácil de rebanar y asar",
            "Suavidad pura"
        ],
        "description": "Tocino entreverado sin cuero, ideal para rebanadas gruesas a la brasa, bao buns, o preparaciones ahumadas.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739784/canres-viandes/porkbelly.jpg"
        ]
    },
    {
        "id": "hombro-de-cerdo",
        "slug": "hombro-de-cerdo",
        "name": "Hombro de Cerdo",
        "subname": "Épaule de porc fraîche (Boston Butt)",
        "brand": "Cerdo Selecto",
        "gender": "cerdo",
        "type": "corte",
        "unit": "kg",
        "price": 8.5,
        "discountPercent": 0,
        "stock": 30,
        "cookingMethods": [
            "Pulled pork",
            "Horno lento",
            "Carnitas"
        ],
        "notes": [
            "Inmejorable para pulled pork",
            "Jugoso y suave",
            "Económico y rendidor"
        ],
        "description": "Hombro de cerdo fresco con marmoleo perfecto para desmechar (pulled pork), lechona o carnitas mexicanas.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739784/canres-viandes/porkbelly.jpg"
        ]
    },
    {
        "id": "pierna-de-cerdo",
        "slug": "pierna-de-cerdo",
        "name": "Pierna de Cerdo",
        "subname": "Cuisseau de porc / Jambon frais",
        "brand": "Cerdo Selecto",
        "gender": "cerdo",
        "type": "corte",
        "unit": "kg",
        "price": 8.5,
        "discountPercent": 0,
        "stock": 25,
        "cookingMethods": [
            "Horno navideño",
            "Milanesas",
            "Guisos"
        ],
        "notes": [
            "Carne magra y sana",
            "Excelente rendimiento",
            "Ideal para hornear entero"
        ],
        "description": "Pierna de cerdo limpia y magra. Perfecta para asar entera al horno con adobo especial o cortar en filetes jugosos.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739784/canres-viandes/porkbelly.jpg"
        ]
    },
    {
        "id": "costilla-de-falda",
        "slug": "costilla-de-falda",
        "name": "Costilla de Falda de Cerdo",
        "subname": "Côtes de flanc (St. Louis style)",
        "brand": "Cerdo Selecto",
        "gender": "cerdo",
        "type": "corte",
        "unit": "kg",
        "price": 8.5,
        "discountPercent": 0,
        "stock": 20,
        "cookingMethods": [
            "Parrilla",
            "Ahumador",
            "Sancocho"
        ],
        "notes": [
            "Mayor contenido de carne",
            "Sabor intenso a costilla",
            "Precio excepcional"
        ],
        "description": "Costilla de falda con un balance sustancioso de carne y sabor parrillero. Muy rendidora para reuniones y asados.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739785/canres-viandes/ribs.jpg"
        ]
    },
    {
        "id": "costilla-de-epaule-caja-13kg",
        "slug": "costilla-de-epaule-caja-13kg",
        "name": "Costilla de Épaule (Caja 13 kg)",
        "subname": "Boîte 13 kg de côtes d'épaule (5.29$/kg)",
        "brand": "Cerdo Selecto",
        "gender": "cerdo",
        "type": "caja",
        "unit": "caja-13kg",
        "price": 70.0,
        "discountPercent": 0,
        "stock": 15,
        "cookingMethods": [
            "Asados masivos",
            "Restaurantes",
            "Freezer familiar"
        ],
        "notes": [
            "Caja completa de 13 kg",
            "A sólo $5.29 / kg",
            "Ahorro mayorista garantizado"
        ],
        "description": "Caja de 13 kilogramos de costilla de paleta de cerdo a precio mayorista. La mejor opción para restaurantes, eventos familiares y freeze.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739785/canres-viandes/ribs.jpg"
        ]
    },
    {
        "id": "media-canal-cerdo",
        "slug": "media-canal-cerdo",
        "name": "Media Canal de Cerdo",
        "subname": "Demi-carcasse de porc (5.50$/kg)",
        "brand": "Cerdo Selecto",
        "gender": "cerdo",
        "type": "canal",
        "unit": "kg",
        "price": 5.5,
        "discountPercent": 0,
        "stock": 10,
        "cookingMethods": [
            "Desposte artesanal",
            "Mayoreo",
            "Carnicería"
        ],
        "notes": [
            "Corte limpio de media canal",
            "Fresco garantizado",
            "Precio directo de carnicero"
        ],
        "description": "Media canal entera de cerdo seleccionada bajo estrictas normas sanitarias. Ideal para negocios de hostelería o desposte personalizado.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739784/canres-viandes/porkbelly.jpg"
        ]
    },
    {
        "id": "pechuga-de-pollo",
        "slug": "pechuga-de-pollo",
        "name": "Pechuga de Pollo Fresca",
        "subname": "Poitrine de poulet désossée fraîche",
        "brand": "Aves de Corral",
        "gender": "pollo",
        "type": "corte",
        "unit": "kg",
        "price": 13.5,
        "discountPercent": 0,
        "stock": 45,
        "cookingMethods": [
            "Parrilla",
            "Plancha",
            "Horno saludable"
        ],
        "notes": [
            "Deshuesada y sin piel",
            "Fresca nunca congelada",
            "Pura proteína magra"
        ],
        "description": "Filetes de pechuga de pollo de granja seleccionados a mano, jugosos, frescos y listos para cocinar.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739781/canres-viandes/butcher.jpg"
        ]
    },
    {
        "id": "alas-bbq-caja-4kg",
        "slug": "alas-bbq-caja-4kg",
        "name": "Alas BBQ (Caja de 4 kg)",
        "subname": "Ailes de poulet BBQ (Boîte 4 kg)",
        "brand": "Aves de Corral",
        "gender": "pollo",
        "type": "caja",
        "unit": "caja-4kg",
        "price": 52.0,
        "discountPercent": 0,
        "stock": 25,
        "cookingMethods": [
            "Air fryer",
            "Horno crocante",
            "Parrilla BBQ"
        ],
        "notes": [
            "Caja de 4 kg",
            "Corte split wing & drumette",
            "Crocantes por fuera"
        ],
        "description": "Caja de 4 kg de alitas de pollo frescas, calibradas uniformemente para dorar parejo en la parrilla o freidora de aire.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739781/canres-viandes/butcher.jpg"
        ]
    },
    {
        "id": "pollo-duro-campesino",
        "slug": "pollo-duro-campesino",
        "name": "Pollo Duro Campesino",
        "subname": "Poule lourde traditionnelle pour bouillon",
        "brand": "Aves de Corral",
        "gender": "pollo",
        "type": "corte",
        "unit": "kg",
        "price": 7.5,
        "discountPercent": 0,
        "stock": 20,
        "cookingMethods": [
            "Sancocho de gallina",
            "Caldos sustanciosos",
            "Guisos tradicionales"
        ],
        "notes": [
            "Sabor campesino intenso",
            "Ideal para sancochos",
            "Carne firme y aromática"
        ],
        "description": "Pollo de crianza rústica tradicional, indispensable para el auténtico sancocho o sopas curativas llenas de sabor campesino.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739781/canres-viandes/butcher.jpg"
        ]
    },
    {
        "id": "mollejas-de-pollo-5kg",
        "slug": "mollejas-de-pollo-5kg",
        "name": "Mollejas de Pollo (Boîte 5 kg)",
        "subname": "Gésiers de poulet (Boîte 5 kg à 8.50$/kg)",
        "brand": "Aves de Corral",
        "gender": "pollo",
        "type": "corte",
        "unit": "kg",
        "price": 8.5,
        "discountPercent": 0,
        "stock": 15,
        "cookingMethods": [
            "Guisadas",
            "Parrilla con limón",
            "Confitadas"
        ],
        "notes": [
            "Textura firme y tierna",
            "Presentación en caja de 5 kg",
            "Limpieza profesional"
        ],
        "description": "Mollejas frescas de pollo en presentación de 5 kg. Deliciosas guisadas con tomate y cebolla o asadas con especias.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739781/canres-viandes/butcher.jpg"
        ]
    },
    {
        "id": "corazones-de-pollo-5kg",
        "slug": "corazones-de-pollo-5kg",
        "name": "Corazones de Pollo (Boîte 5 kg)",
        "subname": "Coeurs de poulet (Boîte 5 kg à 8.50$/kg)",
        "brand": "Aves de Corral",
        "gender": "pollo",
        "type": "corte",
        "unit": "kg",
        "price": 8.5,
        "discountPercent": 0,
        "stock": 15,
        "cookingMethods": [
            "Espetadas brasileiras",
            "Salteado con ajo",
            "Brochetas"
        ],
        "notes": [
            "Clásico de churrasquería",
            "Bocado jugoso",
            "Caja de 5 kg"
        ],
        "description": "Corazones de pollo frescos ideales para brochetas a la brasa al estilo rodizio o salteados con hierbas y mantequilla.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739781/canres-viandes/butcher.jpg"
        ]
    },
    {
        "id": "pierna-de-cordero",
        "slug": "pierna-de-cordero",
        "name": "Pierna de Cordero",
        "subname": "Gigot d'agneau frais entier",
        "brand": "Chivo y Cordero",
        "gender": "chivo",
        "type": "corte",
        "unit": "kg",
        "price": 16.5,
        "discountPercent": 0,
        "stock": 18,
        "cookingMethods": [
            "Horno con romero y ajo",
            "Parrilla a fuego lento",
            "Asado provenzal"
        ],
        "notes": [
            "Carne tierna y aromática",
            "Pieza entera seleccionada",
            "Gourmet"
        ],
        "description": "Pieza entera de gigot de cordero tierno. Maridado con romero, ajo fresco y vino blanco para un asado inolvidable.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg"
        ]
    },
    {
        "id": "cuarto-delantero-chivo",
        "slug": "cuarto-delantero-chivo",
        "name": "Cuarto Delantero de Chivo",
        "subname": "Quart avant de chèvre / Cabrito",
        "brand": "Chivo y Cordero",
        "gender": "chivo",
        "type": "corte",
        "unit": "kg",
        "price": 15.79,
        "discountPercent": 0,
        "stock": 14,
        "cookingMethods": [
            "Chivo al curry",
            "Horno con cerveza",
            "Birria o caldereta"
        ],
        "notes": [
            "Carne magra y delicada",
            "Tradición caribeña y santandereana",
            "Muy aromática"
        ],
        "description": "Cuarto delantero de chivo joven. Especial para birria, estofados al coco o el tradicional chivo al horno.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg"
        ]
    },
    {
        "id": "carcasa-entera-chivo",
        "slug": "carcasa-entera-chivo",
        "name": "Carcasa Entera de Chivo",
        "subname": "Carcasse entière de chèvre (15.50$/kg)",
        "brand": "Chivo y Cordero",
        "gender": "chivo",
        "type": "canal",
        "unit": "kg",
        "price": 15.5,
        "discountPercent": 0,
        "stock": 8,
        "cookingMethods": [
            "Asado a la cruz",
            "Barbacoa en fosa",
            "Eventos campestres"
        ],
        "notes": [
            "Chivo entero eviscerado",
            "Ideal para asados a la cruz",
            "Sabor auténtico"
        ],
        "description": "Carcasa entera de chivo joven seleccionada para asados tradicionales a la estaca o celebraciones especiales.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg"
        ]
    },
    {
        "id": "chorizo-jarabe-de-cana",
        "slug": "chorizo-jarabe-de-cana",
        "name": "Chorizo con Jarabe de Caña",
        "subname": "Saucisse artisanale au sirop de canne (450g)",
        "brand": "Charcutería Artesanal",
        "gender": "chorizos",
        "type": "charcuteria",
        "unit": "450g",
        "price": 8.0,
        "discountPercent": 0,
        "stock": 40,
        "cookingMethods": [
            "Parrilla",
            "Plancha",
            "Arepa montañera"
        ],
        "notes": [
            "Toque dulce de panela / caña pura",
            "100% Cerdo y Res artesanal",
            "Sin gluten"
        ],
        "description": "Receta insignia de CANRES. Fusión artesanal de cerdo y res sazonados con un toque sutil y caramelizado de jarabe de caña tradicional.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/chorizos.jpg"
        ]
    },
    {
        "id": "chorizo-arandano-rojo-tomillo",
        "slug": "chorizo-arandano-rojo-tomillo",
        "name": "Chorizo Arándano Rojo & Tomillo",
        "subname": "Saucisse canneberges & thym frais (450g)",
        "brand": "Charcutería Artesanal",
        "gender": "chorizos",
        "type": "charcuteria",
        "unit": "450g",
        "price": 8.0,
        "discountPercent": 0,
        "stock": 35,
        "cookingMethods": [
            "Parrilla",
            "Horno gourmet",
            "Tabla de quesos"
        ],
        "notes": [
            "Canneberges québécoises",
            "Tomillo silvestre",
            "Sabor refinado gourmet"
        ],
        "description": "Un tributo directo al savoir-faire québécois: arándanos rojos silvestres que aportan notas ácidas y dulces equilibradas con tomillo aromático.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": true,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/chorizos.jpg"
        ]
    },
    {
        "id": "chorizo-italiano",
        "slug": "chorizo-italiano",
        "name": "Chorizo Italiano Tradicional",
        "subname": "Saucisse italienne douce au fenouil (450g)",
        "brand": "Charcutería Artesanal",
        "gender": "chorizos",
        "type": "charcuteria",
        "unit": "450g",
        "price": 8.0,
        "discountPercent": 0,
        "stock": 40,
        "cookingMethods": [
            "Pasta artesanal",
            "Parrilla",
            "Pan baguette"
        ],
        "notes": [
            "Semillas de hinojo",
            "Ajo asado",
            "Hierbas mediterráneas"
        ],
        "description": "Elaborado bajo la receta italiana clásica con hinojo dulce tostado, vino blanco y especias aromáticas.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/chorizos.jpg"
        ]
    },
    {
        "id": "chorizo-italiano-picante",
        "slug": "chorizo-italiano-picante",
        "name": "Chorizo Italiano Picante",
        "subname": "Saucisse italienne piquante (450g)",
        "brand": "Charcutería Artesanal",
        "gender": "chorizos",
        "type": "charcuteria",
        "unit": "450g",
        "price": 8.0,
        "discountPercent": 0,
        "stock": 35,
        "cookingMethods": [
            "Parrilla",
            "Pizza artesanal",
            "Sartén"
        ],
        "notes": [
            "Peperoncino calibrado",
            "Pimentón ahumado",
            "Calor agradable"
        ],
        "description": "Intensidad italiana con hojuelas de chile peperoncino y pimentón ahumado. Picor balanceado que estimula el paladar sin opacar la carne.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/chorizos.jpg"
        ]
    },
    {
        "id": "chorizo-habanero-arandano",
        "slug": "chorizo-habanero-arandano",
        "name": "Chorizo Habanero & Arándano Rojo",
        "subname": "Saucisse habanero & canneberges (450g)",
        "brand": "Charcutería Artesanal",
        "gender": "chorizos",
        "type": "charcuteria",
        "unit": "450g",
        "price": 8.0,
        "discountPercent": 0,
        "stock": 30,
        "cookingMethods": [
            "Parrilla al carbón",
            "Hamburguesas",
            "Picada"
        ],
        "notes": [
            "Contraste dulce y ardiente",
            "Chile habanero fresco",
            "Audaz y adictivo"
        ],
        "description": "Una explosión de contrastes audaces: el picor frutal del chile habanero balanceado exquisitamente por la acidez de los arándanos rojos.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/chorizos.jpg"
        ]
    },
    {
        "id": "chorizo-jalapeno-cheddar",
        "slug": "chorizo-jalapeno-cheddar",
        "name": "Chorizo Jalapeño & Cheddar",
        "subname": "Saucisse jalapeño & cheddar québécois fondu (450g)",
        "brand": "Charcutería Artesanal",
        "gender": "chorizos",
        "type": "charcuteria",
        "unit": "450g",
        "price": 8.0,
        "discountPercent": 0,
        "stock": 45,
        "cookingMethods": [
            "Parrilla con fuego indirecto",
            "Hot dogs artesanales"
        ],
        "notes": [
            "Queso cheddar en cubos fundidos",
            "Jalapeño fresco picado",
            "Top ventas"
        ],
        "description": "Cargado con cubos generosos de queso cheddar québécois que se derriten al calor de la brasa, combinados con jalapeño fresco.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/chorizos.jpg"
        ]
    },
    {
        "id": "chorizo-santa-rosa-style",
        "slug": "chorizo-santa-rosa-style",
        "name": "Chorizo Santa Rosa Style",
        "subname": "Saucisse traditionnelle de Santa Rosa de Cabal (450g)",
        "brand": "Charcutería Artesanal",
        "gender": "chorizos",
        "type": "charcuteria",
        "unit": "450g",
        "price": 8.0,
        "discountPercent": 0,
        "stock": 50,
        "cookingMethods": [
            "Asador al carbón",
            "Hervido en cerveza y dorado",
            "Con arepa y limón"
        ],
        "notes": [
            "Patrimonio gastronómico",
            "Cebolla de rama y comino",
            "Sabor inconfundible"
        ],
        "description": "Homenaje a la cuna del chorizo en Colombia: Santa Rosa de Cabal. Embutido en tripa natural con cebolla junca fresca, ajo y notas sutiles de comino.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/chorizos.jpg"
        ]
    },
    {
        "id": "chorizo-miel-ajo-mostaza",
        "slug": "chorizo-miel-ajo-mostaza",
        "name": "Chorizo Miel, Ajo & Mostaza",
        "subname": "Saucisse miel pur, ail rôti & moutarde de Dijon (450g)",
        "brand": "Charcutería Artesanal",
        "gender": "chorizos",
        "type": "charcuteria",
        "unit": "450g",
        "price": 8.0,
        "discountPercent": 0,
        "stock": 30,
        "cookingMethods": [
            "Parrilla",
            "Horno",
            "Aperitivo"
        ],
        "notes": [
            "Miel de abeja pura",
            "Ajo rostizado",
            "Granos de mostaza antigua"
        ],
        "description": "Miel natural de flores combinada con pasta de ajo rostizado y mostaza en grano. Suavidad, perfume y caramelización inmediata.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/chorizos.jpg"
        ]
    },
    {
        "id": "chorizo-merguez",
        "slug": "chorizo-merguez",
        "name": "Chorizo Merguez Artesanal",
        "subname": "Véritable merguez de boeuf & agneau aux épices (450g)",
        "brand": "Charcutería Artesanal",
        "gender": "chorizos",
        "type": "charcuteria",
        "unit": "450g",
        "price": 8.0,
        "discountPercent": 0,
        "stock": 28,
        "cookingMethods": [
            "Parrilla fuerte",
            "Cuscús",
            "Bocadillos"
        ],
        "notes": [
            "Elaborado con res y cordero",
            "Harissa artesanal",
            "Comino y cilantro"
        ],
        "description": "Auténtica merguez elaborada con carne de res y cordero sazonada con pasta de harissa casera, semillas de cilantro y comino moruno.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/chorizos.jpg"
        ]
    },
    {
        "id": "butifarra-artesanal",
        "slug": "butifarra-artesanal",
        "name": "Butifarra Artesanal",
        "subname": "Butifarra traditionnelle avec citron vert (450g)",
        "brand": "Charcutería Artesanal",
        "gender": "chorizos",
        "type": "charcuteria",
        "unit": "450g",
        "price": 8.0,
        "discountPercent": 0,
        "stock": 35,
        "cookingMethods": [
            "Hervida y dorada",
            "Parrilla",
            "Con bollos de yuca y limón"
        ],
        "notes": [
            "Receta de la costa caribe",
            "Pimienta de olor fresca",
            "Bolitas artesanales"
        ],
        "description": "La auténtica butifarra caribeña elaborada con carne de cerdo y res molida fina con pimienta picante de olor y servida con limón.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/chorizos.jpg"
        ]
    },
    {
        "id": "chorizos-personalizados",
        "slug": "chorizos-personalizados",
        "name": "Chorizos Personalizados al Gusto",
        "subname": "Saucisses sur mesure aux ingrédients de votre choix (Min. 3 kg)",
        "brand": "Charcutería Artesanal",
        "gender": "personalizados",
        "type": "personalizado",
        "unit": "kg",
        "price": 16.0,
        "discountPercent": 0,
        "stock": 99,
        "cookingMethods": [
            "Parrilla a gusto",
            "Personalizado al 100%"
        ],
        "notes": [
            "Mínimo de pedido: 3 kg",
            "Ingredientes y perfil a tu gusto",
            "Embutido artesanal exclusivo"
        ],
        "description": "Crea tu propia receta de embutidos: seleccionamos la proporción de carne y los ingredientes que desees (quesos, pimientos, hierbas, frutas, vinos o especias exclusivas). Elaboración artesanal en 24-48h.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": true,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739782/canres-viandes/chorizos.jpg"
        ]
    },
    {
        "id": "media-canal-aaa-res-207kg",
        "slug": "media-canal-aaa-res-207kg",
        "name": "Media Canal AAA (Coupé en 4) (~207 kg)",
        "subname": "Demi-carcasse de boeuf AAA divisée en 4 (15.47$/kg)",
        "brand": "Res AAA",
        "gender": "res",
        "type": "canal",
        "unit": "kg",
        "price": 15.47,
        "discountPercent": 0,
        "stock": 4,
        "cookingMethods": [
            "Desposte mayorista",
            "Restaurantes",
            "Carnicerías"
        ],
        "notes": [
            "Calidad grado AAA",
            "Cortada en 4 cuartos para manejo",
            "Peso promedio 207 kg"
        ],
        "description": "Media res de grado AAA dividida en cuatro cuartos para fácil transporte y maduración. Rendimiento excepcional de cortes nobles.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg"
        ]
    },
    {
        "id": "cuarto-trasero-res-aaa-88kg",
        "slug": "cuarto-trasero-res-aaa-88kg",
        "name": "Cuarto Trasero de Res AAA (~88 kg)",
        "subname": "Quart arrière de boeuf AAA (16.94$/kg)",
        "brand": "Res AAA",
        "gender": "res",
        "type": "canal",
        "unit": "kg",
        "price": 16.94,
        "discountPercent": 0,
        "stock": 6,
        "cookingMethods": [
            "Desposte de cortes de primera",
            "Picaña, lomo y piernas"
        ],
        "notes": [
            "Incluye lomo, picaña, cadera y pierna",
            "El cuarto más codiciado",
            "Grado AAA"
        ],
        "description": "Cuarto trasero entero de novillo grado AAA que concentra los cortes más valorados para la parrilla: lomo, picaña y bife.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg"
        ]
    },
    {
        "id": "cuarto-delantero-res-aaa-116kg",
        "slug": "cuarto-delantero-res-aaa-116kg",
        "name": "Cuarto Delantero AAA (~116 kg)",
        "subname": "Quart avant de boeuf AAA (14.74$/kg)",
        "brand": "Res AAA",
        "gender": "res",
        "type": "canal",
        "unit": "kg",
        "price": 14.74,
        "discountPercent": 0,
        "stock": 6,
        "cookingMethods": [
            "Brisket, costilla, chuck y molidas"
        ],
        "notes": [
            "Ideal para briskets y ahumados",
            "Alto rendimiento de carne magra",
            "Grado AAA"
        ],
        "description": "Cuarto delantero de novillo AAA con costillar, sobrebarriga y espaldilla. Excelente relación precio-carne.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg"
        ]
    },
    {
        "id": "media-canal-aa-res-205kg",
        "slug": "media-canal-aa-res-205kg",
        "name": "Media Canal AA (Coupé en 4) (~205 kg)",
        "subname": "Demi-carcasse de boeuf AA divisée en 4 (15.17$/kg)",
        "brand": "Res AAA",
        "gender": "res",
        "type": "canal",
        "unit": "kg",
        "price": 15.17,
        "discountPercent": 0,
        "stock": 5,
        "cookingMethods": [
            "Restaurantes y carnicerías"
        ],
        "notes": [
            "Grado AA balanceado",
            "Dividido en 4 para corte fácil",
            "Gran rendimiento"
        ],
        "description": "Media res grado AA, excelente balance para negocios gastronómicos con alta rotación de carne magra.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": false,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg"
        ]
    },
    {
        "id": "caja-carne-con-hueso-11kg",
        "slug": "caja-carne-con-hueso-11kg",
        "name": "Caja de Carne con Hueso (11 kg)",
        "subname": "Boîte de viande avec os 11 kg pour ragoûts et soupes",
        "brand": "Res AAA",
        "gender": "res",
        "type": "caja",
        "unit": "caja-11kg",
        "price": 150.0,
        "discountPercent": 0,
        "stock": 12,
        "cookingMethods": [
            "Sopas sustanciosas",
            "Caldos de hueso gelatinoso",
            "Guisos lentos"
        ],
        "notes": [
            "11 kg seleccionados",
            "Huesos con médula y carne adherida",
            "Precio por caja"
        ],
        "description": "Caja de 11 kg surtida con cortes de carne pegada al hueso, tuétano y ossobuco para sancochos memorables y fondos de cocina ricos en colágeno.",
        "palette": {
            "from": "#660F12",
            "to": "#141414",
            "accent": "#8B0000"
        },
        "isFeatured": true,
        "isNew": false,
        "images": [
            "https://res.cloudinary.com/v3zsy3cm/image/upload/v1793739783/canres-viandes/meat_steak_raw.jpg"
        ]
    }
];
