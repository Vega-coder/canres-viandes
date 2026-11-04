import { useLanguage } from '@/presentation/context/LanguageContext.jsx';

export default function LanguageSelector({ variant = 'default', className = '' }) {
    const { language, setLanguage } = useLanguage();

    if (variant === 'mobile-drawer') {
        return (
            <div className={`space-y-2 ${className}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-taupe">
                    Langue / Language / Idioma
                </p>
                <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-cream bg-cream-paper p-1">
                    <button
                        type="button"
                        onClick={() => setLanguage('fr')}
                        className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold transition rounded-lg ${
                            language === 'fr'
                                ? 'bg-brand-wine text-white shadow-sm'
                                : 'text-ink/80 hover:bg-white hover:text-brand-wine'
                        }`}
                        aria-pressed={language === 'fr'}
                    >
                        <span>🇨🇦</span>
                        <span>Français</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setLanguage('en')}
                        className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold transition rounded-lg ${
                            language === 'en'
                                ? 'bg-brand-wine text-white shadow-sm'
                                : 'text-ink/80 hover:bg-white hover:text-brand-wine'
                        }`}
                        aria-pressed={language === 'en'}
                    >
                        <span>🇨🇦</span>
                        <span>English</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setLanguage('es')}
                        className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold transition rounded-lg ${
                            language === 'es'
                                ? 'bg-brand-wine text-white shadow-sm'
                                : 'text-ink/80 hover:bg-white hover:text-brand-wine'
                        }`}
                        aria-pressed={language === 'es'}
                    >
                        <span>🇨🇴</span>
                        <span>Español</span>
                    </button>
                </div>
            </div>
        );
    }

    if (variant === 'top-bar') {
        return (
            <div className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wider ${className}`}>
                <button
                    type="button"
                    onClick={() => setLanguage('fr')}
                    className={`px-1.5 py-0.5 rounded transition ${
                        language === 'fr' ? 'bg-white/20 text-white font-extrabold' : 'text-cream/70 hover:text-white'
                    }`}
                    title="Français (Canada)"
                >
                    FR
                </button>
                <span className="text-white/40">/</span>
                <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-1.5 py-0.5 rounded transition ${
                        language === 'en' ? 'bg-white/20 text-white font-extrabold' : 'text-cream/70 hover:text-white'
                    }`}
                    title="English (Canada)"
                >
                    EN
                </button>
                <span className="text-white/40">/</span>
                <button
                    type="button"
                    onClick={() => setLanguage('es')}
                    className={`px-1.5 py-0.5 rounded transition ${
                        language === 'es' ? 'bg-white/20 text-white font-extrabold' : 'text-cream/70 hover:text-white'
                    }`}
                    title="Español"
                >
                    ES
                </button>
            </div>
        );
    }

    // Default compact pill for main header
    return (
        <div
            className={`inline-flex items-center rounded-full border border-cream/90 bg-cream-paper p-0.5 shadow-xs ${className}`}
            role="group"
            aria-label="Sélection de la langue / Language selector"
        >
            <button
                type="button"
                onClick={() => setLanguage('fr')}
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider transition ${
                    language === 'fr'
                        ? 'bg-brand-wine text-white shadow-xs'
                        : 'text-taupe hover:text-ink'
                }`}
                title="Passer en Français (Canada)"
                aria-pressed={language === 'fr'}
            >
                FR
            </button>
            <span className="px-0.5 text-[10px] text-taupe/30">|</span>
            <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider transition ${
                    language === 'en'
                        ? 'bg-brand-wine text-white shadow-xs'
                        : 'text-taupe hover:text-ink'
                }`}
                title="Switch to English (Canada)"
                aria-pressed={language === 'en'}
            >
                EN
            </button>
            <span className="px-0.5 text-[10px] text-taupe/30">|</span>
            <button
                type="button"
                onClick={() => setLanguage('es')}
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider transition ${
                    language === 'es'
                        ? 'bg-brand-wine text-white shadow-xs'
                        : 'text-taupe hover:text-ink'
                }`}
                title="Cambiar a Español"
                aria-pressed={language === 'es'}
            >
                ES
            </button>
        </div>
    );
}
