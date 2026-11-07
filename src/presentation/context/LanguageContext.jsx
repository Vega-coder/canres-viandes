import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
    TRANSLATIONS,
    CATEGORY_TRANSLATIONS,
    COOKING_METHOD_TRANSLATIONS,
    NOTE_TRANSLATIONS,
} from '@/presentation/i18n/translations.js';
import {
    PRODUCT_TRANSLATIONS,
    BRAND_TRANSLATIONS,
} from '@/presentation/i18n/productTranslations.js';
import { formatMoney as rawFormatMoney, formatUnit as rawFormatUnit } from '@/domain/shared/money.js';

const STORAGE_KEY = 'canres_lang';
const SUPPORTED_LANGS = ['fr', 'en', 'es'];

const detectInitialLanguage = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && SUPPORTED_LANGS.includes(saved)) {
            return saved;
        }
        const navLang = navigator.language?.toLowerCase() || '';
        if (navLang.startsWith('fr')) return 'fr';
        if (navLang.startsWith('en')) return 'en';
        if (navLang.startsWith('es')) return 'es';
    } catch {
        // fallback
    }
    // Pour une entreprise basée au Québec/Canada, le français ou l'anglais sont officiels
    return 'fr';
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(detectInitialLanguage);

    const setLanguage = useCallback((lang) => {
        if (!SUPPORTED_LANGS.includes(lang)) return;
        setLanguageState(lang);
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch {
            // ignore
        }
        // Mise à jour de l'attribut lang du document HTML (fr-CA, en-CA, es)
        const htmlLang = lang === 'fr' ? 'fr-CA' : lang === 'en' ? 'en-CA' : 'es';
        document.documentElement.lang = htmlLang;
    }, []);

    useEffect(() => {
        const htmlLang = language === 'fr' ? 'fr-CA' : language === 'en' ? 'en-CA' : 'es';
        document.documentElement.lang = htmlLang;
    }, [language]);

    // Función de traducción t('section.key', { param: 'val' }) o t('section.key', 'Texto por defecto')
    const t = useCallback(
        (path, paramsOrFallback = {}) => {
            const fallbackStr = typeof paramsOrFallback === 'string' ? paramsOrFallback : null;
            const params = typeof paramsOrFallback === 'object' && paramsOrFallback !== null ? paramsOrFallback : {};

            const currentDict = TRANSLATIONS[language] || TRANSLATIONS.fr;
            const fallbackDict = TRANSLATIONS.en || TRANSLATIONS.es;

            const parts = path.split('.');
            let val = currentDict;
            for (const part of parts) {
                if (val && typeof val === 'object' && part in val) {
                    val = val[part];
                } else {
                    val = null;
                    break;
                }
            }

            if (!val && fallbackDict) {
                let fb = fallbackDict;
                for (const part of parts) {
                    if (fb && typeof fb === 'object' && part in fb) {
                        fb = fb[part];
                    } else {
                        fb = null;
                        break;
                    }
                }
                val = fb;
            }

            if (!val) return fallbackStr || path;

            if (typeof val === 'string' && params && typeof params === 'object') {
                return Object.entries(params).reduce((str, [k, v]) => {
                    return str.replaceAll(`{${k}}`, String(v ?? ''));
                }, val);
            }

            return val;
        },
        [language],
    );

    const formatMoney = useCallback(
        (amount) => rawFormatMoney(amount, language === 'fr' ? 'fr-CA' : 'en-CA'),
        [language],
    );

    const formatUnit = useCallback(
        (unit) => rawFormatUnit(unit, language),
        [language],
    );

    const getCategoryLabel = useCallback(
        (slug, short = false) => {
            const table = CATEGORY_TRANSLATIONS[language] || CATEGORY_TRANSLATIONS.fr;
            if (slug && table[slug]) {
                return short ? table[slug].short : table[slug].label;
            }
            return slug;
        },
        [language],
    );

    const translateCookingMethod = useCallback(
        (method) => {
            const table = COOKING_METHOD_TRANSLATIONS[language] || {};
            return table[method] || method;
        },
        [language],
    );

    const translateNote = useCallback(
        (note) => {
            const table = NOTE_TRANSLATIONS[language] || {};
            return table[note] || note;
        },
        [language],
    );

    const translateProduct = useCallback(
        (product) => {
            if (!product || typeof product !== 'object') return product;
            const pid = product.id || product.slug;
            const dict = PRODUCT_TRANSLATIONS[language] || PRODUCT_TRANSLATIONS.fr;
            const pTrans = pid && dict ? dict[pid] : null;

            const brandDict = BRAND_TRANSLATIONS[language] || {};
            const translatedBrand = (product.brand && brandDict[product.brand]) || product.brand;

            if (!pTrans) {
                return product.brand !== translatedBrand ? { ...product, brand: translatedBrand } : product;
            }

            return {
                ...product,
                name: pTrans.name || product.name,
                subname: pTrans.subname || product.subname,
                description: pTrans.description || product.description,
                brand: translatedBrand,
            };
        },
        [language],
    );

    const meta = useMemo(() => TRANSLATIONS[language]?.meta || TRANSLATIONS.fr.meta, [language]);

    const value = useMemo(
        () => ({
            language,
            lang: language,
            setLanguage,
            t,
            formatMoney,
            formatUnit,
            getCategoryLabel,
            translateCookingMethod,
            translateNote,
            translateProduct,
            meta,
            isFr: language === 'fr',
            isEn: language === 'en',
            isEs: language === 'es',
        }),
        [
            language,
            setLanguage,
            t,
            formatMoney,
            formatUnit,
            getCategoryLabel,
            translateCookingMethod,
            translateNote,
            translateProduct,
            meta,
        ],
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return ctx;
}
