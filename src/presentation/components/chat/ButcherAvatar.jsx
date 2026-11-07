/**
 * Avatar interactivo y animado del Maestro Carnicero CANRES.
 * Utiliza animaciones WebP fluidas en bucle:
 * - Idle: respiración orgánica, balanceo de la carne y parpadeo natural.
 * - Speaking: boca abierta con dientes y lengua, movimiento real de mandíbula y cabeceo.
 * - Thinking: rebanado artesanal con cuchillo de chef en la tabla.
 */
export default function ButcherAvatar({
    status = 'idle', // 'idle' | 'thinking' | 'speaking'
    activeAction = 'idle', // 'idle' | 'welcome' | 'meat' | 'sausages'
    size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    showStatusDot = true,
    showEqualizer = true,
    className = '',
    onClick,
}) {
    const isThinking = status === 'thinking';
    const isSpeaking = status === 'speaking';

    let imageSrc = '/images/butcher/butcher-idle.webp';
    if (isThinking) {
        imageSrc = '/images/butcher/butcher-thinking.webp';
    } else if (activeAction === 'sausages') {
        imageSrc = '/images/butcher/butcher-sausages.webp';
    } else if (activeAction === 'meat' || activeAction === 'ok') {
        imageSrc = '/images/butcher/butcher-ok.webp';
    } else if (activeAction === 'welcome') {
        imageSrc = '/images/butcher/butcher-welcome.webp';
    }

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
                    ? 'border-gold shadow-lg shadow-gold/40 animate-gold-ring scale-[1.03]'
                    : isThinking
                    ? 'border-amber-400/90 shadow-md shadow-amber-500/25'
                    : 'border-gold/50 shadow-sm hover:scale-105 hover:border-gold'
            } ${sizeClasses} ${className}`}
            onClick={onClick}
        >
            {/* Contenedor circular con encuadre óptimo en el rostro animado */}
            <div className="h-full w-full overflow-hidden rounded-full bg-[#1A1614]">
                <img
                    src={imageSrc}
                    alt="Maestro Carnicero interactivo CANRES Viandes"
                    className="h-full w-full object-cover object-[50%_18%] transition-transform duration-300"
                    loading="eager"
                />
            </div>

            {/* Icono de cuchillo cortando cuando está pensando */}
            {isThinking && (
                <div
                    className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-wine text-[9px] text-white shadow-xs border border-gold/40 animate-bounce"
                    title="Preparando corte y respuesta..."
                >
                    🔪
                </div>
            )}

            {/* Punto de estado en vivo */}
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
