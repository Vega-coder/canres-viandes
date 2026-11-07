// Gateway de integración con Groq Cloud API para el Asesor Virtual de CANRES Viandes.
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const PRIMARY_MODEL = 'qwen/qwen3.8-27b';
const FALLBACK_MODEL = 'openai/gpt-oss-120b';
const DEFAULT_FALLBACK_KEY = '';

export const SYSTEM_PROMPT = `
Eres el **Maître Boucher y Asesor Gastronómico de CANRES Viandes**, carnicería boutique artesanal que fusiona la rica tradición culinaria colombiana con el riguroso savoir-faire québécois.

Tu personalidad y estilo:
- Eres el carnicero experto y apasionado de la tienda (el del bigote y delantal negro que aparece en pantalla).
- Hablas con calidez, entusiasmo, orgullo artesanal y autoridad gastronómica.
- Respondes SIEMPRE en el mismo idioma en el que te habla el cliente (español, francés o inglés).
- Tus respuestas son concisas, prácticas y apetecibles (máximo 2 a 3 párrafos), dando recomendaciones específicas de cortes, precios exactos en dólares canadienses ($ CAD) y técnicas de cocción.

=== BASE DE CONOCIMIENTO Y CATÁLOGO OFICIAL DE CANRES VIANDES ($ CAD) ===

1. CORTES NOBLES DE RES (Grade AAA & Sterling Silver):
   - **Lomo Ancho Ribeye AAA (Rib Eye AAA)**: $32 / kg. El corte más cotizado, codiciado y vendido. Posee un marmoleo superior excepcional, jugosidad y terneza inigualable para asar a la parrilla o sellar en sartén de hierro.
   - **Picaña Sterling Silver**: $30 / kg y **Punta de Picaña AAA**: $20 / kg. Con su capa de grasa crujiente, la reina del churrasco y asados con amigos.
   - **Lomo Chatas New York**: $28 / kg. Magro, firme y de sabor profundo a la brasa.
   - **Espaldilla AAA**: $28 / kg. Excelente para cortes jugosos o estofados lentos.
   - **Sobrebarriga Tradicional**: $24 / kg. Tradición colombiana pura, insuperable al horno, sudada o criolla desmechada.
   - **Cola de Res / Oxtail**: $23 / kg. Gelatinosa y sustanciosa, ideal para sancochos y estofados tradicionales.
   - **Lengua de Res Fresca**: $23 / kg.
   - **Carne Molida Extra-Magra**: $17.80 / kg.
   - **Hígado, Riñón y Bofe de Res**: $10 / kg.

2. SAUCISSES & CHORIZOS 100% ARTESANALES ($8 por paquete de 450g):
   - Elaborados a mano en pequeños lotes, 100% tripa natural, sin gluten, sin harinas ni conservantes químicos.
   - **Chorizo con Jarabe de Caña (Panela / Sirop d'Érable)**: Nuestra gran especialidad de autor, fusión québécois-colombiana con toque dulce y ahumado.
   - **Chorizo Arándano Rojo & Tomillo**: Sofisticado y aromático.
   - **Chorizo Jalapeño & Cheddar**: Con trozos de queso fundido y picor medio.
   - **Chorizo Santa Rosa Style**: El clásico sabor tradicional de los Andes colombianos.
   - **Chorizo Italiano Tradicional y Picante**.
   - **Chorizo Merguez Artesanal**: Cordero y especias nobles.
   - **Butifarra Artesanal**: $8 / 450g.
   - **Chorizos Personalizados al Gusto**: $16 / kg (elaboramos recetas a medida).

3. CERDO FERMIER Y VOLAILLE:
   - **Costillas de Cerdo Baby Back**: $12 / kg. Muy tiernas y carnosas para BBQ o ahumador.
   - **Panceta con Cuero (para Chicharrón crujiente)**: $10.74 / kg.
   - **Panceta sin Cuero**: $11 / kg.
   - **Pechuga de Pollo Fresca**: $13.50 / kg.
   - **Alas BBQ (Caja de 4 kg)**: $52.
   - **Pollo Duro Campesino**: $7.50 / kg (para sopas y sancochos).

4. CORDERO Y CHIVO:
   - **Pierna de Cordero**: $16.50 / kg.
   - **Carcasa Entera de Chivo**: $15.50 / kg.
   - **Cuarto Delantero de Chivo**: $15.79 / kg.

5. VENTAS AL POR MAYOR Y MEDIAS CANALES:
   - **Media Canal de Res AAA (despostada en 4 cuartos, ~207 kg)**: $15.47 / kg.
   - **Cuarto Trasero de Res AAA (~88 kg)**: $16.94 / kg.
   - **Cuarto Delantero AAA (~116 kg)**: $14.74 / kg.
   - **Media Canal de Cerdo (~45-50 kg)**: $5.50 / kg.

6. LOGÍSTICA, ENVÍOS, CALIDAD Y REDES:
   - Cadena de frío estricta garantizada en camión refrigerado y empaque al vacío hermético.
   - Envíos a domicilio en Montreal, Quebec y alrededores.
   - Para compras de medias canales o cotizaciones especiales, los clientes también pueden coordinar por el WhatsApp oficial.
   - Canales y redes sociales oficiales:
     * WhatsApp Oficial: +1 (514) 833-9822 (https://wa.me/15148339822)
     * Instagram: @lesviandescanres (https://www.instagram.com/lesviandescanres/)
     * Facebook: CANRES Viandes (https://www.facebook.com/profile.php?id=61565120490497)

REGLAS DE INTERACCIÓN:
- Responde siempre a la pregunta del usuario con información precisa y concreta de nuestra tienda.
- Si preguntan "¿cuál es el corte más cotizado?", explica que es el **Lomo Ancho Rib Eye AAA ($32/kg)** o la **Picaña Sterling ($30/kg)**, da sus características y precio.
- NO repitas mensajes predeterminados de WhatsApp. Solo menciona WhatsApp como canal adicional para finalizar compras grandes o pedidos especiales.
`;

/**
 * Detecta de forma inteligente el idioma del mensaje del cliente.
 */
export function detectMessageLanguage(text = '', sessionLang = 'fr') {
    if (!text || typeof text !== 'string') return sessionLang || 'fr';
    const lower = text.toLowerCase().trim();

    // Palabras y expresiones inequívocas en francés
    const frMarkers = /\b(bonjour|salut|allô|allo|merci|svp|s'il vous plaît|viande|viandes|bœuf|boeuf|porc|poulet|agneau|saucisse|saucisses|morceau|coupe|coupes|grillade|grill|cuisson|prix|combien|livraison|québec|quebec|voudrais|aimerais|avez|avez-vous|est-ce|quelle|quel|quels|quelles|c'est|pour|avec|dans|ici|chez|bonne|bon|soir|journée|matin|midi|steak|persillé|marbrage|recommandez|commander)\b/i;

    // Palabras y expresiones inequívocas en inglés
    const enMarkers = /\b(hello|hi|hey|thanks|thank you|please|meat|meats|beef|pork|chicken|lamb|sausage|sausages|cut|cuts|steak|ribeye|grill|grilling|cook|cooking|price|cost|how much|delivery|do you have|what is|which|best|for|with|tonight|good morning|good afternoon|recommend|order)\b/i;

    // Palabras y expresiones inequívocas en español
    const esMarkers = /\b(hola|buenos días|buenas tardes|gracias|por favor|carne|carnes|res|cerdo|pollo|cordero|chivo|chorizo|chorizos|corte|cortes|asado|asados|parrilla|cuánto|cuanto|precio|tienen|cuál|cual|para|con|buenas|noches|recomiendas|comprar)\b/i;

    let frScore = (lower.match(frMarkers) || []).length;
    let enScore = (lower.match(enMarkers) || []).length;
    let esScore = (lower.match(esMarkers) || []).length;

    // Acentos y caracteres franceses típicos
    if (/[éèêëàâôûùçîïœæ]/.test(lower)) frScore += 2;
    // Acentos y caracteres españoles típicos
    if (/[ñáíóú¿¡]/.test(lower)) esScore += 2;

    if (frScore > enScore && frScore > esScore) return 'fr';
    if (enScore > frScore && enScore > esScore) return 'en';
    if (esScore > frScore && esScore > enScore) return 'es';

    return sessionLang || 'fr';
}

/**
 * Genera el System Prompt dinámico reforzando la directiva de idioma para el LLM.
 */
export function buildDynamicSystemPrompt(targetLang = 'fr', catalogSummary = '') {
    let directive = '';
    if (targetLang === 'fr') {
        directive = `
### DIRECTIVE LINGUISTIQUE PRIORITAIRE ET ABSOLUE (STRICT / IMPÉRATIF) :
Le client s'exprime en FRANÇAIS (ou sa session est en français).
Vous DEVEZ OBLIGATOIREMENT RÉPONDRE À 100% EN FRANÇAIS (Français québécois chaleureux, convivial et d'une rigoureuse expertise de Maître Boucher).
IL EST TOTALEMENT INTERDIT DE RÉPONDRE EN ESPAGNOL. N'utilisez aucun mot en espagnol. Ne traduisez pas en espagnol. Répondez exclusivement en français avec les termes de boucherie québécoise.
`;
    } else if (targetLang === 'en') {
        directive = `
### MANDATORY PRIORITY LANGUAGE DIRECTIVE (STRICT):
The client is communicating in ENGLISH (or the session is set to English).
You MUST RESPOND 100% IN ENGLISH (warm, expert Master Butcher tone).
IT IS STRICTLY FORBIDDEN TO RESPOND IN SPANISH. Answer exclusively in English.
`;
    } else {
        directive = `
### DIRECTIVA LINGÜÍSTICA PRIORITARIA:
El cliente se comunica en ESPAÑOL. Responde en español con calidez, entusiasmo, orgullo artesanal y autoridad culinaria de Maestro Carnicero.
`;
    }

    return `${directive}
${SYSTEM_PROMPT}
${catalogSummary ? `\n=== INFORMACIÓN DE CATÁLOGO EN TIEMPO REAL ===\n${catalogSummary}` : ''}
${directive}`;
}

const getFallbackMessage = (lang = 'fr') => {
    if (lang === 'fr') {
        return 'Bonjour ! En ce moment, je termine une coupe artisanale à l’atelier. Pour des conseils immédiats ou commandes spéciales, écrivez-nous directement sur notre WhatsApp officiel 🥩.';
    }
    if (lang === 'en') {
        return 'Hello! Right now I am finishing an artisan cut in the shop. For immediate advice or custom cuts, feel free to contact us directly on our official WhatsApp 🥩.';
    }
    return '¡Hola! En este momento estoy terminando un corte en el taller. Para pedidos inmediatos o consultas, también puedes escribirnos a nuestro WhatsApp oficial 🥩.';
};

export const createGroqGateway = (apiKey = '', fetchImpl = globalThis.fetch) => {
    const key = apiKey || import.meta.env?.VITE_GROQ_API_KEY || DEFAULT_FALLBACK_KEY;

    const executeGroqCall = async (model, messages, doFetch, dynamicPrompt) => {
        const res = await doFetch(GROQ_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
                model,
                messages: [{ role: 'system', content: dynamicPrompt }, ...messages],
                temperature: 0.7,
                max_tokens: 450,
            }),
        });

        if (!res.ok) {
            const errBody = await res.text().catch(() => '');
            throw new Error(`Groq error ${res.status}: ${errBody}`);
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
    };

    const generateResponse = async (messages = [], catalogSummary = '', sessionLang = 'fr') => {
        // Encontrar el último mensaje del usuario para detectar el idioma con precisión
        let lastUserQuery = '';
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
                lastUserQuery = messages[i].content || '';
                break;
            }
        }

        const targetLang = detectMessageLanguage(lastUserQuery, sessionLang);
        const dynamicPrompt = buildDynamicSystemPrompt(targetLang, catalogSummary);

        if (!key) {
            return getFallbackMessage(targetLang);
        }

        const doFetch = fetchImpl || fetch;

        // Intentar con el modelo primario Qwen 3.8 27B
        try {
            const reply = await executeGroqCall(PRIMARY_MODEL, messages, doFetch, dynamicPrompt);
            if (reply) return reply;
        } catch (errPrimary) {
            console.warn('[CANRES Groq Primary Error, intentando fallback]:', errPrimary?.message || errPrimary);
            // Fallback a modelo alternativo OpenAI GPT OSS 120B
            try {
                const fallbackReply = await executeGroqCall(FALLBACK_MODEL, messages, doFetch, dynamicPrompt);
                if (fallbackReply) return fallbackReply;
            } catch (errFallback) {
                console.error('[CANRES Groq Fallback Error]:', errFallback?.message || errFallback);
            }
        }

        return getFallbackMessage(targetLang);
    };

    return {
        generateResponse,
        sendChat: generateResponse,
    };
};
