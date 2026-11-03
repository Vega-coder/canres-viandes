// Monograma oficial: silueta de toro rojo de CANRES Viandes.
export default function Monogram({ className = 'h-11 w-auto', variant = 'gold', title = 'CANRES Viandes' }) {
    return (
        <img
            src="/brand/bull-icon.png"
            alt={title}
            className={`inline-block object-contain select-none ${className}`}
            draggable="false"
            loading="eager"
        />
    );
}
