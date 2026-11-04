// Monograma oficial: silueta de toro de CANRES Viandes.
// variant="light" | "white" para fondos oscuros (blanco de alto contraste), variant="dark" | "red" para fondos claros.
export default function Monogram({ className = 'h-11 w-auto', variant = 'dark', title = 'CANRES Viandes' }) {
    const isLight = variant === 'light' || variant === 'white';
    const filterClass = isLight ? 'brightness-0 invert' : '';

    return (
        <img
            src="/brand/bull-icon.png"
            alt={title}
            className={`inline-block object-contain select-none shrink-0 aspect-square ${filterClass} ${className}`.trim()}
            draggable="false"
            loading="eager"
        />
    );
}
