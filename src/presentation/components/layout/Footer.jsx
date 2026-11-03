import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaFacebookF } from 'react-icons/fa6';
import Monogram from '@/presentation/components/brand/Monogram.jsx';
import { CATEGORIES } from '@/domain/catalog/categories.js';
import { STORE_WHATSAPP } from '@/infrastructure/container.js';

export default function Footer() {
    return (
        <footer className="bg-ink text-cream/70 border-t border-white/10">
            <div className="container-luxe grid gap-12 py-16 md:grid-cols-4">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-4">
                        <Monogram className="h-14 w-auto sm:h-16" variant="light" />
                        <div>
                            <p className="font-display text-2xl tracking-[0.14em] text-cream-light font-bold">CANRES VIANDES</p>
                            <p className="eyebrow mt-1 text-brand-light font-semibold">« La viande comme il faut »</p>
                        </div>
                    </div>
                    <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/80">
                        Chez CANRES, notre mission est de rehausser l'expérience de la viande en offrant des produits artisanaux de haute qualité qui allient la tradition colombienne et le savoir-faire québécois.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-cream/60 uppercase tracking-wider">
                        <span>Artisanale</span> · <span>Gourmet</span> · <span>Accessible</span> · <span>Naturelle</span> · <span>Disruptive</span>
                    </div>
                    <div className="mt-6 flex gap-4 text-cream-light text-lg">
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-brand-light transition"><FaInstagram /></a>
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-brand-light transition"><FaFacebookF /></a>
                        <a href={`https://wa.me/${STORE_WHATSAPP}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="hover:text-brand-light transition"><FaWhatsapp /></a>
                    </div>
                </div>

                <div>
                    <p className="eyebrow text-cream-light font-bold">Cortes & Charcutería</p>
                    <ul className="mt-5 space-y-2.5 text-sm">
                        <li><Link to="/tienda" className="hover:text-brand-light text-brand-light font-medium">Catálogo Completo</Link></li>
                        {CATEGORIES.map((c) => (
                            <li key={c.slug}><Link to={`/tienda/${c.slug}`} className="hover:text-brand-light transition">{c.label}</Link></li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="eyebrow text-cream-light font-bold">Atención & Garantía</p>
                    <ul className="mt-5 space-y-2.5 text-sm">
                        <li>❄️ Cadena de frío estricta garantizada</li>
                        <li>🥩 Cortes frescos despostados al momento</li>
                        <li>🔥 Charcutería 100% artesanal sin gluten</li>
                        <li>⚖️ Pesaje exacto y empaque al vacío</li>
                        <li><Link to="/favoritos" className="hover:text-brand-light transition">Mis Cortes Favoritos</Link></li>
                        <li><Link to="/terminos" className="hover:text-brand-light transition font-medium">Políticas de Entrega y Calidad</Link></li>
                        <li className="pt-2">
                            <a
                                href={`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent('Hola CANRES Viandes, quiero hacer un pedido especial de carnes o charcutería 🥩')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 font-semibold text-brand-light hover:text-white transition"
                            >
                                <FaWhatsapp className="h-4 w-4 shrink-0" />
                                <span>Pedidos y Asesoría Butcher</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/10 py-6 text-center text-xs text-cream/50">
                <div className="container-luxe flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p>© {new Date().getFullYear()} CANRES Viandes. Boucherie Artisanale & Charcuterie. Tous droits réservés.</p>
                    <p className="tracking-widest uppercase text-[10px] text-cream/40">Tradition Colombienne · Savoir-Faire Québécois</p>
                </div>
            </div>
        </footer>
    );
}
