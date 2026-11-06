import { describe, it, expect } from 'vitest';
import { TRANSLATIONS, CATEGORY_TRANSLATIONS, COOKING_METHOD_TRANSLATIONS } from '@/presentation/i18n/translations.js';
import { formatMoney, formatUnit } from '@/domain/shared/money.js';

describe('Sistema de Internacionalización (i18n) Bilingüe Canadiense (FR / EN / ES)', () => {
    it('posee traducciones completas para los dos idiomas oficiales de Canadá (Français e English)', () => {
        expect(TRANSLATIONS.fr).toBeDefined();
        expect(TRANSLATIONS.en).toBeDefined();
        expect(TRANSLATIONS.es).toBeDefined();

        // Metadatos canadienses
        expect(TRANSLATIONS.fr.meta.flag).toBe('🇨🇦');
        expect(TRANSLATIONS.en.meta.flag).toBe('🇨🇦');
    });

    it('traduce correctamente la barra de navegación en Francés, Inglés y Español', () => {
        expect(TRANSLATIONS.fr.nav.home).toBe('Accueil');
        expect(TRANSLATIONS.en.nav.home).toBe('Home');
        expect(TRANSLATIONS.es.nav.home).toBe('Inicio');

        expect(TRANSLATIONS.fr.nav.shop).toBe('Boutique');
        expect(TRANSLATIONS.en.nav.shop).toBe('Shop');
        expect(TRANSLATIONS.es.nav.shop).toBe('Tienda');

        expect(TRANSLATIONS.fr.nav.beef).toBe('Boeuf AAA');
        expect(TRANSLATIONS.en.nav.beef).toBe('AAA Beef');
        expect(TRANSLATIONS.es.nav.beef).toBe('Res AAA');
    });

    it('formatea la moneda según los estándares canadienses en-CA y fr-CA', () => {
        const amount = 32.5;

        // En inglés canadiense (en-CA)
        const formattedEn = formatMoney(amount, 'en');
        expect(formattedEn).toContain('$');
        expect(formattedEn).toContain('32.50');

        // En francés canadiense (fr-CA)
        const formattedFr = formatMoney(amount, 'fr');
        expect(formattedFr).toContain('$');
        expect(formattedFr).toMatch(/32,50/);
    });

    it('formatea las unidades de venta por idioma', () => {
        expect(formatUnit('kg', 'fr')).toBe('/ kg');
        expect(formatUnit('450g', 'fr')).toBe('/ paq. (450g)');
        expect(formatUnit('caja-4kg', 'fr')).toBe('/ boîte (4 kg)');

        expect(formatUnit('450g', 'en')).toBe('/ pack (450g)');
        expect(formatUnit('caja-4kg', 'en')).toBe('/ box (4 kg)');

        expect(formatUnit('450g', 'es')).toBe('/ pqte (450g)');
        expect(formatUnit('caja-4kg', 'es')).toBe('/ caja (4 kg)');
    });

    it('traduce categorías maestras y métodos de cocción', () => {
        expect(CATEGORY_TRANSLATIONS.fr.res.label).toBe('Coupes de Boeuf (AAA)');
        expect(CATEGORY_TRANSLATIONS.en.res.label).toBe('AAA Beef Cuts');
        expect(CATEGORY_TRANSLATIONS.es.res.label).toBe('Cortes de Res (Boeuf)');

        expect(COOKING_METHOD_TRANSLATIONS.fr['Parrilla']).toBe('Gril / BBQ');
        expect(COOKING_METHOD_TRANSLATIONS.en['Parrilla']).toBe('Grill / BBQ');
        expect(COOKING_METHOD_TRANSLATIONS.fr['Sartén de hierro']).toBe('Poêle en fonte');
    });

    it('contiene las claves completas del pie de página (footer) en todos los idiomas', () => {
        ['fr', 'en', 'es'].forEach((lang) => {
            const footer = TRANSLATIONS[lang].footer;
            expect(footer.brand_name).toBe('CANRES VIANDES');
            expect(footer.tagline).toBeTruthy();
            expect(footer.pillars).toBeTruthy();
            expect(footer.mission).toBeTruthy();
        });
    });
});
