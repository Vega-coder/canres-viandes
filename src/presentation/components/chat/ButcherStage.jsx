import { useState, useEffect } from 'react';
import { HiSpeakerWave, HiSpeakerXMark, HiChevronUp, HiChevronDown, HiSparkles } from 'react-icons/hi2';
import { FaFire } from 'react-icons/fa6';

const THINKING_MESSAGES = [
    '🔪 Inspeccionando el marmoleo AAA del corte...',
    '🥩 Consultando la cava de maduración artesanal...',
    '🔥 Calculando tiempo y técnica de cocción a la brasa...',
    '🇨🇦 Seleccionando los mejores cortes de Québec & Colombia...',
];

export default function ButcherStage({
    status = 'idle', // 'idle' | 'thinking' | 'speaking'
    isSpeaking = false,
    onToggleSpeech,
    canSpeak = false,
    onQuickPrompt,
    isCollapsed = false,
    onToggleCollapse,
    t,
}) {
    const [thinkingIndex, setThinkingIndex] = useState(0);

    // Rotación suave de mensajes durante la preparación / pensamiento
    useEffect(() => {
        if (status !== 'thinking') return;
        const interval = setInterval(() => {
            setThinkingIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
        }, 2200);
        return () => clearInterval(interval);
    }, [status]);

    const isThinking = status === 'thinking';

    return (
        <div className="relative border-b border-gold/30 bg-gradient-to-b from-[#1C1815] via-[#241F1C] to-[#171513] text-cream-light shadow-inner transition-all duration-300">
            {/* Barra superior de control / colapso */}
            <div className="flex items-center justify-between px-3 py-1 bg-black/30 border-b border-gold/15 text-[10px]">
                <div className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-gold animate-pulse" />
                    <span className="font-semibold uppercase tracking-wider text-gold-light">
                        {t ? t('chatbot.mascot_name') : 'Maestro Carnicero CANRES'}
                    </span>
                    <span className="hidden sm:inline text-taupe-light">·</span>
                    <span className="hidden sm:inline text-cream/70 text-[9.5px]">
                        {isThinking
                            ? 'Analizando tu consulta...'
                            : isSpeaking
                            ? 'Hablando en voz alta'
                            : 'Boucherie artisanale'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Botón rápido de locución / Text to Speech */}
                    {canSpeak && (
                        <button
                            type="button"
                            onClick={onToggleSpeech}
                            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider transition ${
                                isSpeaking
                                    ? 'bg-gold text-ink animate-pulse shadow-xs'
                                    : 'bg-white/10 text-gold-light hover:bg-gold/20 hover:text-white'
                            }`}
                            title={isSpeaking ? 'Detener voz' : 'Escuchar respuesta con voz'}
                        >
                            {isSpeaking ? (
                                <>
                                    <HiSpeakerXMark className="h-3 w-3" />
                                    <span>Pausar</span>
                                </>
                            ) : (
                                <>
                                    <HiSpeakerWave className="h-3 w-3" />
                                    <span>Voz</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Botón para minimizar / expandir el escenario */}
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="rounded p-1 text-cream/60 transition hover:bg-white/10 hover:text-white"
                        title={isCollapsed ? 'Mostrar carnicero' : 'Minimizar carnicero'}
                        aria-label={isCollapsed ? 'Mostrar carnicero' : 'Minimizar carnicero'}
                    >
                        {isCollapsed ? (
                            <HiChevronDown className="h-3.5 w-3.5" />
                        ) : (
                            <HiChevronUp className="h-3.5 w-3.5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Escenario interactivo expandido */}
            {!isCollapsed && (
                <div className="p-3">
                    <div className="flex items-center gap-3">
                        {/* Ventana visual del Maestro Carnicero en su carnicería */}
                        <div
                            className={`relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                                isSpeaking
                                    ? 'border-gold shadow-lg shadow-gold/30 animate-gold-ring'
                                    : isThinking
                                    ? 'border-amber-400 shadow-md shadow-amber-500/20'
                                    : 'border-gold/40 shadow-sm'
                            }`}
                        >
                            <img
                                src={
                                    isThinking
                                        ? '/images/butcher/butcher-thinking.jpg'
                                        : '/images/butcher/butcher-presenting.jpg'
                                }
                                alt="Maestro Carnicero interactivo"
                                className={`h-full w-full object-cover object-[50%_18%] transition-transform duration-500 ${
                                    isSpeaking
                                        ? 'scale-105 animate-mascot-talk'
                                        : isThinking
                                        ? 'scale-100 brightness-95'
                                        : 'scale-100 hover:scale-105'
                                }`}
                            />

                            {/* Overlay de ecualizador de voz interactivo */}
                            {isSpeaking && (
                                <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-1 bg-gradient-to-t from-black/80 via-black/40 to-transparent pb-1.5 pt-4">
                                    <span className="w-1 rounded-full bg-gold animate-soundwave-1" />
                                    <span className="w-1 rounded-full bg-white animate-soundwave-2" />
                                    <span className="w-1 rounded-full bg-gold animate-soundwave-3" />
                                    <span className="w-1 rounded-full bg-white animate-soundwave-4" />
                                    <span className="ml-1 text-[8.5px] font-bold text-gold uppercase tracking-wider">
                                        Hablando
                                    </span>
                                </div>
                            )}

                            {/* Badge flotante de estado en el escenario */}
                            {isThinking && (
                                <div className="absolute top-1 left-1 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[8.5px] font-bold text-amber-300 backdrop-blur-xs">
                                    <span>🔪</span>
                                    <span>Cortando...</span>
                                </div>
                            )}
                        </div>

                        {/* Globo de diálogo interactivo del carnicero */}
                        <div className="flex-1 min-w-0">
                            <div className="relative rounded-xl border border-gold/30 bg-[#161311]/90 p-2.5 shadow-sm backdrop-blur-xs">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gold flex items-center gap-1">
                                    <HiSparkles className="h-3 w-3" />
                                    {isThinking
                                        ? 'Preparando consejo gastronómico...'
                                        : isSpeaking
                                        ? 'Explicando recomendación en vivo...'
                                        : '¡Hola! Te doy la bienvenida a mi carnicería'}
                                </p>
                                <p className="mt-1 text-[11px] leading-tight text-cream/90 line-clamp-3">
                                    {isThinking
                                        ? THINKING_MESSAGES[thinkingIndex]
                                        : isSpeaking
                                        ? 'Escucha los secretos para lograr el mejor sabor y punto de cocción de tu carne.'
                                        : '¿Buscas un corte noble para la parrilla o consejos sobre nuestras salchichas artesanales? Hazme cualquier pregunta.'}
                                </p>
                            </div>

                            {/* Botones de sugerencias rápidas temáticas */}
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => onQuickPrompt?.('¿Cuál es el mejor corte para asar en la parrilla y su punto perfecto?')}
                                    className="inline-flex items-center gap-1 rounded-md border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-cream hover:border-gold hover:bg-gold/25 transition"
                                >
                                    <FaFire className="h-2.5 w-2.5 text-gold" />
                                    <span>Mejor corte para asar</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onQuickPrompt?.('¿Qué variedades de chorizos artesanales tienen disponibles?')}
                                    className="inline-flex items-center gap-1 rounded-md border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-cream hover:border-gold hover:bg-gold/25 transition"
                                >
                                    <span>🌭</span>
                                    <span>Chorizos artesanales</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
