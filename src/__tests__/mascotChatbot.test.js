import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { TRANSLATIONS } from '@/presentation/i18n/translations.js';
import { SYSTEM_PROMPT } from '@/infrastructure/gateways/groqGateway.js';

describe('Asistente Virtual Interactivo - Mascota Maestro Carnicero CANRES', () => {
    it('posee los recursos fotográficos del muñequito (pensando/cortando y presentando la carne)', () => {
        const thinkingImg = path.resolve('public/images/butcher/butcher-thinking.jpg');
        const presentingImg = path.resolve('public/images/butcher/butcher-presenting.jpg');
        const idleWebp = path.resolve('public/images/butcher/butcher-idle.webp');
        const talkingWebp = path.resolve('public/images/butcher/butcher-talking.webp');
        const thinkingWebp = path.resolve('public/images/butcher/butcher-thinking.webp');

        expect(fs.existsSync(thinkingImg)).toBe(true);
        expect(fs.existsSync(presentingImg)).toBe(true);
        expect(fs.existsSync(idleWebp)).toBe(true);
        expect(fs.existsSync(talkingWebp)).toBe(true);
        expect(fs.existsSync(thinkingWebp)).toBe(true);
        expect(fs.statSync(idleWebp).size).toBeGreaterThan(10000);
        expect(fs.statSync(talkingWebp).size).toBeGreaterThan(10000);
        expect(fs.statSync(thinkingWebp).size).toBeGreaterThan(10000);
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
            expect(bot.mic_speak_btn).toBeDefined();
            expect(bot.mic_listening).toBeDefined();
            expect(bot.conversation_mode_btn).toBeDefined();
            expect(bot.floating_prompt).toBeDefined();
            expect(bot.stage_status_ready).toBeDefined();
            expect(bot.stage_welcome_title).toBeDefined();
            expect(bot.stage_welcome_desc).toBeDefined();
            expect(bot.btn_converse).toBeDefined();
            expect(bot.btn_voice).toBeDefined();
            expect(bot.stage_chip_grill).toBeDefined();
            expect(bot.stage_chip_sausage).toBeDefined();
            expect(bot.thinking_msg_1).toBeDefined();
            expect(bot.quote_1).toBeDefined();
        });
    });

    it('el prompt del sistema de la IA encarna al Maître Boucher de CANRES Viandes', () => {
        expect(SYSTEM_PROMPT).toContain('Maître Boucher');
        expect(SYSTEM_PROMPT).toContain('CANRES Viandes');
        expect(SYSTEM_PROMPT).toContain('Ribeye');
    });
});
