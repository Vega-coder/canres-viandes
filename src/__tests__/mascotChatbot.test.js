import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { TRANSLATIONS } from '@/presentation/i18n/translations.js';
import { SYSTEM_PROMPT } from '@/infrastructure/gateways/groqGateway.js';

describe('Asistente Virtual Interactivo - Mascota Maestro Carnicero CANRES', () => {
    it('posee los recursos fotográficos del muñequito (pensando/cortando y presentando la carne)', () => {
        const thinkingImg = path.resolve('public/images/butcher/butcher-thinking.jpg');
        const presentingImg = path.resolve('public/images/butcher/butcher-presenting.jpg');

        expect(fs.existsSync(thinkingImg)).toBe(true);
        expect(fs.existsSync(presentingImg)).toBe(true);
        expect(fs.statSync(thinkingImg).size).toBeGreaterThan(10000);
        expect(fs.statSync(presentingImg).size).toBeGreaterThan(10000);
    });

    it('cuenta con traducciones completas para el Maestro Carnicero en FR, EN y ES', () => {
        ['fr', 'en', 'es'].forEach((lang) => {
            const bot = TRANSLATIONS[lang].chatbot;
            expect(bot.mascot_name).toBeDefined();
            expect(bot.mascot_badge).toBeDefined();
            expect(bot.status_online).toBeDefined();
            expect(bot.status_thinking).toBeDefined();
            expect(bot.status_speaking).toBeDefined();
            expect(bot.speech_listen).toBeDefined();
            expect(bot.speech_stop).toBeDefined();
            expect(bot.floating_prompt).toBeDefined();
        });
    });

    it('el prompt del sistema de la IA encarna al Maître Boucher de CANRES Viandes', () => {
        expect(SYSTEM_PROMPT).toContain('Maître Boucher');
        expect(SYSTEM_PROMPT).toContain('CANRES Viandes');
        expect(SYSTEM_PROMPT).toContain('Ribeye');
    });
});
