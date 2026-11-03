export default function ProductImage({ product, className = '' }) {
    const image = product?.images?.[0] ?? product?.image;

    return (
        <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FAF6EB] to-[#F0EAE1] ${className}`}>
            {image ? (
                <img
                    src={image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/meat/meat_beef_cut.jpg';
                    }}
                />
            ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                    <img src="/brand/bull-icon.png" alt="CANRES" className="h-12 w-auto opacity-70" />
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-brand-wine mt-2">CANRES</span>
                </div>
            )}
        </div>
    );
}
