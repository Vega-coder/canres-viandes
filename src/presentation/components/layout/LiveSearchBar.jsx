import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass, HiOutlineXMark, HiOutlineArrowRight } from 'react-icons/hi2';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';
import { useCases } from '@/infrastructure/container.js';
import { matchesQuery, calculateQueryScore } from '@/domain/catalog/filters.js';
import { getFinalPrice } from '@/domain/catalog/product.js';
import { CATEGORIES } from '@/domain/catalog/categories.js';

export default function LiveSearchBar({ onDone, autoFocus = false, isMobile = false }) {
    const { t, formatMoney } = useLanguage();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [catalog, setCatalog] = useState([]);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Cargar catálogo en memoria para búsqueda instantánea en la lupa (0ms de latencia, usa caché)
    useEffect(() => {
        let active = true;
        useCases.browseCatalog()
            .then((res) => {
                if (active && Array.isArray(res?.products)) {
                    setCatalog(res.products);
                }
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, []);

    // Autofocus en móvil si se abre la barra
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    // Cerrar al hacer clic fuera o presionar Escape
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const trimmed = query.trim();

    // Productos coincidentes ordenados por relevancia
    const { matchingProducts, matchingCategory } = useMemo(() => {
        if (!trimmed || catalog.length === 0) {
            return { matchingProducts: [], matchingCategory: null };
        }

        const filtered = catalog.filter((p) => matchesQuery(p, trimmed));
        const sorted = [...filtered].sort((a, b) => calculateQueryScore(b, trimmed) - calculateQueryScore(a, trimmed));

        // Detectar si la búsqueda coincide directamente con una categoría
        const qNorm = trimmed.toLowerCase();
        let catMatch = null;
        for (const cat of CATEGORIES) {
            if (
                cat.slug.includes(qNorm) ||
                cat.short?.toLowerCase().includes(qNorm) ||
                cat.label?.toLowerCase().includes(qNorm) ||
                (qNorm.includes('pollo') && cat.slug === 'pollo') ||
                (qNorm.includes('res') && cat.slug === 'res') ||
                (qNorm.includes('cerdo') && cat.slug === 'cerdo') ||
                (qNorm.includes('chorizo') && cat.slug === 'chorizos') ||
                (qNorm.includes('chivo') && cat.slug === 'chivo')
            ) {
                const count = catalog.filter((p) => p.gender === cat.slug).length;
                catMatch = { ...cat, count };
                break;
            }
        }

        return {
            matchingProducts: sorted,
            matchingCategory: catMatch,
        };
    }, [trimmed, catalog]);

    const submit = (e) => {
        e?.preventDefault?.();
        const q = trimmed;
        setIsOpen(false);
        navigate(q ? `/tienda?q=${encodeURIComponent(q)}` : '/tienda');
        onDone?.();
    };

    const handleSelectProduct = (slug) => {
        setIsOpen(false);
        setQuery('');
        navigate(`/producto/${slug}`);
        onDone?.();
    };

    const handleSelectCategory = (slug) => {
        setIsOpen(false);
        setQuery('');
        navigate(slug ? `/tienda/${slug}` : '/tienda');
        onDone?.();
    };

    const clearQuery = () => {
        setQuery('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div ref={containerRef} className={`relative ${isMobile ? 'w-full' : 'w-full'}`}>
            <form onSubmit={submit} className="relative flex items-center" role="search">
                <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (trimmed) setIsOpen(true);
                    }}
                    placeholder={t('nav.search_placeholder')}
                    className="input py-2 pl-3.5 pr-14 text-xs w-full rounded-full border-taupe/25 focus:border-brand-wine shadow-xs transition-all"
                    aria-label={t('nav.search_aria')}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    enterKeyHint="search"
                />

                <div className="absolute right-2 flex items-center gap-1">
                    {trimmed && (
                        <button
                            type="button"
                            onClick={clearQuery}
                            className="p-1 text-taupe hover:text-ink transition"
                            aria-label="Limpiar búsqueda"
                            title="Limpiar"
                        >
                            <HiOutlineXMark className="h-3.5 w-3.5" />
                        </button>
                    )}
                    <button
                        type="submit"
                        className="p-1.5 text-taupe hover:text-brand-wine hover:scale-110 active:scale-95 transition"
                        aria-label={t('nav.search_button')}
                        title={t('nav.search_button')}
                    >
                        <HiOutlineMagnifyingGlass className="h-4 w-4 text-brand-wine" />
                    </button>
                </div>
            </form>

            {/* Menú desplegable predictivo en tiempo real (Live Search Dropdown) */}
            {isOpen && trimmed && (
                <div
                    className={`absolute z-50 mt-1.5 overflow-hidden rounded-xl border border-cream bg-white shadow-2xl transition-all duration-200 animate-fadeIn ${
                        isMobile ? 'left-0 right-0' : 'left-0 right-0 sm:min-w-[340px] md:min-w-[380px]'
                    }`}
                >
                    {/* Atajo rápido a categoría si coincide */}
                    {matchingCategory && (
                        <div className="border-b border-cream bg-cream/30 p-2.5">
                            <button
                                type="button"
                                onClick={() => handleSelectCategory(matchingCategory.slug)}
                                className="flex w-full items-center justify-between rounded-lg bg-brand-wine/10 px-3 py-2 text-xs font-bold text-brand-wine hover:bg-brand-wine hover:text-white transition group"
                            >
                                <span className="flex items-center gap-2">
                                    <span>🥩</span>
                                    <span>
                                        Ver categoría: <strong>{matchingCategory.label || matchingCategory.short}</strong>
                                    </span>
                                </span>
                                <span className="text-[10px] font-semibold opacity-80 group-hover:opacity-100 flex items-center gap-1">
                                    {matchingCategory.count} cortes <HiOutlineArrowRight className="h-3 w-3" />
                                </span>
                            </button>
                        </div>
                    )}

                    {/* Lista de productos coincidentes */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-cream/60">
                        {matchingProducts.length > 0 ? (
                            matchingProducts.slice(0, 6).map((product) => {
                                const finalPrice = getFinalPrice(product);
                                const thumb = product.images?.[0] || '/images/products/beef-ribeye.jpg';
                                return (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => handleSelectProduct(product.slug)}
                                        className="flex w-full items-center gap-3 p-2.5 text-left hover:bg-cream-light/80 transition group"
                                    >
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-cream bg-cream-light">
                                            <img
                                                src={thumb}
                                                alt={product.name}
                                                className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/products/beef-ribeye.jpg';
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-ink truncate group-hover:text-brand-wine transition">
                                                {product.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-taupe truncate">
                                                    {product.brand || product.gender}
                                                </span>
                                                {product.discountPercent > 0 && (
                                                    <span className="rounded bg-brand-red/10 px-1 text-[9px] font-black text-brand-red">
                                                        -{product.discountPercent}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-xs font-black text-brand-wine">
                                                {formatMoney(finalPrice)}
                                            </span>
                                            <span className="block text-[9px] text-taupe font-medium">
                                                /{product.unit || 'kg'}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-6 text-center">
                                <p className="text-xs font-medium text-ink">
                                    No encontramos resultados para <span className="font-bold">"{trimmed}"</span>
                                </p>
                                <p className="mt-1 text-[11px] text-taupe">
                                    Prueba buscando con palabras como:
                                </p>
                                <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                                    {['Res', 'Cerdo', 'Pollo', 'Chorizos', 'Picaña'].map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => {
                                                setQuery(tag);
                                                setIsOpen(true);
                                            }}
                                            className="rounded-full border border-cream bg-white px-2.5 py-1 text-[10px] font-semibold text-ink hover:border-brand-wine hover:text-brand-wine transition"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Botón inferior para ver todos en el catálogo */}
                    {matchingProducts.length > 0 && (
                        <div className="border-t border-cream bg-cream/20 p-2 text-center">
                            <button
                                type="button"
                                onClick={submit}
                                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-brand-wine hover:text-brand-red transition py-1"
                            >
                                <span>Ver los {matchingProducts.length} resultados completos</span>
                                <HiOutlineArrowRight className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
