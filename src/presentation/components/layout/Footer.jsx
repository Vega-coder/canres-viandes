import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaFacebookF } from 'react-icons/fa6';
import Monogram from '@/presentation/components/brand/Monogram.jsx';
import LanguageSelector from '@/presentation/components/ui/LanguageSelector.jsx';
import { CATEGORIES } from '@/domain/catalog/categories.js';
import { STORE_WHATSAPP, STORE_INSTAGRAM, STORE_FACEBOOK } from '@/infrastructure/container.js';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';

export default function Footer() {
    const { t, getCategoryLabel } = useLanguage();

    return (
        <footer className="bg-ink text-cream/70 border-t border-white/10">
            <div className="container-luxe grid gap-12 py-16 md:grid-cols-4">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-4">
                        <Monogram className="h-14 w-auto sm:h-16" variant="light" />
                        <div>
                            <p className="font-display text-2xl tracking-[0.14em] text-cream-light font-bold">
                                {t('footer.brand_name', 'CANRES VIANDES')}
                            </p>
                            <p className="eyebrow mt-1 text-brand-light font-semibold">
                                {t('footer.tagline', '« La viande comme il faut »')}
                            </p>
                        </div>
                    </div>
                    <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/80">
                        {t('footer.mission')}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-cream/60 uppercase tracking-wider">
                        {t('footer.pillars')}
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                        <div className="flex gap-4 text-cream-light text-lg">
                            <a href={STORE_INSTAGRAM} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-brand-light transition"><FaInstagram /></a>
                            <a href={STORE_FACEBOOK} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-brand-light transition"><FaFacebookF /></a>
                            <a href={`https://wa.me/${STORE_WHATSAPP}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="hover:text-brand-light transition"><FaWhatsapp /></a>
                        </div>
                        <div className="ml-4 pl-4 border-l border-white/10">
                            <LanguageSelector />
                        </div>
                    </div>
                </div>

                <div>
                    <p className="eyebrow text-cream-light font-bold">{t('footer.col1_title')}</p>
                    <ul className="mt-5 space-y-2.5 text-sm">
                        <li>
                            <Link to="/tienda" className="hover:text-brand-light text-brand-light font-medium">
                                {t('footer.full_catalog')}
                            </Link>
                        </li>
                        {CATEGORIES.map((c) => (
                            <li key={c.slug}>
                                <Link to={`/tienda/${c.slug}`} className="hover:text-brand-light transition">
                                    {getCategoryLabel(c.slug)}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="eyebrow text-cream-light font-bold">{t('footer.col2_title')}</p>
                    <ul className="mt-5 space-y-2.5 text-sm">
                        <li>{t('footer.g1')}</li>
                        <li>{t('footer.g2')}</li>
                        <li>{t('footer.g3')}</li>
                        <li>{t('footer.g4')}</li>
                        <li>
                            <Link to="/favoritos" className="hover:text-brand-light transition">
                                {t('footer.fav_link')}
                            </Link>
                        </li>
                        <li>
                            <Link to="/terminos" className="hover:text-brand-light transition font-medium">
                                {t('footer.terms_link')}
                            </Link>
                        </li>
                        <li className="pt-2">
                            <a
                                href={`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(t('footer.whatsapp_msg'))}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 font-semibold text-brand-light hover:text-white transition"
                            >
                                <FaWhatsapp className="h-4 w-4 shrink-0" />
                                <span>{t('footer.butcher_chat')}</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/10 py-6 text-center text-xs text-cream/50">
                <div className="container-luxe flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p>© {new Date().getFullYear()} CANRES Viandes. Boucherie Artisanale & Charcuterie. {t('footer.rights')}</p>
                    <p className="tracking-widest uppercase text-[10px] text-cream/40">
                        {t('footer.bilingual_footer')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
