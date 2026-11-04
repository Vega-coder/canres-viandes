import { useMemo } from 'react';
import { useCases } from '@/infrastructure/container.js';
import { useAsync } from '@/presentation/hooks/useAsync.js';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
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
    const { t } = useLanguage();
    const { data } = useAsync(() => useCases.getHomeShowcase(), []);

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
                eyebrow={t('homeSections.beef_eyebrow')}
                badgeText={t('homeSections.beef_badge')}
                title={t('homeSections.beef_title')}
                description={t('homeSections.beef_desc')}
                products={resProducts}
                categorySlug="res"
                categoryLabel={t('homeSections.beef_label')}
                totalCount={resProducts.length}
                bgClass="bg-cream/25"
            />

            {/* SECCIÓN DEDICADA: CERDO SELECTO DE GRANJA */}
            <MeatCategorySection
                id="seccion-cerdo"
                icon="🥓"
                eyebrow={t('homeSections.pork_eyebrow')}
                badgeText={t('homeSections.pork_badge')}
                title={t('homeSections.pork_title')}
                description={t('homeSections.pork_desc')}
                products={cerdoProducts}
                categorySlug="cerdo"
                categoryLabel={t('homeSections.pork_label')}
                totalCount={cerdoProducts.length}
                bgClass="bg-white"
            />

            {/* SECCIÓN DEDICADA: POLLO FRESCO & GRANJA */}
            <MeatCategorySection
                id="seccion-pollo"
                icon="🍗"
                eyebrow={t('homeSections.poultry_eyebrow')}
                badgeText={t('homeSections.poultry_badge')}
                title={t('homeSections.poultry_title')}
                description={t('homeSections.poultry_desc')}
                products={polloProducts}
                categorySlug="pollo"
                categoryLabel={t('homeSections.poultry_label')}
                totalCount={polloProducts.length}
                bgClass="bg-cream/25"
            />

            {/* SECCIÓN DEDICADA: CHIVO & CORDERO */}
            <MeatCategorySection
                id="seccion-chivo"
                icon="🐐"
                eyebrow={t('homeSections.goat_eyebrow')}
                badgeText={t('homeSections.goat_badge')}
                title={t('homeSections.goat_title')}
                description={t('homeSections.goat_desc')}
                products={chivoProducts}
                categorySlug="chivo"
                categoryLabel={t('homeSections.goat_label')}
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
