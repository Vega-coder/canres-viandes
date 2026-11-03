import { NavLink } from 'react-router-dom';
import { CATEGORIES } from '@/domain/catalog/categories.js';
import { PRICE_RANGES } from '@/domain/catalog/filters.js';
import { AROMAS } from '@/domain/catalog/aromas.js';

export default function FilterPanel({
    brands,
    selectedBrands,
    onToggleBrand,
    priceRange,
    onPriceRange,
    aroma,
    onAroma,
    onClear,
}) {
    return (
        <div className="space-y-10">
            <div>
                <p className="eyebrow text-ink font-bold">Categorías de Carne</p>
                <ul className="mt-4 space-y-2.5 text-sm">
                    <li>
                        <NavLink to="/tienda" end className={({ isActive }) => (isActive ? 'font-bold text-brand-wine' : 'text-ink/70 hover:text-brand-wine')}>
                            Todo el Catálogo
                        </NavLink>
                    </li>
                    {CATEGORIES.map((c) => (
                        <li key={c.slug}>
                            <NavLink to={`/tienda/${c.slug}`} className={({ isActive }) => (isActive ? 'font-bold text-brand-wine' : 'text-ink/70 hover:text-brand-wine')}>
                                {c.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <p className="eyebrow text-ink font-bold">Estilo & Preparación</p>
                <ul className="mt-4 space-y-2 text-sm">
                    {AROMAS.map((a) => {
                        const isSelected = aroma === a.slug;
                        return (
                            <li key={a.slug}>
                                <button
                                    type="button"
                                    onClick={() => onAroma?.(isSelected ? '' : a.slug)}
                                    className={`flex w-full items-center justify-between text-left transition ${
                                        isSelected ? 'font-bold text-brand-wine' : 'text-ink/70 hover:text-brand-wine'
                                    }`}
                                >
                                    <span>{a.name}</span>
                                    {isSelected && <span className="text-xs text-brand-wine">✓</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {brands.length > 0 && (
                <fieldset>
                    <legend className="eyebrow text-ink font-bold">Línea de Origen</legend>
                    <ul className="mt-4 space-y-2.5 text-sm">
                        {brands.map((b) => (
                            <li key={b}>
                                <label className="flex items-center gap-2.5 cursor-pointer text-ink/80 hover:text-brand-wine">
                                    <input
                                        type="checkbox"
                                        checked={selectedBrands.includes(b)}
                                        onChange={() => onToggleBrand(b)}
                                        className="h-4 w-4 rounded border-cream text-brand-wine focus:ring-brand-wine"
                                    />
                                    <span>{b}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </fieldset>
            )}

            <fieldset>
                <legend className="eyebrow text-ink font-bold">Rango de Precio</legend>
                <ul className="mt-4 space-y-2 text-sm">
                    {PRICE_RANGES.map((r) => {
                        const isSelected = priceRange === r.id;
                        return (
                            <li key={r.id}>
                                <button
                                    type="button"
                                    onClick={() => onPriceRange?.(isSelected ? '' : r.id)}
                                    className={`flex w-full items-center justify-between text-left transition ${
                                        isSelected ? 'font-bold text-brand-wine' : 'text-ink/70 hover:text-brand-wine'
                                    }`}
                                >
                                    <span>{r.label}</span>
                                    {isSelected && <span className="text-xs text-brand-wine">✓</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </fieldset>

            {onClear && (
                <button
                    type="button"
                    onClick={onClear}
                    className="btn-outline w-full text-xs text-center uppercase tracking-wider"
                >
                    Limpiar Filtros
                </button>
            )}
        </div>
    );
}
