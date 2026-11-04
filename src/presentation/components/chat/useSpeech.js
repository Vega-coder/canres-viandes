import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para Text-to-Speech (TTS) interactivo del Maestro Carnicero CANRES.
 * Proporciona reproducción de voz en Francés, Inglés o Español con sincronización
 * visual de habla (soundwaves, animación facial y estado).
 */
export function useSpeech(language = 'fr') {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingId, setSpeakingId] = useState(null);
    const synthRef = useRef(null);

    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    useEffect(() => {
        if (isSupported) {
            synthRef.current = window.speechSynthesis;
            if (synthRef.current.onvoiceschanged !== undefined) {
                synthRef.current.onvoiceschanged = () => {};
            }
        }
        return () => {
            if (synthRef.current) {
                try {
                    synthRef.current.cancel();
                } catch {
                    // ignore
                }
            }
        };
    }, [isSupported]);

    const stop = useCallback(() => {
        if (synthRef.current) {
            try {
                synthRef.current.cancel();
            } catch {
                // ignore
            }
        }
        setIsSpeaking(false);
        setSpeakingId(null);
    }, []);

    const speak = useCallback(
        (text, messageId = null, overrideLang = null) => {
            if (!isSupported || !text) return;

            // Si se hace clic en el mismo mensaje que ya está sonando, pausamos/detenemos
            if (isSpeaking && speakingId === messageId) {
                stop();
                return;
            }

            stop();

            // Limpieza de Markdown para que la locución sea fluida y natural
            const cleanText = text
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [enlace](url) -> enlace
                .replace(/\*\*([^*]+)\*\*/g, '$1') // **negrita**
                .replace(/\*([^*]+)\*/g, '$1') // *cursiva*
                .replace(/#{1,6}\s+/g, '') // encabezados
                .replace(/^[-*•]\s+/gm, '') // viñetas
                .replace(/\|[^\n]+\|/g, '') // tablas completas
                .replace(/https?:\/\/\S+/g, '') // URLs
                .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // Emojis que puedan sonar extraños en lectura
                .replace(/\s{2,}/g, ' ')
                .trim();

            if (!cleanText) return;

            try {
                const utterance = new SpeechSynthesisUtterance(cleanText);
                const activeLang = overrideLang || language;

                // Idiomas canadienses oficiales y español
                if (activeLang === 'es') {
                    utterance.lang = 'es-CO';
                } else if (activeLang === 'fr') {
                    utterance.lang = 'fr-CA';
                } else {
                    utterance.lang = 'en-CA';
                }

                if (synthRef.current) {
                    const voices = synthRef.current.getVoices();
                    if (voices && voices.length > 0) {
                        const target = utterance.lang.toLowerCase();
                        const prefix = activeLang.toLowerCase();
                        const matchedVoice =
                            voices.find((v) => v.lang.toLowerCase() === target) ||
                            voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ||
                            voices.find((v) => v.lang.toLowerCase().includes(prefix));
                        if (matchedVoice) {
                            utterance.voice = matchedVoice;
                        }
                    }
                }

                // Tono cálido, amigable y profesional de maestro carnicero
                utterance.pitch = 0.95;
                utterance.rate = 1.0;

                utterance.onstart = () => {
                    setIsSpeaking(true);
                    setSpeakingId(messageId);
                };

                utterance.onend = () => {
                    setIsSpeaking(false);
                    setSpeakingId(null);
                };

                utterance.onerror = (e) => {
                    if (e.error !== 'interrupted' && e.error !== 'canceled') {
                        console.warn('[Maestro Carnicero TTS error]:', e);
                    }
                    setIsSpeaking(false);
                    setSpeakingId(null);
                };

                synthRef.current.speak(utterance);
            } catch (err) {
                console.warn('[SpeechSynthesis Exception]:', err);
                setIsSpeaking(false);
                setSpeakingId(null);
            }
        },
        [isSupported, isSpeaking, speakingId, language, stop],
    );

    return {
        isSupported,
        isSpeaking,
        speakingId,
        speak,
        stop,
    };
}
