import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Selecciona la voz más humana y natural disponible en el dispositivo del usuario.
 * Prioriza voces neuronales de alta fidelidad (Natural / Neural / Google / Enhanced)
 * y descarta los sintetizadores robóticos heredados (como Microsoft Desktop / eSpeak).
 */
function findBestNaturalVoice(voices, lang) {
    if (!voices || voices.length === 0) return null;
    const prefix = lang.slice(0, 2).toLowerCase();

    // Filtrar voces que pertenezcan al idioma solicitado
    const langVoices = voices.filter((v) => {
        const vLang = (v.lang || '').toLowerCase();
        return vLang === lang.toLowerCase() || vLang.startsWith(prefix);
    });

    if (langVoices.length === 0) return null;

    const scoreVoice = (v) => {
        const name = (v.name || '').toLowerCase();
        let score = 0;

        // Máxima prioridad: Voces Neuronales / Naturales de última generación
        if (name.includes('natural')) score += 150;
        if (name.includes('neural')) score += 150;
        if (name.includes('online')) score += 80;
        if (name.includes('enhanced')) score += 90;
        if (name.includes('premium')) score += 90;
        if (name.includes('google')) score += 70;

        // Nombres de voces cálidas masculinas acordes al Maestro Carnicero
        if (
            name.includes('jorge') ||
            name.includes('alvaro') ||
            name.includes('gonzalo') ||
            name.includes('carlos') ||
            name.includes('mateo') ||
            name.includes('henri') ||
            name.includes('jean') ||
            name.includes('guy') ||
            name.includes('paul')
        ) {
            score += 30;
        }

        // Penalización drástica para sintetizadores robóticos antiguos de escritorio
        if (name.includes('desktop')) score -= 200;
        if (name.includes('espeak')) score -= 300;
        if (v.localService && !name.includes('natural') && !name.includes('enhanced')) {
            score -= 40;
        }

        return score;
    };

    // Ordenar de mayor a menor calidad
    const sorted = [...langVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
    return sorted[0];
}

/**
 * Hook para Text-to-Speech (TTS) con voz humana natural para el Maestro Carnicero.
 */
export function useSpeech(language = 'fr') {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingId, setSpeakingId] = useState(null);
    const [voices, setVoices] = useState([]);
    const synthRef = useRef(null);

    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    // Cargar y almacenar en caché las voces del navegador
    useEffect(() => {
        if (!isSupported) return;

        synthRef.current = window.speechSynthesis;

        const updateVoices = () => {
            const list = synthRef.current?.getVoices() || [];
            if (list.length > 0) {
                setVoices(list);
            }
        };

        updateVoices();
        if (synthRef.current.onvoiceschanged !== undefined) {
            synthRef.current.onvoiceschanged = updateVoices;
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

            // Si se hace clic en el mismo mensaje que ya está sonando, pausamos
            if (isSpeaking && speakingId === messageId) {
                stop();
                return;
            }

            stop();

            // Limpieza exhaustiva de Markdown y emojis para dicción natural
            const cleanText = text
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // enlaces
                .replace(/\*\*([^*]+)\*\*/g, '$1') // negrita
                .replace(/\*([^*]+)\*/g, '$1') // cursiva
                .replace(/#{1,6}\s+/g, '') // títulos
                .replace(/^[-*•]\s+/gm, '') // viñetas
                .replace(/\|[^\n]+\|/g, '') // tablas completas
                .replace(/https?:\/\/\S+/g, '') // enlaces url
                .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // emojis
                .replace(/\s{2,}/g, ' ')
                .trim();

            if (!cleanText) return;

            try {
                const utterance = new SpeechSynthesisUtterance(cleanText);
                const activeLang = overrideLang || language;

                // Idiomas canadienses oficiales y español
                let targetLang = 'fr-CA';
                if (activeLang === 'es') targetLang = 'es-CO';
                else if (activeLang === 'en') targetLang = 'en-CA';

                utterance.lang = targetLang;

                // Seleccionar la voz más natural (Neural / Google / Natural)
                const currentVoices = voices.length > 0 ? voices : synthRef.current?.getVoices() || [];
                const naturalVoice = findBestNaturalVoice(currentVoices, activeLang);

                if (naturalVoice) {
                    utterance.voice = naturalVoice;
                }

                // Parámetros afinados para cadencia humana y cálida de maestro carnicero
                utterance.pitch = 1.0;
                utterance.rate = 0.96; // Velocidad pausada y articulada

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
        [isSupported, isSpeaking, speakingId, language, voices, stop]
    );

    return {
        isSupported,
        isSpeaking,
        speakingId,
        speak,
        stop,
    };
}
