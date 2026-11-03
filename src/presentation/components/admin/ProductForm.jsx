import { CONCENTRATION, GENDER, PRODUCT_TYPE } from '@/domain/catalog/categories.js';
import { AROMAS } from '@/domain/catalog/aromas.js';
import { applyDiscount, formatMoney } from '@/domain/shared/money.js';
import { FREE_SHIPPING_THRESHOLD } from '@/domain/cart/cart.js';
import ProductImage from '@/presentation/components/product/ProductImage.jsx';
import ImageUploader from './ImageUploader.jsx';
import { Panel } from './AdminUi.jsx';

const DISPLAY_AROMAS_ORDER = [
    'parrilla',
    'charcuteria',
    'bbq',
    'horno',
    'sarten',
    'colombiana',
];

const DISPLAY_AROMAS = DISPLAY_AROMAS_ORDER
    .map((slug) => AROMAS.find((a) => a.slug === slug))
    .filter(Boolean);

const GENDER_OPTIONS = [
    { id: GENDER.RES, label: 'Res AAA' },
    { id: GENDER.CERDO, label: 'Cerdo Selecto' },
    { id: GENDER.POLLO, label: 'Pollo de Granja' },
    { id: GENDER.CHIVO, label: 'Chivo & Cordero' },
    { id: GENDER.CHORIZOS, label: 'Chorizos 100% Artesanales' },
    { id: GENDER.CANALES, label: 'Mayoreo & Canales' },
    { id: GENDER.PERSONALIZADOS, label: 'Chorizos Personalizados' },
];

const TYPE_OPTIONS = [
    { id: PRODUCT_TYPE.CORTE, label: 'Corte Fresco' },
    { id: PRODUCT_TYPE.CHARCUTERIA, label: 'Charcutería Artesanal' },
    { id: PRODUCT_TYPE.CAJA, label: 'Caja al Mayoreo' },
    { id: PRODUCT_TYPE.CANAL, label: 'Media Canal / Cuarto' },
    { id: PRODUCT_TYPE.PERSONALIZADO, label: 'Embutido a Medida' },
];

const UNIT_OPTIONS = [
    { id: 'kg', label: 'Kilogramo (/ kg)' },
    { id: '450g', label: 'Paquete 450g (/ pqte 450g)' },
    { id: 'caja-4kg', label: 'Caja 4 kg (/ caja 4 kg)' },
    { id: 'caja-13kg', label: 'Caja 13 kg (/ caja 13 kg)' },
    { id: 'caja-11kg', label: 'Caja 11 kg (/ caja 11 kg)' },
    { id: 'boite-5kg', label: 'Boîte 5 kg (/ boîte 5 kg)' },
    { id: 'unidad', label: 'Unidad (/ unid.)' },
];

function Field({ label, error, children, className = '' }) {
    return (
        <label className={`block ${className}`}>
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em] text-ink/70">{label}</span>
            {children}
            {error && <span className="mt-1 block text-xs text-red-800">{error}</span>}
        </label>
    );
}

export default function ProductForm({ values, errors, brands, onChange, onSubmit, saving, onCancel }) {
    const set = (name) => (e) => onChange({ [name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    const toggleAroma = (slug) => {
        const current = Array.isArray(values.aromas) ? values.aromas : [];
        const next = current.includes(slug)
            ? current.filter((s) => s !== slug)
            : [...current, slug];
        onChange({ aromas: next });
    };
    const inputClass = (name) => `input py-2.5 ${errors[name] ? 'border-red-700/60' : ''}`;
    const finalPrice = applyDiscount(Number(values.price) || 0, Number(values.discountPercent) || 0);

    // Producto "de vista previa" para mostrar cómo se verá en la tienda.
    const preview = {
        name: values.name || 'Nombre del Corte',
        brand: values.brand || 'Línea de Carne',
        type: values.type,
        unit: values.unit || 'kg',
        images: values.images,
        palette: values.palette,
    };

    return (
        <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
                <Panel title="Información del Corte">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Nombre del Corte" error={errors.name}>
                            <input value={values.name} onChange={set('name')} className={inputClass('name')} placeholder="Ej. Lomo Ancho Rib Eye, Baby Back..." />
                        </Field>
                        <Field label="Nombre Secundario / Francés" error={errors.subname}>
                            <input value={values.subname ?? ''} onChange={set('subname')} className={inputClass('subname')} placeholder="Ej. Faux-filet / Ribeye AAA, Boîte de 5 kg..." />
                        </Field>
                        <Field label="Línea / Origen" error={errors.brand}>
                            <input value={values.brand} onChange={set('brand')} className={inputClass('brand')} list="brand-list" placeholder="Ej. Res AAA, Cerdo Selecto..." />
                            <datalist id="brand-list">{brands.map((b) => <option key={b} value={b} />)}</datalist>
                        </Field>
                        <Field label="Categoría Principal" error={errors.gender}>
                            <select value={values.gender} onChange={set('gender')} className={inputClass('gender')}>
                                {GENDER_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Tipo de Producto" error={errors.type}>
                            <select value={values.type} onChange={set('type')} className={inputClass('type')}>
                                {TYPE_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Unidad de Venta" error={errors.unit}>
                            <select value={values.unit || 'kg'} onChange={set('unit')} className={inputClass('unit')}>
                                {UNIT_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Certificación / Calidad">
                            <select value={values.concentration ?? ''} onChange={set('concentration')} className="input py-2.5">
                                <option value="">— Estándar de la Casa —</option>
                                {Object.values(CONCENTRATION).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Descripción del Corte" className="sm:col-span-2">
                            <textarea rows={3} value={values.description} onChange={set('description')} className="input resize-y" placeholder="Descripción detallada de terneza, marmoleo y sabor..." />
                        </Field>

                        {/* Estilos y Métodos de Preparación */}
                        <div className="sm:col-span-2 mt-1 rounded-xl border border-brand-wine/20 bg-cream/30 p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="eyebrow text-brand-wine font-bold">Estilo & Método Culinario</p>
                                    <p className="text-[11px] text-taupe mt-0.5">
                                        Selecciona los métodos recomendados para vincular este corte con las categorías de preparación de la carnicería.
                                    </p>
                                </div>
                                {(values.aromas || []).length > 0 && (
                                    <span className="rounded-full bg-brand-wine/15 px-2.5 py-0.5 text-[10px] font-semibold text-brand-wine">
                                        {(values.aromas || []).length} seleccionado{(values.aromas || []).length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                {DISPLAY_AROMAS.map((a) => {
                                    const isSelected = (values.aromas || []).includes(a.slug);
                                    return (
                                        <button
                                            key={a.slug}
                                            type="button"
                                            onClick={() => toggleAroma(a.slug)}
                                            className={`group relative flex flex-col items-start rounded-lg border p-3 text-left transition duration-200 cursor-pointer ${
                                                isSelected
                                                    ? 'border-brand-wine bg-brand-wine/15 ring-1 ring-brand-wine shadow-xs'
                                                    : 'border-taupe/20 bg-white hover:border-brand-wine/50 hover:bg-cream/40'
                                            }`}
                                        >
                                            <div className="flex w-full items-center justify-between gap-1">
                                                <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-brand-wine' : 'text-ink'}`}>
                                                    {a.name}
                                                </span>
                                                <div
                                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition ${
                                                        isSelected
                                                            ? 'border-brand-wine bg-brand-wine text-white'
                                                            : 'border-taupe/40 bg-white group-hover:border-brand-wine'
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <svg className="h-3 w-3 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            {a.tag && (
                                                <span className="mt-1 text-[10px] text-taupe line-clamp-1">
                                                    {a.tag}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Atributos y Notas del Corte */}
                        <div className="sm:col-span-2 mt-2 rounded-xl border border-taupe/20 bg-cream/30 p-4">
                            <div className="mb-3">
                                <p className="eyebrow text-ink font-bold">Atributos & Métodos de Cocción Sugeridos</p>
                                <p className="text-[11px] text-taupe mt-0.5">Ingresa los métodos de cocción específicos y notas destacadas (separadas por comas).</p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="Métodos de Cocción (separados por coma)" error={errors.cookingMethods}>
                                    <input
                                        value={Array.isArray(values.cookingMethods) ? values.cookingMethods.join(', ') : (values.cookingMethods ?? '')}
                                        onChange={set('cookingMethods')}
                                        className="input py-2 text-xs"
                                        placeholder="Ej. Parrilla, Sartén de hierro, Asador"
                                    />
                                </Field>
                                <Field label="Notas y Atributos del Corte (separados por coma)" error={errors.notes}>
                                    <input
                                        value={Array.isArray(values.notes) ? values.notes.join(', ') : (values.notes ?? '')}
                                        onChange={set('notes')}
                                        className="input py-2 text-xs"
                                        placeholder="Ej. Marmoleo AAA, Grasa uniforme, 100% Artesanal"
                                    />
                                </Field>
                            </div>
                        </div>
                    </div>
                </Panel>

                <Panel title="Precio e inventario">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Field label="Precio ($ CAD / USD)" error={errors.price}>
                            <input type="number" min="0" step="0.01" value={values.price} onChange={set('price')} className={inputClass('price')} />
                        </Field>
                        <Field label="Descuento (%)" error={errors.discountPercent}>
                            <input type="number" min="0" max="90" value={values.discountPercent} onChange={set('discountPercent')} className={inputClass('discountPercent')} />
                        </Field>
                        <Field label="Stock / Disponibilidad" error={errors.stock}>
                            <input type="number" min="0" step="1" value={values.stock} onChange={set('stock')} className={inputClass('stock')} />
                        </Field>
                    </div>
                    <p className="mt-3 text-sm text-taupe">Precio final en carnicería: <strong className="text-ink">{formatMoney(finalPrice)}</strong> <span className="text-xs">/ {values.unit || 'kg'}</span></p>

                    {/* Configuración de Envío Refrigerado */}
                    <div className="mt-5 rounded-xl border border-taupe/20 bg-cream/30 p-4">
                        <div className="mb-3">
                            <p className="eyebrow text-ink font-bold">Condiciones de Envío Refrigerado</p>
                            <p className="text-[11px] text-taupe mt-0.5">Indica si este corte tiene entrega refrigerada gratuita o costo individual.</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 items-start">
                            <label className="flex items-start gap-3 cursor-pointer pt-2">
                                <input
                                    type="checkbox"
                                    checked={Boolean(values.hasFreeShipping)}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        onChange({
                                            hasFreeShipping: checked,
                                            shippingCost: checked ? '0' : (values.shippingCost === '0' ? '' : values.shippingCost),
                                        });
                                    }}
                                    className="mt-0.5 h-4 w-4 accent-brand-wine"
                                />
                                <div>
                                    <span className="block text-xs font-semibold text-ink">Envío Refrigerado Gratis Garantizado</span>
                                    <span className="block text-[11px] text-taupe mt-0.5">El cliente no pagará flete de cadena de frío por este producto.</span>
                                </div>
                            </label>

                            <Field label="Costo de entrega refrigerada ($)" error={errors.shippingCost}>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    disabled={Boolean(values.hasFreeShipping)}
                                    value={values.hasFreeShipping ? '0' : values.shippingCost}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        onChange({
                                            shippingCost: val,
                                            hasFreeShipping: Number(val) === 0 && val !== '',
                                        });
                                    }}
                                    placeholder="0 = Sin cobro de envío"
                                    className={`${inputClass('shippingCost')} ${values.hasFreeShipping ? 'bg-black/5 opacity-60 cursor-not-allowed' : ''}`}
                                />
                                <span className="mt-1 block text-[10px] text-taupe">
                                    {values.hasFreeShipping
                                        ? '✓ Corte con Envío Refrigerado Gratis ($0).'
                                        : Number(values.shippingCost) > 0
                                        ? `Se cobrará ${formatMoney(Number(values.shippingCost))} de transporte refrigerado (o gratis si el pedido supera ${formatMoney(FREE_SHIPPING_THRESHOLD)}).`
                                        : 'Sin costo de envío configurado ($0 = gratis para el cliente).'}
                                </span>
                            </Field>
                        </div>
                    </div>
                </Panel>

                <Panel title="Fotos del Producto (Cloudinary)">
                    <ImageUploader images={values.images} onChange={(images) => onChange({ images })} />
                </Panel>
            </div>

            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
                <Panel title="Vista previa del Corte">
                    <ProductImage product={preview} className="aspect-[4/3] rounded-xl" />
                </Panel>

                <Panel title="Visibilidad en Catálogo">
                    <div className="space-y-3 text-sm">
                        {[['isActive', 'Visible en la tienda'], ['isFeatured', 'Destacado en vitrina principal'], ['isNew', 'Marcar como novedad']].map(([key, label]) => (
                            <label key={key} className="flex cursor-pointer items-center gap-3">
                                <input type="checkbox" checked={values[key]} onChange={set(key)} className="h-4 w-4 accent-brand-wine" />
                                {label}
                            </label>
                        ))}
                    </div>
                </Panel>

                <div className="flex gap-3">
                    <button type="button" onClick={onCancel} className="btn-outline flex-1">Cancelar</button>
                    <button type="submit" disabled={saving} className="btn-brand flex-1">{saving ? 'Guardando…' : 'Guardar Corte'}</button>
                </div>
            </div>
        </form>
    );
}
