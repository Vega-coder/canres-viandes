import { useState, useEffect, useRef, useMemo } from 'react';
import { HiSparkles, HiPaperAirplane, HiXMark, HiArrowPath } from 'react-icons/hi2';
import { FaWhatsapp, FaCrown } from 'react-icons/fa6';
import { useCases, STORE_WHATSAPP } from '@/infrastructure/container.js';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import ChatMarkdown from './ChatMarkdown.jsx';

const STORAGE_KEY = 'canres_chatbot_history_v2';

export default function Chatbot() {
    const { t, language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

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

    // Si no ha habido interacción y cambia el idioma, actualizamos el mensaje de bienvenida
    useEffect(() => {
        const timer = setTimeout(() => {
            setMessages((prev) => {
                if (prev.length === 1 && prev[0].role === 'assistant') {
                    return [initialWelcome];
                }
                return prev;
            });
        }, 0);
        return () => clearTimeout(timer);
    }, [initialWelcome]);

    // Guardar en sessionStorage al cambiar mensajes
    useEffect(() => {
        try {
            sessionStorage.setItem(`${STORAGE_KEY}_${language}`, JSON.stringify(messages));
        } catch {
            // ignore
        }
    }, [messages, language]);

    // Auto-scroll al final del chat
    const scrollToBottom = (behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom('auto');
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen, messages, loading]);

    const handleSend = async (textToSend) => {
        const query = (textToSend || input).trim();
        if (!query || loading) return;

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

            const response = await useCases.sendChatMessage(apiMessages);

            const botMsg = {
                role: 'assistant',
                content: response,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error('[Chatbot Error]:', error);
            const errorMsg = {
                role: 'assistant',
                content:
                    'Disculpas, ocurrió una interrupción de conexión. Por favor reintenta o escríbenos a WhatsApp.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
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

    return (
        <>
            {/* Botón flotante para abrir el Chatbot (esquina inferior izquierda) */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-5 left-5 z-40 flex items-center gap-2.5 rounded-full border border-gold/40 bg-gradient-to-r from-ink via-[#241F1C] to-ink px-4 py-3 text-cream-light shadow-2xl transition-all duration-300 hover:scale-105 hover:border-gold hover:shadow-gold/20 active:scale-95 group"
                    aria-label="Abrir asistente virtual de carnicería"
                >
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-gold border border-gold/40">
                        <HiSparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </span>
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gold-light">
                            {t('chatbot.title')}
                        </p>
                        <p className="text-[11px] font-medium text-cream/80">
                            {t('chatbot.subtitle')}
                        </p>
                    </div>
                </button>
            )}

            {/* Ventana Modal / Drawer del Chatbot */}
            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Chat con Asesor Virtual CANRES Viandes"
                    className="fixed inset-x-3 bottom-3 top-20 z-50 flex flex-col overflow-hidden rounded-2xl border border-gold/40 bg-cream-light shadow-2xl backdrop-blur-md transition-all duration-300 sm:inset-auto sm:bottom-5 sm:left-5 sm:h-[580px] sm:w-[410px] sm:max-h-[85vh]"
                >
                    {/* Encabezado */}
                    <header className="relative flex items-center justify-between border-b border-gold/20 bg-gradient-to-r from-[#171513] via-[#24211D] to-[#171513] px-4 py-3 text-cream-light shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold/10 text-gold shadow-xs">
                                <HiSparkles className="h-5 w-5" />
                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-ink bg-emerald-500" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                                        CANRES Viandes
                                    </h3>
                                    <span className="rounded-full bg-gold/20 px-1.5 py-0.2 text-[9px] font-semibold tracking-wider text-gold uppercase">
                                        IA Boucher
                                    </span>
                                </div>
                                <p className="text-[11px] text-cream/70">
                                    {t('chatbot.title')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handleClear}
                                className="rounded-lg p-1.5 text-cream/70 transition hover:bg-white/10 hover:text-white"
                                title="Réinitialiser"
                                aria-label="Réinitialiser"
                            >
                                <HiArrowPath className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg p-1.5 text-cream/70 transition hover:bg-white/10 hover:text-white"
                                title="Fermer"
                                aria-label="Fermer"
                            >
                                <HiXMark className="h-5 w-5" />
                            </button>
                        </div>
                    </header>

                    {/* Área de Mensajes */}
                    <div className="flex-1 space-y-4 overflow-y-auto p-4 scroll-smooth">
                        {messages.map((msg, idx) => {
                            const isUser = msg.role === 'user';
                            return (
                                <div
                                    key={idx}
                                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                                            isUser
                                                ? 'rounded-tr-none bg-ink text-cream-light'
                                                : 'rounded-tl-none border border-taupe/20 bg-white text-ink'
                                        }`}
                                    >
                                        <ChatMarkdown
                                            content={msg.content}
                                            onLinkClick={() => {
                                                setIsOpen(false);
                                                window.scrollTo({ top: 0, behavior: 'instant' });
                                            }}
                                        />
                                    </div>
                                    {msg.time && (
                                        <span className="mt-1 text-[9.5px] text-taupe px-1">
                                            {msg.time}
                                        </span>
                                    )}
                                </div>
                            );
                        })}

                        {loading && (
                            <div className="flex items-start">
                                <div className="rounded-2xl rounded-tl-none border border-taupe/20 bg-white px-4 py-3 shadow-xs">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-gold-dark" style={{ animationDelay: '0ms' }} />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-gold-dark" style={{ animationDelay: '150ms' }} />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-gold-dark" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Sugerencias Rápidas */}
                    {messages.length <= 2 && (
                        <div className="border-t border-taupe/15 bg-white/60 p-2.5 backdrop-blur-xs">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-taupe px-1">
                                Questions fréquentes :
                            </p>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                                {suggestions.map((sug, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleSuggestionClick(sug.query)}
                                        className="rounded-full border border-gold/30 bg-white px-2.5 py-1 text-[11px] font-medium text-ink transition hover:border-gold hover:bg-gold/10 hover:text-gold-dark text-left"
                                    >
                                        {sug.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer y Entrada de Texto */}
                    <div className="border-t border-taupe/15 bg-white p-3">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex items-center gap-2"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={t('chatbot.placeholder')}
                                disabled={loading}
                                className="input flex-1 py-2 text-xs"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="btn-brand p-2.5 text-xs disabled:opacity-40"
                                aria-label="Envoyer le message"
                            >
                                <HiPaperAirplane className="h-4 w-4" />
                            </button>
                        </form>

                        <div className="mt-2.5 flex items-center justify-between text-[10px] text-taupe px-1">
                            <span className="flex items-center gap-1">
                                <FaCrown className="h-3 w-3 text-gold" /> CANRES Viandes · Boucherie Artisanale
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
