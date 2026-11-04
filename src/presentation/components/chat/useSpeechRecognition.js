import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para reconocimiento de voz (Speech-to-Text) en el navegador.
 * Permite al usuario hablarle directamente al Maestro Carnicero por micrófono.
 */
export function useSpeechRecognition(language = 'fr') {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);
    const onFinalCallbackRef = useRef(null);

    const isSupported =
        typeof window !== 'undefined' &&
        Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

    // Mapeo de idiomas soportados según la tienda
    const getLocale = useCallback((lang) => {
        if (lang === 'es') return 'es-CO';
        if (lang === 'fr') return 'fr-CA';
        return 'en-CA';
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch {
                // ignore
            }
        }
        setIsListening(false);
    }, []);

    const startListening = useCallback(
        (onFinalCallback) => {
            if (!isSupported) {
                setError('El reconocimiento de voz no está soportado en este navegador.');
                return;
            }

            // Si ya está escuchando, detenemos
            if (isListening) {
                stopListening();
                return;
            }

            setError(null);
            setTranscript('');
            onFinalCallbackRef.current = onFinalCallback;

            try {
                const SpeechRecognitionClass =
                    window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognitionClass();

                recognition.lang = getLocale(language);
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.maxAlternatives = 1;

                recognition.onstart = () => {
                    setIsListening(true);
                };

                recognition.onresult = (event) => {
                    let currentTranscript = '';
                    let finalTranscript = '';

                    for (let i = 0; i < event.results.length; i++) {
                        const item = event.results[i];
                        if (item.isFinal) {
                            finalTranscript += item[0].transcript;
                        } else {
                            currentTranscript += item[0].transcript;
                        }
                    }

                    const combined = (finalTranscript || currentTranscript).trim();
                    setTranscript(combined);

                    if (finalTranscript && onFinalCallbackRef.current) {
                        onFinalCallbackRef.current(finalTranscript.trim());
                    }
                };

                recognition.onerror = (event) => {
                    if (event.error !== 'no-speech' && event.error !== 'aborted') {
                        console.warn('[SpeechRecognition Error]:', event.error);
                        setError(`Error de micrófono: ${event.error}`);
                    }
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
                recognition.start();
            } catch (err) {
                console.error('[SpeechRecognition Start Exception]:', err);
                setError('No se pudo acceder al micrófono.');
                setIsListening(false);
            }
        },
        [isSupported, isListening, language, getLocale, stopListening]
    );

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch {
                    // ignore
                }
            }
        };
    }, []);

    return {
        isSupported,
        isListening,
        transcript,
        error,
        startListening,
        stopListening,
    };
}
