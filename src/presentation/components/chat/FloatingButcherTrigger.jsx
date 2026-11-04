import { useState, useEffect } from 'react';
import { HiXMark } from 'react-icons/hi2';
import ButcherAvatar from './ButcherAvatar.jsx';

export default function FloatingButcherTrigger({
    onClick,
    t,
}) {
    const [showBalloon, setShowBalloon] = useState(false);

    // Muestra el globo de diálogo flotante después de 2.5 segundos para enganchar al usuario
    useEffect(() => {
        const timer = setTimeout(() => {
            // Verificar si el usuario ya lo cerró en esta sesión
            const dismissed = sessionStorage.getItem('canres_butcher_balloon_dismissed');
            if (!dismissed) {
                setShowBalloon(true);
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    const handleDismissBalloon = (e) => {
        e.stopPropagation();
        setShowBalloon(false);
        try {
            sessionStorage.setItem('canres_butcher_balloon_dismissed', 'true');
        } catch {
            // ignore
        }
    };

    const bubbleText = t
        ? t('chatbot.floating_prompt')
        : '¡Hola! ¿Buscando el corte perfecto para tu asado? ¡Pregúntame! 🥩';

    return (
        <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-2">
            {/* Globo de diálogo flotante con invitación del carnicero */}
            {showBalloon && (
                <div
                    onClick={onClick}
                    className="relative max-w-[270px] cursor-pointer rounded-2xl border border-gold/50 bg-gradient-to-br from-[#1C1815] via-[#241F1C] to-[#141211] p-3 text-cream-light shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-gold animate-fade-up group"
                >
                    <button
                        type="button"
                        onClick={handleDismissBalloon}
                        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink border border-gold/40 text-cream/70 hover:text-white hover:bg-brand-wine transition shadow-sm"
                        title={t ? t('chatbot.btn_close') : 'Cerrar saludo'}
                        aria-label={t ? t('chatbot.btn_close') : 'Cerrar saludo'}
                    >
                        <HiXMark className="h-3 w-3" />
                    </button>

                    <div className="flex items-start gap-2">
                        <span className="text-base">👋</span>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gold">
                                {t ? t('chatbot.mascot_name') : 'Maestro Carnicero'}
                            </p>
                            <p className="mt-0.5 text-[11px] leading-snug text-cream/90 font-medium">
                                {bubbleText}
                            </p>
                            <span className="mt-1.5 inline-block text-[9.5px] font-bold text-gold-light group-hover:underline">
                                {t ? t('chatbot.open_chat_cta') : 'Abrir chat interactivo →'}
                            </span>
                        </div>
                    </div>

                    {/* Flecha inferior del globo de diálogo */}
                    <div className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 border-b border-r border-gold/50 bg-[#141211]" />
                </div>
            )}

            {/* Botón lanzador con el rostro del Maestro Carnicero */}
            <button
                type="button"
                onClick={onClick}
                className="group flex items-center gap-3 rounded-full border border-gold/50 bg-gradient-to-r from-ink via-[#241F1C] to-ink p-1.5 pr-4 text-cream-light shadow-2xl transition-all duration-300 hover:scale-105 hover:border-gold hover:shadow-gold/25 active:scale-95"
                aria-label={t ? t('chatbot.open_trigger_aria') : 'Abrir asesor virtual interactivo - Maestro Carnicero'}
            >
                {/* Avatar circular del carnicero */}
                <div className="relative">
                    <ButcherAvatar
                        status="idle"
                        size="md"
                        showStatusDot={true}
                        showEqualizer={false}
                    />
                </div>

                {/* Texto de identidad artesanal */}
                <div className="text-left hidden sm:block">
                    <div className="flex items-center gap-1.5">
                        <p className="text-[10.5px] font-bold uppercase tracking-wider text-gold-light">
                            {t ? t('chatbot.mascot_name') : 'CANRES Viandes'}
                        </p>
                        <span className="rounded bg-gold/20 px-1 py-0.2 text-[8px] font-bold uppercase text-gold">
                            IA
                        </span>
                    </div>
                    <p className="text-[11px] font-medium text-cream/80">
                        {t ? t('chatbot.subtitle') : "Boucherie Artisanale · Viandes d'Exception"}
                    </p>
                </div>
            </button>
        </div>
    );
}
