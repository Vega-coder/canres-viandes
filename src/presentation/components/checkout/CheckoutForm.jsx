import { useMemo } from 'react';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';

export default function CheckoutForm({ values, errors, onChange, onSubmit, submitting }) {
    const { t } = useLanguage();

    const fields = useMemo(
        () => [
            { name: 'fullName', label: t('checkout.full_name'), autoComplete: 'name', span: 2 },
            { name: 'email', label: t('checkout.email'), type: 'email', autoComplete: 'email' },
            { name: 'phone', label: t('checkout.phone'), type: 'tel', autoComplete: 'tel', inputMode: 'numeric' },
            { name: 'city', label: t('checkout.city'), autoComplete: 'address-level2' },
            { name: 'address', label: t('checkout.address'), autoComplete: 'street-address' },
        ],
        [t],
    );

    return (
        <form onSubmit={onSubmit} noValidate className="space-y-10">
            <section>
                <h2 className="font-display text-2xl">{t('checkout.shipping_title')}</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {fields.map((f) => (
                        <label key={f.name} className={f.span === 2 ? 'sm:col-span-2' : ''}>
                            <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.15em] text-ink/70">{f.label}</span>
                            <input
                                name={f.name}
                                type={f.type ?? 'text'}
                                autoComplete={f.autoComplete}
                                inputMode={f.inputMode}
                                value={values[f.name]}
                                onChange={onChange}
                                aria-invalid={Boolean(errors[f.name])}
                                className={`input ${errors[f.name] ? 'border-red-700/60' : ''}`}
                            />
                            {errors[f.name] && <span className="mt-1 block text-xs text-red-800">{errors[f.name]}</span>}
                        </label>
                    ))}
                    <label className="sm:col-span-2">
                        <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.15em] text-ink/70">
                            {t('checkout.notes')}
                        </span>
                        <textarea
                            name="notes"
                            rows={3}
                            value={values.notes}
                            onChange={onChange}
                            className="input resize-none"
                            placeholder={t('checkout.notes_placeholder')}
                        />
                    </label>
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl">{t('checkout.payment_title')}</h2>
                    <span className="text-[10px] uppercase tracking-wider text-taupe">{t('checkout.payment_secure')}</span>
                </div>
                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="group relative block w-full text-left border border-gold bg-white p-4 sm:p-5 ring-1 ring-gold/40 shadow-sm transition-all duration-200 hover:border-gold-dark hover:shadow-md hover:ring-gold/70 focus:outline-none focus:ring-2 focus:ring-gold active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                        <span className="block pointer-events-none">
                            <span className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-sm text-ink group-hover:text-gold-dark transition-colors">
                                    {t('checkout.wompi_label')}
                                </span>
                                <span className="rounded bg-gold/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold-dark">
                                    {t('checkout.recommended')}
                                </span>
                            </span>
                            <span className="mt-1.5 block text-xs text-taupe">
                                Tarjetas de crédito/débito (Visa, Mastercard, Amex) & transferencias.
                            </span>
                            <span className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-ink/70">
                                <span className="rounded border border-taupe/20 bg-cream/30 px-2 py-1">Visa</span>
                                <span className="rounded border border-taupe/20 bg-cream/30 px-2 py-1">Mastercard</span>
                                <span className="rounded border border-taupe/20 bg-cream/30 px-2 py-1">American Express</span>
                                <span className="rounded border border-taupe/20 bg-cream/30 px-2 py-1">Interac / Online</span>
                            </span>
                            <span className="mt-4 flex items-center justify-between border-t border-gold/25 pt-3 text-xs font-semibold uppercase tracking-wider text-ink group-hover:text-gold-dark transition-colors">
                                <span className="flex items-center gap-2">
                                    {submitting ? (
                                        <>
                                            <svg className="h-3.5 w-3.5 animate-spin text-gold-dark" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                            </svg>
                                            <span>{t('checkout.processing')}</span>
                                        </>
                                    ) : (
                                        <span>{t('checkout.place_order', { total: '' })}</span>
                                    )}
                                </span>
                                <span className="text-sm font-bold transition-transform group-hover:translate-x-1">→</span>
                            </span>
                        </span>
                    </button>
                    <p className="mt-3 text-center text-[11px] text-taupe leading-relaxed">
                        <a
                            href="/terminos"
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:text-gold text-ink font-medium"
                        >
                            {t('footer.terms_link')}
                        </a>.
                    </p>
                </div>
            </section>
        </form>
    );
}
