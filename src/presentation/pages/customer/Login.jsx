import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import { useAuth } from '@/presentation/context/AuthContext.jsx';
import { alertError, toastSuccess } from '@/presentation/utils/swal.js';
import Logo from '@/presentation/components/brand/Logo.jsx';
import GoogleIcon from '@/presentation/components/ui/GoogleIcon.jsx';

export default function Login() {
    const { signIn, signInWithGoogle, isAuthenticated } = useAuth();
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
            setErrorMsg('Ingresa tu correo y contraseña');
            return;
        }

        setLoading(true);
        try {
            await signIn(email, password);
            toastSuccess('¡Bienvenido de nuevo!');
            navigate(redirectUrl, { replace: true });
        } catch (err) {
            const msg = err.message || 'No se pudo iniciar sesión';
            setErrorMsg(msg);
            alertError('Error al iniciar sesión', msg);
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
            const msg = err.message || 'No se pudo conectar con Google';
            setErrorMsg(msg);
            alertError('Error con Google', msg);
            setGoogleLoading(false);
        }
    };

    return (
        <div className="container-luxe flex min-h-[75vh] items-center justify-center py-16">
            <div className="w-full max-w-md border border-taupe/20 bg-white/80 p-8 shadow-luxe backdrop-blur sm:p-10">
                <div className="text-center">
                    <Logo compact className="inline-block" />
                    <p className="eyebrow mt-4 text-taupe">Bienvenido a CANRES Viandes</p>
                    <h1 className="mt-2 text-3xl font-normal text-ink sm:text-4xl">Iniciar sesión</h1>
                    {redirectUrl.includes('checkout') && (
                        <p className="mt-3 rounded bg-brand-light/15 p-2.5 text-xs text-ink">
                            Inicia sesión para usar tus datos guardados, o{' '}
                            <Link to="/checkout" className="font-semibold underline">continúa como invitado</Link>.
                        </p>
                    )}
                </div>

                {errorMsg && (
                    <div className="mt-6 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        {errorMsg}
                    </div>
                )}

                {/* Botón Iniciar Sesión con Google (Estilo OCAPLUS) */}
                <div className="mt-8">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading || googleLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-cream/40 text-ink font-semibold py-3.5 px-4 border border-taupe/30 shadow-sm transition-all hover:shadow hover:border-brand-wine/50 disabled:opacity-50 text-xs uppercase tracking-wider"
                    >
                        <GoogleIcon className="w-5 h-5 shrink-0" />
                        <span>{googleLoading ? 'Conectando con Google…' : 'Continuar con Google'}</span>
                    </button>
                </div>

                <div className="relative my-6 flex items-center justify-center">
                    <div className="border-t border-taupe/20 w-full" />
                    <span className="bg-white px-3 text-[10px] text-taupe font-bold uppercase tracking-wider absolute">
                        o con correo
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.15em] text-ink/70">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            className="input"
                        />
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-ink/70">
                                Contraseña
                            </label>
                            <Link
                                to={`/recuperar-contrasena${email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ''}`}
                                className="text-xs text-taupe transition hover:text-ink hover:underline"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input pr-11"
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

                    <button
                        type="submit"
                        disabled={loading || googleLoading}
                        className="btn-dark w-full py-4 text-xs"
                    >
                        {loading ? 'Iniciando sesión…' : 'Ingresar'}
                    </button>
                </form>

                <div className="mt-8 space-y-4 border-t border-taupe/15 pt-6 text-center text-xs text-taupe">
                    <p>
                        ¿No tienes una cuenta aún?{' '}
                        <Link
                            to={`/registro${redirectUrl !== '/cuenta' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                            className="font-medium text-ink underline transition hover:text-brand-wine"
                        >
                            Crear cuenta gratis
                        </Link>
                    </p>

                    <p>
                        <Link to="/tienda" className="text-ink/60 underline hover:text-ink">
                            Volver a la tienda
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
