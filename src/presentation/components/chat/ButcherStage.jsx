import { useState, useEffect, useRef, useMemo } from 'react';
import {
    HiSpeakerWave,
    HiSpeakerXMark,
    HiChevronUp,
    HiChevronDown,
    HiSparkles,
    HiMicrophone,
    HiStop,
} from 'react-icons/hi2';
import { FaFire } from 'react-icons/fa6';

export default function ButcherStage({
    status = 'idle', // 'idle' | 'thinking' | 'speaking'
    activeAction = 'welcome', // 'idle' | 'welcome' | 'meat' | 'sausages' | 'thinking'
    onActionChange,
    isSpeaking = false,
    onToggleSpeech,
    onSpeakCustom,
    canSpeak = false,
    onQuickPrompt,
    isListening = false,
    onToggleListen,
    userTranscript = '',
    isCollapsed = false,
    onToggleCollapse,
    t,
    language = 'fr',
    onLanguageChange,
}) {
    const [thinkingIndex, setThinkingIndex] = useState(0);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const stageRef = useRef(null);

    const translate = (key, fallback) => (t ? t(key) : fallback);

    const thinkingMessages = useMemo(
        () => [
            translate('chatbot.thinking_msg_1', '🔪 Cortando y examinando el marmoleo de res AAA...'),
            translate('chatbot.thinking_msg_2', '🥩 Afilando el cuchillo para tu recomendación...'),
            translate('chatbot.thinking_msg_3', '🔥 Calculando tiempo y técnica de cocción a la brasa...'),
            translate('chatbot.thinking_msg_4', '🇨🇦 Seleccionando cortes de Québec & Colombia...'),
        ],
        [t]
    );

    const butcherQuotes = useMemo(
        () => [
            translate(
                'chatbot.quote_1',
                '¡Bienvenido a CANRES Viandes! Como maestro carnicero, mi pasión es ofrecerte la mejor carne madurada y charcutería artesanal. ¿Qué corte cocinamos hoy?'
            ),
            translate(
                'chatbot.quote_2',
                'Un buen Ribeye AAA debe sellarse a fuego vivo 3 minutos por lado y dejarse reposar para que conserve todos sus jugos.'
            ),
            translate(
                'chatbot.quote_3',
                'Nuestras salchichas artesanales son 100% de autor, embutidas a mano en tripa natural, sin gluten ni conservantes.'
            ),
        ],
        [t]
    );

    // Rotación suave de mensajes durante la preparación / pensamiento
    useEffect(() => {
        if (status !== 'thinking') return;
        const interval = setInterval(() => {
            setThinkingIndex((prev) => (prev + 1) % thinkingMessages.length);
        }, 2200);
        return () => clearInterval(interval);
    }, [status, thinkingMessages.length]);

    const isThinking = status === 'thinking';

    // Ciclo autónomo automático de poses ("lo hace solo")
    useEffect(() => {
        if (isThinking || isListening || isCollapsed) return;

        // Cada 6.5 segundos alterna de pose y movimiento automáticamente de forma autónoma
        const autoCycleInterval = setInterval(() => {
            const actionCycle = ['welcome', 'meat', 'sausages', 'idle'];
            const nextIdx = (actionCycle.indexOf(activeAction) + 1) % actionCycle.length;
            onActionChange?.(actionCycle[nextIdx]);
        }, 6500);

        return () => clearInterval(autoCycleInterval);
    }, [activeAction, isThinking, isListening, isCollapsed, onActionChange]);

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
            return;
        }

        // Rotación interactiva de poses y temas: welcome -> meat -> sausages -> idle
        const actionCycle = ['meat', 'sausages', 'welcome', 'idle'];
        const nextIdx = (actionCycle.indexOf(activeAction) + 1) % actionCycle.length;
        const nextAction = actionCycle[nextIdx];
        onActionChange?.(nextAction);

        if (onSpeakCustom) {
            if (nextAction === 'meat') {
                onSpeakCustom(translate('chatbot.quote_2', butcherQuotes[1]));
            } else if (nextAction === 'sausages') {
                onSpeakCustom(translate('chatbot.quote_3', butcherQuotes[2]));
            } else {
                onSpeakCustom(translate('chatbot.quote_1', butcherQuotes[0]));
            }
        }
    };

    // Fuente animada WebP según acción o tema activo (poses basadas en el guión artesanal)
    const imageSrc = useMemo(() => {
        if (isThinking) {
            return '/images/butcher/butcher-thinking.webp';
        }
        if (isSpeaking && activeAction === 'idle') {
            return '/images/butcher/butcher-talking.webp';
        }
        if (activeAction === 'sausages') {
            return '/images/butcher/butcher-sausages.webp';
        }
        if (activeAction === 'meat' || activeAction === 'ok') {
            return '/images/butcher/butcher-ok.webp';
        }
        if (activeAction === 'welcome') {
            return '/images/butcher/butcher-welcome.webp';
        }
        return '/images/butcher/butcher-idle.webp';
    }, [isThinking, isSpeaking, activeAction]);

    const stageDialogTitle = useMemo(() => {
        if (isListening) return translate('chatbot.stage_listening_title', '🎙️ Te estoy escuchando...');
        if (isThinking) return translate('chatbot.stage_thinking_title', 'Preparando consejo gastronómico...');
        if (isSpeaking) return translate('chatbot.stage_speaking_title', 'Explicando recomendación en vivo...');
        if (activeAction === 'meat' || activeAction === 'ok') return translate('chatbot.stage_meat_title', '🥩 CORTE NOBLE AAA Y PUNTO DE ASADO');
        if (activeAction === 'sausages') return translate('chatbot.stage_sausages_title', '🌭 CHORIZOS ARTESANALES DE LA CASA');
        if (activeAction === 'idle') return translate('chatbot.stage_idle_title', '🔪 MAESTRO CARNICERO A TU SERVICIO');
        return translate('chatbot.stage_welcome_title', '¡HOLA! TE DOY LA BIENVENIDA A MI CARNICERÍA');
    }, [isListening, isThinking, isSpeaking, activeAction, t]);

    const stageDialogDesc = useMemo(() => {
        if (isListening) return userTranscript || translate('chatbot.stage_listening_prompt', 'Habla ahora con tu voz... ¿Qué corte o consejo de asado necesitas?');
        if (isThinking) return thinkingMessages[thinkingIndex] || thinkingMessages[0];
        if (isSpeaking) return translate('chatbot.stage_speaking_prompt', 'Presta atención a los secretos para lograr el mejor sabor y punto de cocción de tu corte.');
        if (activeAction === 'meat' || activeAction === 'ok') return translate('chatbot.stage_meat_desc', 'Un buen Ribeye AAA debe sellarse a fuego vivo 3 minutos por lado y dejarse reposar para que conserve todos sus jugos.');
        if (activeAction === 'sausages') return translate('chatbot.stage_sausages_desc', 'Nuestros chorizos artesanales son 100% de autor, embutidos a mano en tripa natural, sin conservantes.');
        if (activeAction === 'idle') return translate('chatbot.stage_idle_desc', 'Cortes nobles, maduración artesanal y asesoría gastronómica personalizada. ¿Qué preparamos hoy?');
        return translate('chatbot.stage_welcome_desc', 'Toca el botón «Conversar» para hablarme por voz o escríbeme cualquier pregunta de carnes.');
    }, [isListening, isThinking, isSpeaking, activeAction, userTranscript, thinkingMessages, thinkingIndex, t]);

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
                            isListening
                                ? 'bg-red-500 animate-ping'
                                : isSpeaking
                                ? 'bg-gold animate-ping'
                                : isThinking
                                ? 'bg-amber-400 animate-pulse'
                                : 'bg-emerald-400 animate-pulse'
                        }`}
                    />
                    <span className="font-bold uppercase tracking-wider text-gold-light">
                        {translate('chatbot.mascot_name', 'CANRES Master Butcher')}
                    </span>
                    <span className="hidden sm:inline text-taupe-light">·</span>
                    <span className="hidden sm:inline text-cream/75 text-[9.5px]">
                        {isListening
                            ? translate('chatbot.stage_status_listening', '🎙️ Escuchando tu voz en vivo...')
                            : isThinking
                            ? translate('chatbot.stage_status_thinking', 'Cortando carne y preparando respuesta...')
                            : isSpeaking
                            ? translate('chatbot.stage_status_speaking', '🗣️ Hablando en vivo')
                            : translate('chatbot.stage_status_ready', 'Animado · Listo para conversar')}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Selector rápido de idioma para el carnicero y micrófono */}
                    {onLanguageChange && (
                        <div className="flex items-center rounded-full bg-white/10 p-0.5 text-[8.5px] font-bold border border-gold/25" role="group" aria-label="Langue du boucher">
                            {['fr', 'en', 'es'].map((l) => (
                                <button
                                    key={l}
                                    type="button"
                                    onClick={() => onLanguageChange(l)}
                                    className={`px-1.5 py-0.2 rounded-full uppercase transition ${
                                        language === l
                                            ? 'bg-gold text-ink font-extrabold shadow-xs'
                                            : 'text-cream/70 hover:text-white'
                                    }`}
                                    title={l === 'fr' ? 'Français' : l === 'en' ? 'English' : 'Español'}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Botón interactivo de micrófono para conversar por voz */}
                    {onToggleListen && (
                        <button
                            type="button"
                            onClick={onToggleListen}
                            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider transition ${
                                isListening
                                    ? 'bg-red-600 text-white animate-pulse shadow-sm shadow-red-500/50'
                                    : 'bg-gold/15 text-gold-light hover:bg-gold/25 hover:text-white border border-gold/30'
                            }`}
                            title={
                                isListening
                                    ? translate('chatbot.btn_stop_record_title', 'Detener grabación')
                                    : translate('chatbot.btn_converse_title', 'Hablarle por voz')
                            }
                        >
                            {isListening ? (
                                <>
                                    <HiStop className="h-3 w-3" />
                                    <span>{translate('chatbot.btn_stop', 'Parar')}</span>
                                </>
                            ) : (
                                <>
                                    <HiMicrophone className="h-3 w-3" />
                                    <span>{translate('chatbot.btn_converse', 'Conversar')}</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Botón interactivo de voz / locución */}
                    {canSpeak && (
                        <button
                            type="button"
                            onClick={onToggleSpeech}
                            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider transition ${
                                isSpeaking
                                    ? 'bg-gold text-ink animate-pulse shadow-sm shadow-gold/30'
                                    : 'bg-white/10 text-gold-light hover:bg-gold/20 hover:text-white'
                            }`}
                            title={
                                isSpeaking
                                    ? translate('chatbot.btn_pause_voice_title', 'Detener voz')
                                    : translate('chatbot.btn_play_voice_title', 'Escuchar respuesta con voz')
                            }
                        >
                            {isSpeaking ? (
                                <>
                                    <HiSpeakerXMark className="h-3 w-3" />
                                    <span>{translate('chatbot.btn_pause', 'Pausar')}</span>
                                </>
                            ) : (
                                <>
                                    <HiSpeakerWave className="h-3 w-3" />
                                    <span>{translate('chatbot.btn_voice', 'Voz')}</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Botón para minimizar / expandir */}
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="rounded p-1 text-cream/60 transition hover:bg-white/10 hover:text-white"
                        title={
                            isCollapsed
                                ? translate('chatbot.toggle_mascot_show', 'Mostrar carnicero')
                                : translate('chatbot.toggle_mascot_hide', 'Minimizar carnicero')
                        }
                        aria-label={
                            isCollapsed
                                ? translate('chatbot.toggle_mascot_show', 'Mostrar carnicero')
                                : translate('chatbot.toggle_mascot_hide', 'Minimizar carnicero')
                        }
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
                                isListening
                                    ? 'border-red-500 shadow-xl shadow-red-500/30 ring-2 ring-red-400/50'
                                    : isSpeaking
                                    ? 'border-gold shadow-xl shadow-gold/30 animate-gold-ring ring-2 ring-gold/40'
                                    : isThinking
                                    ? 'border-amber-400 shadow-lg shadow-amber-500/25'
                                    : 'border-gold/40 shadow-md hover:border-gold hover:shadow-gold/20'
                            }`}
                            title={translate('chatbot.mascot_click_hint', 'Haz clic para interactuar o escuchar un consejo')}
                        >
                            {/* Imagen animada WebP */}
                            <img
                                key={imageSrc}
                                src={imageSrc}
                                alt={translate('chatbot.mascot_alt', 'Maestro Carnicero interactivo y animado')}
                                className="h-full w-full object-cover object-[50%_18%] transition-transform duration-300 group-hover:scale-105"
                            />

                            {/* Badge flotante de estado en el escenario */}
                            {isListening ? (
                                <div className="absolute top-1 left-1 flex items-center gap-1 rounded bg-red-900/85 px-1.5 py-0.5 text-[8.5px] font-bold text-white backdrop-blur-xs border border-red-400 animate-pulse">
                                    <span>🎙️</span>
                                    <span>{translate('chatbot.badge_listening', 'Oyendo...')}</span>
                                </div>
                            ) : isThinking ? (
                                <div className="absolute top-1 left-1 flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-[8.5px] font-bold text-amber-300 backdrop-blur-xs border border-amber-400/40 animate-pulse">
                                    <span>🔪</span>
                                    <span>{translate('chatbot.badge_slicing', 'Rebanando...')}</span>
                                </div>
                            ) : (
                                <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-1.5 py-0.5 rounded text-[8px] text-gold-light border border-gold/30">
                                    {translate('chatbot.badge_tap', '💬 Toca aquí')}
                                </div>
                            )}
                        </div>

                        {/* Diálogo interactivo del carnicero */}
                        <div className="flex-1 min-w-0">
                            <div className="relative rounded-2xl border border-gold/35 bg-[#161311]/95 p-3 shadow-md backdrop-blur-xs transition-colors duration-300">
                                <p className="text-[10.5px] font-bold uppercase tracking-wider text-gold flex items-center gap-1">
                                    <HiSparkles className="h-3 w-3 text-gold-light" />
                                    {stageDialogTitle}
                                </p>
                                <p className="mt-1 text-[11.5px] leading-snug text-cream/95 font-medium line-clamp-3">
                                    {stageDialogDesc}
                                </p>
                            </div>

                            {/* Botones de sugerencias temáticas con cambio dinámico de pose */}
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onActionChange?.('meat');
                                        onQuickPrompt?.(
                                            translate(
                                                'chatbot.stage_chip_grill_query',
                                                '¿Cuál es el mejor corte para asar en la parrilla y su punto perfecto?'
                                            )
                                        );
                                    }}
                                    className="inline-flex items-center gap-1 rounded-md border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-cream hover:border-gold hover:bg-gold/25 transition active:scale-95"
                                >
                                    <FaFire className="h-2.5 w-2.5 text-gold" />
                                    <span>{translate('chatbot.stage_chip_grill', 'Mejor corte para asar')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onActionChange?.('sausages');
                                        onQuickPrompt?.(
                                            translate(
                                                'chatbot.stage_chip_sausage_query',
                                                '¿Qué variedades de chorizos artesanales tienen disponibles?'
                                            )
                                        );
                                    }}
                                    className="inline-flex items-center gap-1 rounded-md border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-cream hover:border-gold hover:bg-gold/25 transition active:scale-95"
                                >
                                    <span>🌭</span>
                                    <span>{translate('chatbot.stage_chip_sausage', 'Chorizos de la casa')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
