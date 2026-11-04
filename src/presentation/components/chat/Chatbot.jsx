import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    HiPaperAirplane,
    HiXMark,
    HiArrowPath,
    HiSpeakerWave,
    HiSpeakerXMark,
    HiMicrophone,
    HiStop,
} from 'react-icons/hi2';
import { FaWhatsapp, FaCrown } from 'react-icons/fa6';
import { useCases, STORE_WHATSAPP } from '@/infrastructure/container.js';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import ChatMarkdown from './ChatMarkdown.jsx';
import ButcherAvatar from './ButcherAvatar.jsx';
import ButcherStage from './ButcherStage.jsx';
import FloatingButcherTrigger from './FloatingButcherTrigger.jsx';
import { useSpeech } from './useSpeech.js';
import { useSpeechRecognition } from './useSpeechRecognition.js';

const STORAGE_KEY = 'canres_chatbot_history_v2';

export default function Chatbot() {
    const { t, language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [isStageCollapsed, setIsStageCollapsed] = useState(false);

    // Sistema interactivo de Text-to-Speech (voz saliente del carnicero)
    const { isSpeaking, speakingId, speak, stop } = useSpeech(language);

    // Sistema interactivo de Speech-to-Text (micrófono / voz entrante del cliente)
    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        isSupported: isMicSupported,
    } = useSpeechRecognition(language);

    const initialWelcome = useMemo(
        () => ({
            role: 'assistant',
            content: t('chatbot.welcome'),
            time: 'Maintenant',
        }),
        [t],
    );

    const suggestions = useMemo(
        () => [
            { label: t('chatbot.sug1_label'), query: t('chatbot.sug1_query') },
            { label: t('chatbot.sug2_label'), query: t('chatbot.sug2_query') },
            { label: t('chatbot.sug3_label'), query: t('chatbot.sug3_query') },
            { label: t('chatbot.sug4_label'), query: t('chatbot.sug4_query') },
            { label: t('chatbot.sug5_label'), query: t('chatbot.sug5_query') },
        ],
        [t],
    );

    const [messages, setMessages] = useState(() => {
        try {
            const saved = sessionStorage.getItem(`${STORAGE_KEY}_${language}`);
            return saved ? JSON.parse(saved) : [initialWelcome];
        } catch {
            return [initialWelcome];
        }
    });

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Cargar historial correspondiente a cada idioma aislado al cambiar de idioma
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(`${STORAGE_KEY}_${language}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                    return;
                }
            }
            setMessages([initialWelcome]);
        } catch {
            setMessages([initialWelcome]);
        }
    }, [language, initialWelcome]);

    // Guardar en sessionStorage al cambiar mensajes
    useEffect(() => {
        try {
            if (messages.length > 0) {
                sessionStorage.setItem(`${STORAGE_KEY}_${language}`, JSON.stringify(messages));
            }
        } catch {
            // ignore
        }
    }, [messages, language]);

    // Auto-scroll al final del chat
    const scrollToBottom = useCallback((behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom('auto');
            setTimeout(() => inputRef.current?.focus(), 150);
        } else {
            // Detener voz y micrófono si se cierra el chat
            stop();
            stopListening();
        }
    }, [isOpen, messages, loading, scrollToBottom, stop, stopListening]);

    // Estado visual activo del Maestro Carnicero
    const activeMascotStatus = useMemo(() => {
        if (loading) return 'thinking';
        if (isSpeaking) return 'speaking';
        return 'idle';
    }, [loading, isSpeaking]);

    // Obtener el último mensaje del asistente para el botón de reproducción del escenario
    const latestAssistantMessage = useMemo(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'assistant') {
                return { content: messages[i].content, index: i };
            }
        }
        return null;
    }, [messages]);

    const handleSend = async (textToSend, autoSpeakResponse = false) => {
        const query = (textToSend || input).trim();
        if (!query || loading) return;

        // Detener voz y micrófono previos si estaban activos
        stop();
        stopListening();
        setInput('');

        const userMsg = {
            role: 'user',
            content: query,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setLoading(true);

        try {
            const apiMessages = newHistory.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const response = await useCases.sendChatMessage(apiMessages, language);

            const botMsg = {
                role: 'assistant',
                content: response,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, botMsg]);

            // Si el mensaje se envió mediante audio/voz, el carnicero responde hablando
            if (autoSpeakResponse) {
                setTimeout(() => {
                    speak(response, newHistory.length);
                }, 200);
            }
        } catch (error) {
            console.error('[Chatbot Error]:', error);
            const errorMsg = {
                role: 'assistant',
                content:
                    t('chatbot.error_connection') ||
                    'Disculpas, ocurrió una interrupción de conexión. Por favor reintenta o escríbenos a WhatsApp.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    // Alternar grabación por micrófono para hablar con el carnicero
    const handleToggleMic = () => {
        if (isListening) {
            stopListening();
            const text = (transcript || input).trim();
            if (text) {
                handleSend(text, true);
            }
        } else {
            stop(); // Pausar locución si el carnicero estaba hablando
            startListening((finalText) => {
                if (finalText && finalText.trim()) {
                    handleSend(finalText.trim(), true);
                }
            });
        }
    };

    const handleClear = () => {
        stop();
        stopListening();
        const resetMessages = [initialWelcome];
        setMessages(resetMessages);
        try {
            sessionStorage.removeItem(`${STORAGE_KEY}_${language}`);
        } catch {
            // ignore
        }
    };

    const handleSuggestionClick = (query) => {
        handleSend(query);
    };

    const handleToggleSpeech = (content, id) => {
        speak(content, id);
    };

    const handleToggleLatestSpeech = () => {
        if (!latestAssistantMessage) return;
        speak(latestAssistantMessage.content, latestAssistantMessage.index);
    };

    return (
        <>
            {/* Botón flotante interactivo para abrir el Chatbot con el rostro del Maestro Carnicero */}
            {!isOpen && (
                <FloatingButcherTrigger
                    onClick={() => setIsOpen(true)}
                    t={t}
                />
            )}

            {/* Ventana Modal / Drawer del Chatbot Interactivo */}
            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={t('chatbot.title') || 'CANRES Master Butcher'}
                    className="fixed inset-x-3 bottom-3 top-20 z-50 flex flex-col overflow-hidden rounded-2xl border border-gold/40 bg-cream-light shadow-2xl backdrop-blur-md transition-all duration-300 sm:inset-auto sm:bottom-5 sm:left-5 sm:h-[630px] sm:w-[420px] sm:max-h-[88vh]"
                >
                    {/* Encabezado con Identidad del Maestro Carnicero */}
                    <header className="relative flex items-center justify-between border-b border-gold/25 bg-gradient-to-r from-[#171513] via-[#24211D] to-[#171513] px-3.5 py-2.5 text-cream-light shadow-sm">
                        <div className="flex items-center gap-2.5">
                            {/* Avatar del Maestro Carnicero */}
                            <ButcherAvatar
                                status={activeMascotStatus}
                                size="sm"
                                showStatusDot={true}
                                showEqualizer={false}
                                onClick={handleToggleLatestSpeech}
                                className="cursor-pointer"
                            />

                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="font-display text-xs font-bold uppercase tracking-wider text-white">
                                        CANRES Viandes
                                    </h3>
                                    <span className="rounded-full bg-gold/25 px-1.5 py-0.2 text-[8.5px] font-bold tracking-wider text-gold-light uppercase border border-gold/30">
                                        {t('chatbot.mascot_badge') || 'IA Boucher'}
                                    </span>
                                </div>
                                <p className="text-[10px] text-cream/70 flex items-center gap-1">
                                    {isListening ? (
                                        <span className="text-red-400 font-semibold animate-pulse">
                                            🎙️ {t('chatbot.mic_listening')}
                                        </span>
                                    ) : loading ? (
                                        <span className="text-amber-300 font-semibold">
                                            🔪 {t('chatbot.status_thinking')}
                                        </span>
                                    ) : isSpeaking ? (
                                        <span className="text-gold-light font-semibold animate-pulse">
                                            🗣️ {t('chatbot.status_speaking')}
                                        </span>
                                    ) : (
                                        <span>🟢 {t('chatbot.status_online')}</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Botones de acción del encabezado */}
                        <div className="flex items-center gap-1">
                            {/* Toggle rápido de micrófono / conversar */}
                            {isMicSupported && (
                                <button
                                    type="button"
                                    onClick={handleToggleMic}
                                    className={`rounded-lg p-1.5 transition ${
                                        isListening
                                            ? 'bg-red-600 text-white animate-pulse'
                                            : 'text-cream/70 hover:bg-white/10 hover:text-white'
                                    }`}
                                    title={
                                        isListening
                                            ? t('chatbot.btn_stop_record_title') || 'Detener micrófono'
                                            : t('chatbot.conversation_mode_btn') || 'Conversar por voz'
                                    }
                                    aria-label={t('chatbot.conversation_mode_btn') || 'Conversar por voz'}
                                >
                                    {isListening ? (
                                        <HiStop className="h-4 w-4" />
                                    ) : (
                                        <HiMicrophone className="h-4 w-4" />
                                    )}
                                </button>
                            )}

                            {/* Toggle rápido de locución */}
                            {latestAssistantMessage && (
                                <button
                                    type="button"
                                    onClick={handleToggleLatestSpeech}
                                    className={`rounded-lg p-1.5 transition ${
                                        isSpeaking
                                            ? 'bg-gold text-ink animate-pulse'
                                            : 'text-cream/70 hover:bg-white/10 hover:text-white'
                                    }`}
                                    title={
                                        isSpeaking
                                            ? t('chatbot.speech_stop') || 'Detener voz'
                                            : t('chatbot.speech_listen') || 'Escuchar respuesta'
                                    }
                                    aria-label={
                                        isSpeaking
                                            ? t('chatbot.speech_stop') || 'Detener voz'
                                            : t('chatbot.speech_listen') || 'Escuchar respuesta'
                                    }
                                >
                                    {isSpeaking ? (
                                        <HiSpeakerXMark className="h-4 w-4" />
                                    ) : (
                                        <HiSpeakerWave className="h-4 w-4" />
                                    )}
                                </button>
                            )}

                            {/* Reiniciar conversación */}
                            <button
                                type="button"
                                onClick={handleClear}
                                className="rounded-lg p-1.5 text-cream/70 transition hover:bg-white/10 hover:text-white"
                                title={t('chatbot.btn_reset') || 'Réinitialiser'}
                                aria-label={t('chatbot.btn_reset') || 'Réinitialiser'}
                            >
                                <HiArrowPath className="h-4 w-4" />
                            </button>

                            {/* Cerrar modal */}
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg p-1.5 text-cream/70 transition hover:bg-white/10 hover:text-white"
                                title={t('chatbot.btn_close') || 'Fermer'}
                                aria-label={t('chatbot.btn_close') || 'Fermer'}
                            >
                                <HiXMark className="h-4.5 w-4.5" />
                            </button>
                        </div>
                    </header>

                    {/* Escenario interactivo del Maestro Carnicero en su taller */}
                    <ButcherStage
                        status={activeMascotStatus}
                        isSpeaking={isSpeaking}
                        onToggleSpeech={handleToggleLatestSpeech}
                        onSpeakCustom={(text) => speak(text, -1)}
                        canSpeak={Boolean(latestAssistantMessage)}
                        onQuickPrompt={handleSend}
                        isListening={isListening}
                        onToggleListen={isMicSupported ? handleToggleMic : null}
                        userTranscript={transcript}
                        isCollapsed={isStageCollapsed}
                        onToggleCollapse={() => setIsStageCollapsed((prev) => !prev)}
                        t={t}
                        language={language}
                        onLanguageChange={setLanguage}
                    />

                    {/* Área de Mensajes */}
                    <div className="flex-1 space-y-3.5 overflow-y-auto p-3.5 scroll-smooth">
                        {messages.map((msg, idx) => {
                            const isUser = msg.role === 'user';
                            const isThisSpeaking = isSpeaking && speakingId === idx;

                            return (
                                <div
                                    key={idx}
                                    className={`flex items-start gap-2 ${
                                        isUser ? 'flex-row-reverse' : 'flex-row'
                                    }`}
                                >
                                    {/* Avatar del Carnicero junto al mensaje del asistente */}
                                    {!isUser && (
                                        <ButcherAvatar
                                            status="idle"
                                            size="xs"
                                            showStatusDot={false}
                                            showEqualizer={false}
                                            className="mt-0.5"
                                        />
                                    )}

                                    <div
                                        className={`flex flex-col ${
                                            isUser ? 'items-end' : 'items-start'
                                        } max-w-[85%]`}
                                    >
                                        <div
                                            className={`rounded-2xl px-3.5 py-2.5 shadow-xs transition-colors ${
                                                isUser
                                                    ? 'rounded-tr-none bg-ink text-cream-light'
                                                    : 'rounded-tl-none border border-taupe/20 bg-white text-ink'
                                            } ${isThisSpeaking ? 'ring-2 ring-gold/60' : ''}`}
                                        >
                                            <ChatMarkdown
                                                content={msg.content}
                                                onLinkClick={() => {
                                                    setIsOpen(false);
                                                    window.scrollTo({ top: 0, behavior: 'instant' });
                                                }}
                                            />

                                            {/* Botón interactivo para escuchar la locución de este mensaje */}
                                            {!isUser && (
                                                <div className="mt-2 flex items-center gap-2 border-t border-taupe/15 pt-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleSpeech(msg.content, idx)}
                                                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-semibold transition ${
                                                            isThisSpeaking
                                                                ? 'bg-gold text-ink font-bold animate-pulse'
                                                                : 'bg-gold/10 text-gold-dark hover:bg-gold/25'
                                                        }`}
                                                        title={
                                                            isThisSpeaking
                                                                ? t('chatbot.speech_stop')
                                                                : t('chatbot.speech_listen')
                                                        }
                                                    >
                                                        {isThisSpeaking ? (
                                                            <>
                                                                <HiSpeakerXMark className="h-3 w-3" />
                                                                <span>{t('chatbot.speech_stop')}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <HiSpeakerWave className="h-3 w-3" />
                                                                <span>{t('chatbot.speech_listen')}</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {msg.time && (
                                            <span className="mt-0.5 px-1 text-[9px] text-taupe">
                                                {msg.time}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Indicador de pensamiento interactivo */}
                        {loading && (
                            <div className="flex items-start gap-2">
                                <ButcherAvatar
                                    status="thinking"
                                    size="xs"
                                    showStatusDot={false}
                                    showEqualizer={false}
                                    className="mt-0.5"
                                />
                                <div className="rounded-2xl rounded-tl-none border border-taupe/20 bg-white px-3.5 py-2.5 shadow-xs">
                                    <div className="flex items-center gap-2 text-xs text-taupe font-medium">
                                        <span>🔪 {t('chatbot.status_thinking')}</span>
                                        <div className="flex items-center gap-1">
                                            <span
                                                className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-dark"
                                                style={{ animationDelay: '0ms' }}
                                            />
                                            <span
                                                className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-dark"
                                                style={{ animationDelay: '150ms' }}
                                            />
                                            <span
                                                className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-dark"
                                                style={{ animationDelay: '300ms' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Sugerencias Rápidas */}
                    {messages.length <= 2 && (
                        <div className="border-t border-taupe/15 bg-white/70 p-2.5 backdrop-blur-xs">
                            <p className="mb-1.5 px-1 text-[9.5px] font-bold uppercase tracking-wider text-taupe">
                                {t('chatbot.faq_title') || 'Questions fréquentes :'}
                            </p>
                            <div className="flex max-h-20 flex-wrap gap-1.5 overflow-y-auto">
                                {suggestions.map((sug, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleSuggestionClick(sug.query)}
                                        className="rounded-full border border-gold/30 bg-white px-2.5 py-0.5 text-[10.5px] font-medium text-ink transition hover:border-gold hover:bg-gold/10 hover:text-gold-dark text-left"
                                    >
                                        {sug.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer y Entrada de Texto / Audio */}
                    <div className="border-t border-taupe/15 bg-white p-3">
                        {/* Banner flotante de grabación por voz activa */}
                        {isListening && (
                            <div className="mb-2 flex items-center justify-between rounded-xl border border-red-500/40 bg-red-950/15 px-3 py-1.5 text-xs backdrop-blur-xs animate-fade-up">
                                <div className="flex items-center gap-2 text-red-600 font-semibold text-[11px] min-w-0">
                                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />
                                    <span className="shrink-0">{t('chatbot.mic_listening')}</span>
                                    <div className="flex items-center gap-[2px] shrink-0">
                                        <span className="w-1 rounded-full bg-red-500 animate-soundwave-1" />
                                        <span className="w-1 rounded-full bg-red-400 animate-soundwave-2" />
                                        <span className="w-1 rounded-full bg-red-500 animate-soundwave-3" />
                                    </div>
                                    {transcript && (
                                        <span className="truncate italic text-ink/80 text-[10.5px] ml-1 font-normal">
                                            «{transcript}»
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleToggleMic}
                                    className="shrink-0 ml-2 rounded-md bg-red-600 px-2.5 py-0.5 text-[10px] font-bold text-white hover:bg-red-700 transition"
                                >
                                    {t('chatbot.mic_stop_btn') || 'Enviar'} ✔
                                </button>
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex items-center gap-2"
                        >
                            {/* Botón de Micrófono / Enviar Audio al carnicero */}
                            {isMicSupported && (
                                <button
                                    type="button"
                                    onClick={handleToggleMic}
                                    className={`flex items-center justify-center rounded-xl p-2.5 transition-all duration-300 ${
                                        isListening
                                            ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-500/40 ring-2 ring-red-400'
                                            : 'border border-gold/40 bg-gold/10 text-gold-dark hover:bg-gold/25 hover:text-ink'
                                    }`}
                                    title={isListening ? (t('chatbot.btn_stop_record_title') || 'Detener voz') : t('chatbot.mic_speak_btn')}
                                    aria-label={t('chatbot.mic_speak_btn') || 'Parler au micro'}
                                >
                                    {isListening ? (
                                        <HiStop className="h-4 w-4" />
                                    ) : (
                                        <HiMicrophone className="h-4 w-4" />
                                    )}
                                </button>
                            )}

                            <input
                                ref={inputRef}
                                type="text"
                                value={input || (isListening ? transcript : '')}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isListening ? t('chatbot.mic_listening') : t('chatbot.placeholder')}
                                disabled={loading}
                                className="input flex-1 py-2 text-xs"
                            />

                            <button
                                type="submit"
                                disabled={(!input.trim() && !transcript.trim()) || loading}
                                className="btn-brand p-2.5 text-xs disabled:opacity-40"
                                aria-label={t('chatbot.btn_send') || 'Envoyer le message'}
                            >
                                <HiPaperAirplane className="h-4 w-4" />
                            </button>
                        </form>

                        <div className="mt-2 flex items-center justify-between px-1 text-[9.5px] text-taupe">
                            <span className="flex items-center gap-1 font-medium">
                                <FaCrown className="h-2.5 w-2.5 text-gold" /> CANRES Viandes · Boucherie Artisanale
                            </span>
                            <a
                                href={`https://wa.me/${STORE_WHATSAPP}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                            >
                                <FaWhatsapp className="h-3 w-3" /> WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
