import { describe, it, expect, vi } from 'vitest';
import { createGroqGateway, SYSTEM_PROMPT } from '@/infrastructure/gateways/groqGateway.js';

describe('Groq Gateway de CANRES Viandes', () => {
    it('contiene el prompt del sistema orientado a carnicería artesanal', () => {
        expect(SYSTEM_PROMPT).toContain('CANRES Viandes');
        expect(SYSTEM_PROMPT).toContain('Maître Boucher');
        expect(SYSTEM_PROMPT).toContain('Ribeye AAA');
    });

    it('envía los mensajes a Groq con el prompt de carnicería', async () => {
        let capturedBody = null;
        const mockFetch = vi.fn().mockImplementation(async (url, opts) => {
            capturedBody = JSON.parse(opts.body);
            return {
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: 'Te recomiendo el Ribeye AAA a la parrilla.' } }],
                }),
            };
        });

        const gateway = createGroqGateway('test-api-key', mockFetch);
        const reply = await gateway.generateResponse([{ role: 'user', content: '¿Qué corte me recomiendas para asar?' }]);

        expect(reply).toBe('Te recomiendo el Ribeye AAA a la parrilla.');
        expect(capturedBody.messages[0].role).toBe('system');
        expect(capturedBody.messages[0].content).toContain('CANRES Viandes');
        expect(capturedBody.messages[1].content).toBe('¿Qué corte me recomiendas para asar?');
    });

    it('devuelve mensaje amigable con contacto si no hay API key o si ocurre error', async () => {
        const mockFailingFetch = vi.fn().mockRejectedValue(new Error('Network error'));
        const gateway = createGroqGateway('test-key', mockFailingFetch);
        const reply = await gateway.generateResponse([{ role: 'user', content: 'Hola' }]);

        expect(reply).toContain('WhatsApp');
    });
});
