import { useMemo } from 'react';
import { useCases } from '@/infrastructure/container.js';
import { useAsync } from '@/presentation/hooks/useAsync.js';
import Hero from '@/presentation/components/home/Hero.jsx';
import LuxuryTicker from '@/presentation/components/home/LuxuryTicker.jsx';
import GenderExplore from '@/presentation/components/home/GenderExplore.jsx';
import ChorizosShowcase from '@/presentation/components/home/ChorizosShowcase.jsx';
import MeatCategorySection from '@/presentation/components/home/MeatCategorySection.jsx';
import AromaExplore from '@/presentation/components/home/AromaExplore.jsx';
import CategoryCircles from '@/presentation/components/home/CategoryCircles.jsx';
import EditorialBanners from '@/presentation/components/home/EditorialBanners.jsx';
import BrandStatement from '@/presentation/components/home/BrandStatement.jsx';
import BrandCarousel from '@/presentation/components/home/BrandCarousel.jsx';

export default function Home() {
    const { data, loading } = useAsync(() => useCases.getHomeShowcase(), []);

    const allProducts = useMemo(() => data?.allProducts ?? data?.featured ?? [], [data]);

    // Filtrar productos por sección especializada
    const chorizos = useMemo(
        () => allProducts.filter((p) => p.gender === 'chorizos' || p.gender === 'personalizados'),
        [allProducts]
    );

    const resProducts = useMemo(
        () => allProducts.filter((p) => p.gender === 'res' && p.type !== 'canal' && p.type !== 'caja'),
        [allProducts]
    );

    const cerdoProducts = useMemo(
        () => allProducts.filter((p) => p.gender === 'cerdo' && p.type !== 'canal' && p.type !== 'caja'),
        [allProducts]
    );

    const polloProducts = useMemo(
        () => allProducts.filter((p) => p.gender === 'pollo'),
        [allProducts]
    );

    const chivoProducts = useMemo(
        () => allProducts.filter((p) => p.gender === 'chivo' && p.type !== 'canal'),
        [allProducts]
    );

    return (
        <>
            <Hero cuts={data?.featured} />
            <LuxuryTicker />

            {/* Explorador visual de las 5 especialidades principales */}
            <GenderExplore />

            {/* SECCIÓN ESPECIALIZADA Y PROTAGONISTA: CHORIZOS 100% ARTESANALES */}
            <ChorizosShowcase
                chorizos={chorizos}
                customProduct={chorizos.find((p) => p.slug === 'chorizos-personalizados')}
            />

            {/* SECCIÓN DEDICADA: CORTES DE RES AAA */}
            <MeatCategorySection
                id="seccion-res"
                icon="🥩"
                eyebrow="Boeuf de Première Qualité"
                badgeText="Grado AAA & Sterling"
                title="Cortes Nobles de Res AAA"
                description="Maduración controlada, terneza garantizada y cortes gruesos para asados memorables: Ribeye, Chatas New York, Picaña AAA, Sobrebarriga y más."
                products={resProducts}
                categorySlug="res"
                categoryLabel="Res AAA"
                totalCount={resProducts.length}
                bgClass="bg-cream/25"
            />

            {/* SECCIÓN DEDICADA: CERDO SELECTO DE GRANJA */}
            <MeatCategorySection
                id="seccion-cerdo"
                icon="🥓"
                eyebrow="Porc Fermier de Québec"
                badgeText="Granja Selecta"
                title="Cerdo Selecto de Primera"
                description="Cortes jugosos y tiernos listos para tu parrilla u horno: Costillas Baby Back caramelizadas, pancetas con cuero crocante para chicharrón y hombros para pernil."
                products={cerdoProducts}
                categorySlug="cerdo"
                categoryLabel="Cerdo"
                totalCount={cerdoProducts.length}
                bgClass="bg-white"
            />

            {/* SECCIÓN DEDICADA: POLLO FRESCO & GRANJA */}
            <MeatCategorySection
                id="seccion-pollo"
                icon="🍗"
                eyebrow="Volaille Fermière"
                badgeText="Fresco del Día"
                title="Pollo Fresco de Granja & Especialidades"
                description="Pechugas frescas tiernas, alitas marinadas listas para BBQ al carbón, pollo campesino de textura firme para caldos y menudencias frescas."
                products={polloProducts}
                categorySlug="pollo"
                categoryLabel="Pollo"
                totalCount={polloProducts.length}
                bgClass="bg-cream/25"
            />

            {/* SECCIÓN DEDICADA: CHIVO & CORDERO */}
            <MeatCategorySection
                id="seccion-chivo"
                icon="🐐"
                eyebrow="Agneau & Chèvre de Pastoreo"
                badgeText="Tradición"
                title="Chivo & Cordero Selecto"
                description="Pierna tierna de cordero para asados lentos, cuarto delantero y carcasas enteras para reuniones familiares y celebraciones."
                products={chivoProducts}
                categorySlug="chivo"
                categoryLabel="Chivo & Cordero"
                totalCount={chivoProducts.length}
                bgClass="bg-white"
            />

            {/* Explorador de métodos culinarios y ocasiones */}
            <AromaExplore />

            {/* Círculos de todas las categorías */}
            <CategoryCircles />

            {/* Banners editoriales y de mayoreo */}
            <EditorialBanners />

            {/* Marcas y manifiesto de carnicería */}
            <BrandCarousel brands={data?.brands} />
            <BrandStatement />
        </>
    );
}
