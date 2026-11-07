import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import Swal from 'sweetalert2';
import { useAuth } from '@/presentation/context/AuthContext.jsx';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import { alertError, toastSuccess } from '@/presentation/utils/swal.js';
import Logo from '@/presentation/components/brand/Logo.jsx';
import GoogleIcon from '@/presentation/components/ui/GoogleIcon.jsx';

export default function Register() {
    const { signUp, signInWithGoogle, isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/cuenta';

    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigate(redirectUrl, { replace: true });
        }
    }, [isAuthenticated, navigate, redirectUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errorMsg) setErrorMsg('');
    };

    const handleGoogleAuth = async () => {
        setErrorMsg('');
        setGoogleLoading(true);
        try {
            await signInWithGoogle(redirectUrl);
        } catch (err) {
            const msg = err.message || 'Google Auth Error';
            setErrorMsg(msg);
            alertError('Google Auth', msg);
            setGoogleLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!form.fullName.trim()) {
            setErrorMsg(t('auth.fullname_label'));
            return;
        }
        if (!form.email.trim()) {
            setErrorMsg(t('auth.email_label'));
            return;
        }
        if (!form.password || form.password.length < 6) {
            setErrorMsg('Password min 6');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setErrorMsg('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await signUp({
                email: form.email.trim(),
                password: form.password,
                fullName: form.fullName.trim(),
                phone: form.phone.trim(),
            });

            toastSuccess(t('auth.register_success'));
            navigate(redirectUrl, { replace: true });
        } catch (err) {
            const msg = err.message || 'Error';
            setErrorMsg(msg);
            alertError(t('auth.register_title'), msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-luxe flex min-h-[80vh] items-center justify-center py-16">
            <div className="w-full max-w-md border border-taupe/20 bg-white/80 p-8 shadow-luxe backdrop-blur sm:p-10">
                <div className="text-center">
                    <Logo compact className="inline-block" />
                    <p className="eyebrow mt-4 text-taupe">{t('auth.register_subtitle')}</p>
                    <h1 className="mt-2 text-3xl font-normal text-ink sm:text-4xl">{t('auth.register_title')}</h1>
                </div>

                {errorMsg && (
                    <div className="mt-6 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        {errorMsg}
                    </div>
                )}

                <div className="mt-8">
                    <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={loading || googleLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-cream/40 text-ink font-semibold py-3.5 px-4 border border-taupe/30 shadow-sm transition-all hover:shadow hover:border-brand-wine/50 disabled:opacity-50 text-xs uppercase tracking-wider"
                    >
                        <GoogleIcon className="w-5 h-5 shrink-0" />
                        <span>{googleLoading ? '…' : t('auth.google_login')}</span>
                    </button>
                </div>

                <div className="relative my-6 flex items-center justify-center">
                    <div className="border-t border-taupe/20 w-full" />
                    <span className="bg-white px-3 text-[10px] text-taupe font-bold uppercase tracking-wider absolute">
                        {t('auth.email_label')}
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em] text-ink/70">
                            {t('auth.fullname_label')} *
                        </label>
                        <input
                            name="fullName"
                            type="text"
                            required
                            autoComplete="name"
                            value={form.fullName}
                            onChange={handleChange}
                            placeholder={t('auth.fullname_placeholder')}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em] text-ink/70">
                            {t('auth.phone_label')}
                        </label>
                        <input
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            inputMode="numeric"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder={t('auth.phone_placeholder')}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em] text-ink/70">
                            {t('auth.email_label')} *
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder={t('auth.email_placeholder')}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em] text-ink/70">
                            {t('auth.password_label')} *
                        </label>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="new-password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder={t('auth.password_placeholder')}
                                className="input pr-11"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-taupe transition hover:text-ink focus:outline-none"
                            >
                                {showPassword ? (
                                    <HiOutlineEyeSlash className="h-5 w-5" />
                                ) : (
                                    <HiOutlineEye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em] text-ink/70">
                            {t('auth.confirm_password_label')} *
                        </label>
                        <div className="relative">
                            <input
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                autoComplete="new-password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder={t('auth.password_placeholder')}
                                className="input pr-11"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-taupe transition hover:text-ink focus:outline-none"
                            >
                                {showConfirmPassword ? (
                                    <HiOutlineEyeSlash className="h-5 w-5" />
                                ) : (
                                    <HiOutlineEye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || googleLoading}
                        className="btn-dark mt-2 w-full py-4 text-xs"
                    >
                        {loading ? t('auth.submitting_register') : t('auth.submit_register')}
                    </button>
                </form>

                <div className="mt-8 border-t border-taupe/15 pt-6 text-center text-xs text-taupe">
                    <p>
                        {t('auth.already_have_account')}{' '}
                        <Link
                            to={`/login${redirectUrl !== '/cuenta' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                            className="font-medium text-ink underline transition hover:text-brand-wine"
                        >
                            {t('auth.login_here')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
