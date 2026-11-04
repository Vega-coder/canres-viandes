import { HiSparkles } from 'react-icons/hi2';

/**
 * Avatar interactivo del Maestro Carnicero CANRES.
 * Cambia dinámicamente entre la pose de concentración (pensando/cortando carne)
 * y la pose sonriente presentando la carne (hablando/bienvenida).
 */
export default function ButcherAvatar({
    status = 'idle', // 'idle' | 'thinking' | 'speaking'
    size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    showStatusDot = true,
    showEqualizer = true,
    className = '',
    onClick,
}) {
    // Si está pensando, mira hacia abajo a los cortes de carne
    // Si está hablando o en reposo, mira al frente sonriendo y presentando el corte
    const isThinking = status === 'thinking';
    const isSpeaking = status === 'speaking';

    const imageSrc = isThinking
        ? '/images/butcher/butcher-thinking.jpg'
        : '/images/butcher/butcher-presenting.jpg';

    // Medidas según el tamaño
    const sizeClasses = {
        xs: 'h-7 w-7',
        sm: 'h-9 w-9',
        md: 'h-11 w-11',
        lg: 'h-14 w-14',
        xl: 'h-20 w-20',
    }[size] || 'h-11 w-11';

    return (
        <div
            className={`relative inline-flex shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                isSpeaking
                    ? 'border-gold shadow-lg shadow-gold/30 animate-gold-ring'
                    : isThinking
                    ? 'border-amber-400/80 shadow-md shadow-amber-500/20'
                    : 'border-gold/50 shadow-sm'
            } ${sizeClasses} ${className}`}
            onClick={onClick}
        >
            {/* Contenedor de la imagen con recorte óptimo centrado en el rostro del carnicero */}
            <div className="h-full w-full overflow-hidden rounded-full bg-[#201C19]">
                <img
                    src={imageSrc}
                    alt="Maestro Carnicero CANRES Viandes"
                    className={`h-full w-full object-cover object-[50%_16%] transition-all duration-500 ${
                        isSpeaking ? 'scale-105 animate-mascot-talk' : isThinking ? 'scale-100 brightness-95' : 'scale-100 hover:scale-105'
                    }`}
                    loading="eager"
                />
            </div>

            {/* Ecualizador de ondas de voz cuando está hablando */}
            {isSpeaking && showEqualizer && (
                <div
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-[1px] transition-opacity"
                    title="Hablando..."
                >
                    <div className="flex items-center gap-[2px]">
                        <span className="w-[2.5px] rounded-full bg-gold-light animate-soundwave-1" />
                        <span className="w-[2.5px] rounded-full bg-white animate-soundwave-2" />
                        <span className="w-[2.5px] rounded-full bg-gold-light animate-soundwave-3" />
                        <span className="w-[2.5px] rounded-full bg-white animate-soundwave-4" />
                    </div>
                </div>
            )}

            {/* Icono de cuchillo / destello cuando está pensando / preparando */}
            {isThinking && (
                <div
                    className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-wine text-[9px] text-white shadow-xs border border-gold/40"
                    title="Preparando corte y respuesta..."
                >
                    🔪
                </div>
            )}

            {/* Punto de estado en vivo (verde en reposo, ámbar al pensar, oro al hablar) */}
            {showStatusDot && !isThinking && (
                <span
                    className={`absolute bottom-0 right-0 flex h-3 w-3 items-center justify-center rounded-full border-2 border-[#171513] ${
                        isSpeaking ? 'bg-gold' : 'bg-emerald-500'
                    }`}
                >
                    <span
                        className={`h-full w-full rounded-full ${
                            isSpeaking ? 'animate-ping bg-gold opacity-75' : 'animate-pulse bg-emerald-400 opacity-60'
                        }`}
                    />
                </span>
            )}
        </div>
    );
}
