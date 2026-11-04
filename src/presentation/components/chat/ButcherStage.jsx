import { useState, useEffect, useRef } from 'react';
import {
    HiSpeakerWave,
    HiSpeakerXMark,
    HiChevronUp,
    HiChevronDown,
    HiSparkles,
} from 'react-icons/hi2';
import { FaFire } from 'react-icons/fa6';

const THINKING_MESSAGES = [
    '🔪 Cortando y examinando el marmoleo de res AAA...',
    '🥩 Afilando el cuchillo para tu recomendación...',
    '🔥 Calculando tiempo y técnica de cocción a la brasa...',
    '🇨🇦 Seleccionando cortes de Québec & Colombia...',
];

const BUTCHER_QUOTES = [
    '¡Bienvenido a CANRES Viandes! Como maestro carnicero, mi pasión es ofrecerte la mejor carne madurada y charcutería artesanal. ¿Qué corte cocinamos hoy?',
    'Un buen Ribeye AAA debe sellarse a fuego vivo 3 minutos por lado y dejarse reposar para que conserve todos sus jugos.',
    'Nuestras salchichas artesanales son 100% de autor, embutidas a mano en tripa natural, sin gluten ni conservantes.',
];

export default function ButcherStage({
    status = 'idle', // 'idle' | 'thinking' | 'speaking'
    isSpeaking = false,
    onToggleSpeech,
    onSpeakCustom,
    canSpeak = false,
    onQuickPrompt,
    isCollapsed = false,
    onToggleCollapse,
    t,
}) {
    const [thinkingIndex, setThinkingIndex] = useState(0);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const stageRef = useRef(null);

    // Rotación suave de mensajes durante la preparación / pensamiento
    useEffect(() => {
        if (status !== 'thinking') return;
        const interval = setInterval(() => {
            setThinkingIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
        }, 2200);
        return () => clearInterval(interval);
    }, [status]);

    const isThinking = status === 'thinking';

    // Efecto 3D de seguimiento de cursor interactivo
    const handleMouseMove = (e) => {
        if (!stageRef.current) return;
        const rect = stageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: x * 12, y: -y * 12 });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
    };

    const handleMascotClick = () => {
        if (isSpeaking) {
            onToggleSpeech?.();
        } else if (onSpeakCustom) {
            const randomQuote = BUTCHER_QUOTES[Math.floor(Math.random() * BUTCHER_QUOTES.length)];
            onSpeakCustom(randomQuote);
        } else {
            onToggleSpeech?.();
        }
    };

    // Fuente animada según estado activo
    const imageSrc = isThinking
        ? '/images/butcher/butcher-thinking.webp'
        : isSpeaking
        ? '/images/butcher/butcher-talking.webp'
        : '/images/butcher/butcher-idle.webp';

    return (
        <div
            ref={stageRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative border-b border-gold/30 bg-gradient-to-b from-[#1E1916] via-[#241F1C] to-[#171513] text-cream-light shadow-inner transition-all duration-300 select-none"
        >
            {/* Barra superior de estado */}
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-black/35 border-b border-gold/15 text-[10px]">
                <div className="flex items-center gap-1.5">
                    <span
                        className={`inline-block h-2 w-2 rounded-full ${
                            isSpeaking
                                ? 'bg-gold animate-ping'
                                : isThinking
                                ? 'bg-amber-400 animate-pulse'
                                : 'bg-emerald-400 animate-pulse'
                        }`}
                    />
                    <span className="font-bold uppercase tracking-wider text-gold-light">
                        {t ? t('chatbot.mascot_name') : 'Maestro Carnicero CANRES'}
                    </span>
                    <span className="hidden sm:inline text-taupe-light">·</span>
                    <span className="hidden sm:inline text-cream/75 text-[9.5px]">
                        {isThinking
                            ? 'Cortando carne y preparando respuesta...'
                            : isSpeaking
                            ? '🗣️ Hablando en vivo'
                            : 'Animado · Listo para asesorarte'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Botón interactivo de voz / locución */}
                    {canSpeak && (
                        <button
                            type="button"
                            onClick={onToggleSpeech}
                            className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider transition ${
                                isSpeaking
                                    ? 'bg-gold text-ink animate-pulse shadow-sm shadow-gold/30'
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
                                    <span>Escuchar voz</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Botón para minimizar / expandir */}
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="rounded p-1 text-cream/60 transition hover:bg-white/10 hover:text-white"
                        title={isCollapsed ? 'Mostrar carnicero animado' : 'Minimizar carnicero'}
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
                <div className="p-3 sm:p-3.5">
                    <div className="flex items-center gap-3.5">
                        {/* Ventana del Maestro Carnicero Animado con seguimiento 3D */}
                        <div
                            onClick={handleMascotClick}
                            style={{
                                transform: `perspective(600px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                                transition: 'transform 0.15s ease-out',
                            }}
                            className={`group relative h-28 w-24 sm:h-32 sm:w-28 shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                                isSpeaking
                                    ? 'border-gold shadow-xl shadow-gold/30 animate-gold-ring ring-2 ring-gold/40'
                                    : isThinking
                                    ? 'border-amber-400 shadow-lg shadow-amber-500/25'
                                    : 'border-gold/40 shadow-md hover:border-gold hover:shadow-gold/20'
                            }`}
                            title="Haz clic para interactuar o escuchar un consejo"
                        >
                            {/* Imagen animada WebP */}
                            <img
                                key={imageSrc}
                                src={imageSrc}
                                alt="Maestro Carnicero interactivo y animado"
                                className="h-full w-full object-cover object-[50%_18%] transition-transform duration-300 group-hover:scale-105"
                            />

                            {/* Overlay de ecualizador de voz interactivo */}
                            {isSpeaking && (
                                <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-1 bg-gradient-to-t from-black/85 via-black/50 to-transparent pb-1.5 pt-4">
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
                            {isThinking ? (
                                <div className="absolute top-1 left-1 flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-[8.5px] font-bold text-amber-300 backdrop-blur-xs border border-amber-400/40 animate-pulse">
                                    <span>🔪</span>
                                    <span>Rebanando...</span>
                                </div>
                            ) : (
                                <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-1.5 py-0.5 rounded text-[8px] text-gold-light border border-gold/30">
                                    💬 Toca aquí
                                </div>
                            )}
                        </div>

                        {/* Diálogo interactivo del carnicero */}
                        <div className="flex-1 min-w-0">
                            <div className="relative rounded-2xl border border-gold/35 bg-[#161311]/95 p-3 shadow-md backdrop-blur-xs">
                                <p className="text-[10.5px] font-bold uppercase tracking-wider text-gold flex items-center gap-1">
                                    <HiSparkles className="h-3 w-3 text-gold-light" />
                                    {isThinking
                                        ? 'Preparando consejo gastronómico...'
                                        : isSpeaking
                                        ? 'Explicando recomendación en vivo...'
                                        : '¡Hola! Te doy la bienvenida a mi carnicería'}
                                </p>
                                <p className="mt-1 text-[11.5px] leading-snug text-cream/95 font-medium line-clamp-3">
                                    {isThinking
                                        ? THINKING_MESSAGES[thinkingIndex]
                                        : isSpeaking
                                        ? 'Presta atención a los secretos para lograr el mejor sabor y punto de cocción de tu corte.'
                                        : 'Toca al carnicero o hazme cualquier pregunta sobre cortes nobles, maduración y salchichas de autor.'}
                                </p>
                            </div>

                            {/* Botones de sugerencias temáticas */}
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        onQuickPrompt?.(
                                            '¿Cuál es el mejor corte para asar en la parrilla y su punto perfecto?'
                                        )
                                    }
                                    className="inline-flex items-center gap-1 rounded-md border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-cream hover:border-gold hover:bg-gold/25 transition active:scale-95"
                                >
                                    <FaFire className="h-2.5 w-2.5 text-gold" />
                                    <span>Mejor corte para asar</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onQuickPrompt?.(
                                            '¿Qué variedades de chorizos artesanales tienen disponibles?'
                                        )
                                    }
                                    className="inline-flex items-center gap-1 rounded-md border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-cream hover:border-gold hover:bg-gold/25 transition active:scale-95"
                                >
                                    <span>🌭</span>
                                    <span>Chorizos de la casa</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
