// Gateway de integración con Groq Cloud API para el Asesor Virtual de CANRES Viandes.
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const PRIMARY_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_FALLBACK_KEY = '';

export const SYSTEM_PROMPT = `
Eres el **Maître Boucher y Asesor Gastronómico de CANRES Viandes**, carnicería artesanal que fusiona la tradición colombiana y el savoir-faire québécois.

Tu personalidad:
- Apasionado por la buena carne, los cortes nobles (Ribeye AAA, Picaña Sterling, Baby Back ribs) y la charcutería 100% artesanal (Chorizo Jarabe de Caña, Arándano & Tomillo, Jalapeño Cheddar, Santa Rosa).
- Asesoras sobre métodos de cocción (parrilla, brasa, horno, ahumado, sartén de hierro).
- Precios en dólares ($ CAD / USD) basados en la lista oficial.
`;

export const createGroqGateway = (apiKey = '', fetchImpl = globalThis.fetch) => {
    const key = apiKey || import.meta.env?.VITE_GROQ_API_KEY || DEFAULT_FALLBACK_KEY;

    const generateResponse = async (messages = []) => {
        if (!key) {
            return '¡Hola! Para consultas especializadas de cortes o pedidos al por mayor, contáctanos directamente a nuestro WhatsApp oficial 🥩.';
        }

        try {
            const doFetch = fetchImpl || fetch;
            const res = await doFetch(GROQ_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${key}`,
                },
                body: JSON.stringify({
                    model: PRIMARY_MODEL,
                    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
                    temperature: 0.7,
                    max_tokens: 500,
                }),
            });

            if (!res.ok) throw new Error(`Groq error ${res.status}`);
            const data = await res.json();
            return data.choices?.[0]?.message?.content || 'Un momento, por favor.';
        } catch (err) {
            console.error('[CANRES GroqGateway]:', err);
            return 'Nuestros maestros carniceros están listos para atenderte por WhatsApp.';
        }
    };

    return {
        generateResponse,
        sendChat: generateResponse,
    };
};
