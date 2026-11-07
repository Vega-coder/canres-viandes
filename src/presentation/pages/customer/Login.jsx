import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import { useAuth } from '@/presentation/context/AuthContext.jsx';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import { alertError, toastSuccess } from '@/presentation/utils/swal.js';
import Logo from '@/presentation/components/brand/Logo.jsx';
import GoogleIcon from '@/presentation/components/ui/GoogleIcon.jsx';

export default function Login() {
    const { signIn, signInWithGoogle, isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/cuenta';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigate(redirectUrl, { replace: true });
        }
    }, [isAuthenticated, navigate, redirectUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (!email.trim() || !password) {
            setErrorMsg(t('auth.email_label') + ' & ' + t('auth.password_label'));
            return;
        }

        setLoading(true);
        try {
            await signIn(email, password);
            toastSuccess(t('auth.welcome_back'));
            navigate(redirectUrl, { replace: true });
        } catch (err) {
            const msg = err.message || t('auth.login_title');
            setErrorMsg(msg);
            alertError(t('auth.login_title'), msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
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

    return (
        <div className="container-luxe flex min-h-[75vh] items-center justify-center py-16">
            <div className="w-full max-w-md border border-taupe/20 bg-white/80 p-8 shadow-luxe backdrop-blur sm:p-10">
                <div className="text-center">
                    <Logo compact className="inline-block" />
                    <p className="eyebrow mt-4 text-taupe">{t('auth.login_subtitle')}</p>
                    <h1 className="mt-2 text-3xl font-normal text-ink sm:text-4xl">{t('auth.login_title')}</h1>
                </div>

                {errorMsg && (
                    <div className="mt-6 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        {errorMsg}
                    </div>
                )}

                <div className="mt-8">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
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

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.15em] text-ink/70">
                            {t('auth.email_label')}
                        </label>
                        <input
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('auth.email_placeholder')}
                            className="input"
                        />
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-ink/70">
                                {t('auth.password_label')}
                            </label>
                            <Link
                                to={`/recuperar-contrasena${email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ''}`}
                                className="text-xs text-taupe transition hover:text-ink hover:underline"
                            >
                                {t('auth.forgot_password')}
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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

                    <button
                        type="submit"
                        disabled={loading || googleLoading}
                        className="btn-dark w-full py-4 text-xs"
                    >
                        {loading ? t('auth.submitting_login') : t('auth.submit_login')}
                    </button>
                </form>

                <div className="mt-8 space-y-4 border-t border-taupe/15 pt-6 text-center text-xs text-taupe">
                    <p>
                        {t('auth.no_account')}{' '}
                        <Link
                            to={`/registro${redirectUrl !== '/cuenta' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                            className="font-medium text-ink underline transition hover:text-brand-wine"
                        >
                            {t('auth.register_here')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
