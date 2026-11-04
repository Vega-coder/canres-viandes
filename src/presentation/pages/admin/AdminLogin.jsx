import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import Monogram from '@/presentation/components/brand/Monogram.jsx';
import GoogleIcon from '@/presentation/components/ui/GoogleIcon.jsx';
import { useAdminAuth } from '@/presentation/context/AdminAuthContext.jsx';
import { useCases, isDemoMode } from '@/infrastructure/container.js';

export default function AdminLogin() {
    const { admin, loading, signIn } = useAdminAuth();
    const navigate = useNavigate();
    const { state } = useLocation();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    if (!loading && admin) return <Navigate to={state?.from ?? '/admin'} replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await signIn(form.email, form.password);
            navigate(state?.from ?? '/admin', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setGoogleLoading(true);
        try {
            await useCases.signInWithGoogle('/admin');
        } catch (err) {
            setError(err.message || 'Error al conectar con Google');
            setGoogleLoading(false);
        }
    };

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-ink via-ink-soft to-ink-muted px-4">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center text-center">
                    <Monogram className="h-20 w-auto" variant="light" />
                    <p className="mt-6 font-display text-2xl tracking-[0.12em] text-cream-light">CANRES VIANDES</p>
                    <p className="eyebrow mt-2 text-gold">Panel de administración</p>
                </div>

                <div className="mt-10 bg-cream-light p-6 shadow-luxe sm:p-8">
                    {!isDemoMode && (
                        <>
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={googleLoading || submitting}
                                className="w-full flex items-center justify-center gap-3 border border-ink/20 bg-white py-3.5 px-4 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ink shadow-sm transition hover:bg-cream-soft hover:border-ink/40 disabled:opacity-50"
                            >
                                <GoogleIcon className="h-5 w-5 shrink-0" />
                                <span>{googleLoading ? 'Conectando con Google…' : 'Acceder con Google'}</span>
                            </button>

                            <div className="relative my-6 flex items-center justify-center">
                                <div className="w-full border-t border-taupe/20" />
                                <span className="absolute bg-cream-light px-3 text-[10px] uppercase tracking-[0.15em] text-taupe">
                                    o con credenciales
                                </span>
                            </div>
                        </>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="block">
                            <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.15em] text-ink/70">Correo</span>
                            <input name="email" type="email" autoComplete="username" value={form.email} onChange={onChange} className="input" required />
                        </label>
                        <div>
                            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.15em] text-ink/70">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={onChange}
                                    className="input pr-11"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-taupe transition hover:text-ink focus:outline-none"
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                >
                                    {showPassword ? (
                                        <HiOutlineEyeSlash className="h-5 w-5" />
                                    ) : (
                                        <HiOutlineEye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-800" role="alert">{error}</p>}
                        <button type="submit" className="btn-dark w-full py-4" disabled={submitting}>
                            {submitting ? 'Ingresando…' : 'Ingresar'}
                        </button>
                        {isDemoMode && (
                            <p className="text-center text-[11px] text-taupe">
                                Modo demo: usa las credenciales de <code>VITE_DEMO_ADMIN_*</code> en <code>.env</code> (ver README).
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
