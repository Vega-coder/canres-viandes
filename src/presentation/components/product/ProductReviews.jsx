import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    HiStar,
    HiOutlineStar,
    HiCheckBadge,
    HiHandThumbUp,
    HiOutlinePencilSquare,
    HiOutlineXMark,
    HiSparkles,
    HiOutlineChatBubbleBottomCenterText,
    HiOutlineLockClosed,
} from 'react-icons/hi2';
import { useCases } from '@/infrastructure/container.js';
import { useAuth } from '@/presentation/context/AuthContext.jsx';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import { alertError, toast } from '@/presentation/utils/swal.js';

export default function ProductReviews({ product, productId, productName }) {
    const { t, translateProduct } = useLanguage();
    const localizedProduct = product ? translateProduct(product) : null;
    const targetId = localizedProduct?.id || productId;
    const targetName = localizedProduct?.name || productName || 'Corte';
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [helpfulVotes, setHelpfulVotes] = useState({});

    // Form state
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [author, setAuthor] = useState('');
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [cookingMethod, setCookingMethod] = useState('Gril / BBQ');
    const [submitted, setSubmitted] = useState(false);

    const currentUrl = `${location.pathname}${location.search || ''}#reviews`;
    const loginUrl = `/login?redirect=${encodeURIComponent(currentUrl)}`;
    const registerUrl = `/registro?redirect=${encodeURIComponent(currentUrl)}`;

    useEffect(() => {
        if (user && !author) {
            setAuthor(user.fullName || user.email?.split('@')[0] || '');
        }
    }, [user, author]);

    useEffect(() => {
        let mounted = true;
        if (!targetId) {
            setLoading(false);
            return undefined;
        }

        setLoading(true);

        useCases.getProductReviews(targetId)
            .then((data) => {
                if (mounted) {
                    setReviews(data || []);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (mounted) {
                    setReviews([]);
                    setLoading(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, [targetId]);

    const stats = useMemo(() => {
        if (!reviews.length) {
            return { average: '5.0', total: 0, distribution: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 } };
        }
        const total = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
        const average = (sum / total).toFixed(1);

        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach((r) => {
            const star = Math.min(5, Math.max(1, Math.round(Number(r.rating || 5))));
            counts[star] = (counts[star] || 0) + 1;
        });

        const distribution = {};
        for (let star = 5; star >= 1; star--) {
            distribution[star] = Math.round((counts[star] / total) * 100);
        }

        return { average, total, distribution };
    }, [reviews]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            alertError(t('reviews.exclusive_badge'), t('reviews.login_prompt_desc'));
            return;
        }

        if (!author.trim() || !comment.trim() || submitting) return;

        setSubmitting(true);
        try {
            const saved = await useCases.submitProductReview({
                productId: targetId,
                author: author.trim(),
                rating,
                title: title.trim() || 'Excellente qualité de coupe',
                comment: comment.trim(),
                longevity: cookingMethod,
                sillage: 'Persillage supérieur',
            });

            setReviews((prev) => [saved, ...prev]);
            setTitle('');
            setComment('');
            setRating(5);
            setFormOpen(false);
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err) {
            console.error('Error al enviar reseña:', err);
            alertError('Error', err.message || 'Error al guardar');
        } finally {
            setSubmitting(false);
        }
    };

    const handleVoteHelpful = async (id) => {
        if (!isAuthenticated) {
            toast(t('reviews.login_prompt_title'), 'info');
            return;
        }

        if (helpfulVotes[id]) return;
        setHelpfulVotes((prev) => ({ ...prev, [id]: true }));

        setReviews((prev) =>
            prev.map((r) => (r.id === id ? { ...r, helpful: (r.helpful || 0) + 1 } : r))
        );

        try {
            await useCases.voteReviewHelpful(id);
        } catch {
            // Ignorar
        }
    };

    return (
        <section id="reviews" className="border-t border-taupe/15 bg-white py-16 sm:py-20 scroll-mt-24">
            <div className="container-luxe">
                {/* Encabezado de la sección */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-taupe/15 pb-8">
                    <div>
                        <p className="eyebrow text-gold-dark flex items-center gap-1.5">
                            <HiSparkles className="h-4 w-4" />
                            {t('reviews.eyebrow')}
                        </p>
                        <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold uppercase tracking-[0.15em] text-ink">
                            {t('reviews.title', { name: targetName })}
                        </h2>
                        <p className="mt-1 text-xs text-taupe">
                            {t('reviews.subtitle')}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setFormOpen((prev) => !prev)}
                        className="btn-dark flex items-center justify-center gap-2 self-start md:self-auto px-6 py-3 text-xs tracking-wider shadow-sm hover:scale-105 transition duration-300"
                    >
                        {isAuthenticated ? (
                            <>
                                <HiOutlinePencilSquare className="h-4 w-4 text-gold" />
                                <span>{formOpen ? t('reviews.close_form') : t('reviews.write_btn')}</span>
                            </>
                        ) : (
                            <>
                                <HiOutlineLockClosed className="h-4 w-4 text-gold" />
                                <span>{formOpen ? t('reviews.close_notice') : t('reviews.write_btn')}</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Mensaje de confirmación tras publicar */}
                {submitted && (
                    <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-50/80 p-4 text-center text-xs font-medium text-emerald-800 animate-fade-up">
                        {t('reviews.thanks_message')}
                    </div>
                )}

                {/* Aviso para usuarios no registrados o invitados */}
                {formOpen && !isAuthenticated && (
                    <div className="mt-8 rounded-2xl border border-gold/40 bg-cream/40 p-6 sm:p-8 animate-fade-up shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-dark ring-4 ring-gold/10">
                                    <HiOutlineLockClosed className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-dark">
                                            {t('reviews.exclusive_badge')}
                                        </span>
                                        <span className="text-[11px] text-taupe">{t('reviews.registered_only')}</span>
                                    </div>
                                    <h3 className="mt-1.5 font-display text-lg font-bold text-ink">
                                        {t('reviews.login_prompt_title')}
                                    </h3>
                                    <p className="mt-1 text-xs text-taupe leading-relaxed max-w-xl">
                                        {t('reviews.login_prompt_desc')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto shrink-0">
                                <Link
                                    to={loginUrl}
                                    className="btn-dark flex-1 sm:flex-none text-center px-5 py-2.5 text-xs font-semibold tracking-wider hover:scale-105 transition duration-300"
                                >
                                    {t('reviews.btn_login')}
                                </Link>
                                <Link
                                    to={registerUrl}
                                    className="btn-outline flex-1 sm:flex-none text-center px-5 py-2.5 text-xs font-semibold tracking-wider hover:scale-105 transition duration-300"
                                >
                                    {t('reviews.btn_register')}
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setFormOpen(false)}
                                    className="text-taupe hover:text-ink p-1 hidden sm:block"
                                    aria-label={t('reviews.close_notice')}
                                >
                                    <HiOutlineXMark className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulario de nueva reseña para usuarios autenticados */}
                {formOpen && isAuthenticated && (
                    <div className="mt-8 rounded-2xl border border-gold/40 bg-cream-light/40 p-6 sm:p-8 animate-fade-up shadow-sm">
                        <div className="flex items-center justify-between border-b border-taupe/15 pb-4">
                            <div>
                                <h3 className="font-display text-lg font-bold text-ink">{t('reviews.title', { name: targetName })}</h3>
                                <p className="mt-0.5 text-xs text-taupe flex items-center gap-1.5">
                                    <HiCheckBadge className="h-4 w-4 text-emerald-600" />
                                    <span>{user?.fullName || user?.email}</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormOpen(false)}
                                className="text-taupe hover:text-ink"
                                aria-label={t('reviews.close_form')}
                            >
                                <HiOutlineXMark className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                                    {t('reviews.rating_label')} *
                                </label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 transition-transform hover:scale-125"
                                            aria-label={`Rating ${star}`}
                                        >
                                            {star <= (hoverRating || rating) ? (
                                                <HiStar className="h-7 w-7 text-amber-500" />
                                            ) : (
                                                <HiOutlineStar className="h-7 w-7 text-taupe/40" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                                        {t('reviews.name_label')} *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        className="input w-full py-2.5 text-xs bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                                        Mode de cuisson / Preparación
                                    </label>
                                    <select
                                        value={cookingMethod}
                                        onChange={(e) => setCookingMethod(e.target.value)}
                                        className="input w-full py-2.5 text-xs bg-white"
                                    >
                                        <option value="Gril / BBQ">Gril / BBQ</option>
                                        <option value="Four / Rôtissoire">Four / Horno</option>
                                        <option value="Poêle en fonte">Poêle / Sartén</option>
                                        <option value="Fumoir">Fumoir / Ahumador</option>
                                        <option value="Mijoté / Sancocho">Mijoté / Sancocho</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                                    {t('reviews.title_label')}
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={t('reviews.title_placeholder')}
                                    className="input w-full py-2.5 text-xs bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                                    {t('reviews.comment_label')} *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder={t('reviews.comment_placeholder')}
                                    className="input w-full py-2.5 text-xs bg-white leading-relaxed"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setFormOpen(false)}
                                    className="btn-outline px-5 py-2.5 text-xs"
                                >
                                    {t('catalog.close_filters')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-gold px-6 py-2.5 text-xs font-semibold disabled:opacity-50"
                                >
                                    {submitting ? t('reviews.submitting') : t('reviews.submit_btn')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Resumen de Calificaciones y Desglose si hay reseñas */}
                {stats.total > 0 && (
                    <div className="mt-10 grid gap-8 rounded-2xl border border-taupe/15 bg-cream/15 p-6 sm:p-8 md:grid-cols-12 md:items-center">
                        <div className="flex flex-col items-center justify-center text-center md:col-span-4 md:border-r md:border-taupe/15 md:pr-8">
                            <span className="font-display text-5xl sm:text-6xl font-extrabold text-ink">
                                {stats.average}
                            </span>
                            <div className="mt-2 flex items-center gap-1 text-amber-500">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <HiStar key={s} className="h-5 w-5" />
                                ))}
                            </div>
                            <p className="mt-2 text-xs font-medium text-taupe">
                                {stats.total} {stats.total === 1 ? 'avis' : 'avis'}
                            </p>
                        </div>

                        <div className="space-y-2 md:col-span-5 md:px-4">
                            {[5, 4, 3, 2, 1].map((stars) => {
                                const pct = stats.distribution[stars] || 0;
                                return (
                                    <div key={stars} className="flex items-center gap-3 text-xs">
                                        <span className="flex w-12 items-center gap-1 text-taupe font-medium">
                                            {stars} <HiStar className="h-3.5 w-3.5 text-amber-500" />
                                        </span>
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream/60">
                                            <div
                                                className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="w-9 text-right text-taupe font-mono text-[11px]">{pct}%</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="space-y-3 rounded-xl bg-white p-4 text-xs md:col-span-3 shadow-xs border border-taupe/10">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-taupe">Qualité Boucherie Artisanale</p>
                            <div className="flex justify-between border-b border-taupe/10 pb-1.5">
                                <span className="text-taupe">Tendreté :</span>
                                <span className="font-semibold text-ink">9.9 / 10</span>
                            </div>
                            <div className="flex justify-between border-b border-taupe/10 pb-1.5">
                                <span className="text-taupe">Jutosité :</span>
                                <span className="font-semibold text-ink">9.8 / 10</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-taupe">Fraîcheur :</span>
                                <span className="font-semibold text-emerald-700">100% Frais AAA</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Estado vacío: Sin reseñas aún para este corte */}
                {!loading && reviews.length === 0 && (
                    <div className="mt-10 rounded-2xl border border-taupe/15 bg-white p-10 text-center shadow-xs">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream/50 text-gold-dark">
                            <HiOutlineChatBubbleBottomCenterText className="h-7 w-7" />
                        </div>
                        <h4 className="mt-4 font-display text-lg font-bold text-ink">
                            {t('reviews.no_reviews')}
                        </h4>
                        {isAuthenticated ? (
                            <button
                                type="button"
                                onClick={() => setFormOpen(true)}
                                className="btn-gold mt-6 px-6 py-2.5 text-xs font-semibold hover:scale-105 transition duration-300"
                            >
                                {t('reviews.write_btn')}
                            </button>
                        ) : (
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                                <Link
                                    to={loginUrl}
                                    className="btn-dark inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold hover:scale-105 transition duration-300"
                                >
                                    <HiOutlineLockClosed className="h-4 w-4 text-gold" />
                                    {t('reviews.btn_login')}
                                </Link>
                                <Link
                                    to={registerUrl}
                                    className="btn-outline px-6 py-2.5 text-xs font-semibold hover:scale-105 transition duration-300"
                                >
                                    {t('reviews.btn_register')}
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Lista de reseñas individuales desde la BD */}
                {!loading && reviews.length > 0 && (
                    <div className="mt-12 space-y-6">
                        {reviews.map((rev) => (
                            <article
                                key={rev.id}
                                className="rounded-2xl border border-taupe/15 bg-white p-6 shadow-xs transition duration-300 hover:border-gold/40 hover:shadow-sm"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 font-display text-sm font-bold text-gold-dark ring-2 ring-gold/30">
                                            {rev.author.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-ink text-sm">{rev.author}</h4>
                                                {rev.verified && (
                                                    <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                                        <HiCheckBadge className="h-3.5 w-3.5" />
                                                        {t('reviews.verified_buyer')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-taupe">
                                                <span>{rev.city || 'Canada'}</span>
                                                <span>·</span>
                                                <span>{rev.date || 'Récent'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-0.5 text-amber-500">
                                        {[...Array(5)].map((_, i) => (
                                            <HiStar
                                                key={i}
                                                className={`h-4 w-4 ${i < Number(rev.rating) ? 'text-amber-500' : 'text-taupe/20'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <h5 className="mt-4 font-display text-base font-bold text-ink">
                                    “{rev.title}”
                                </h5>
                                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-taupe-dark/90">
                                    {rev.comment}
                                </p>

                                <div className="mt-4 flex items-center justify-between border-t border-taupe/10 pt-3 text-xs text-taupe">
                                    <span>{t('reviews.helpful_btn', { count: rev.helpful || 0 })}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleVoteHelpful(rev.id)}
                                        disabled={helpfulVotes[rev.id]}
                                        className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition ${
                                            helpfulVotes[rev.id]
                                                ? 'text-gold-dark font-semibold bg-gold/10'
                                                : 'hover:text-ink hover:bg-cream/40'
                                        }`}
                                    >
                                        <HiHandThumbUp className="h-3.5 w-3.5" />
                                        <span>{rev.helpful || 0}</span>
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
