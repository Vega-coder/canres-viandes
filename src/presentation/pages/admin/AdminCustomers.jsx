import { useState, useMemo, useEffect } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineUserGroup, HiOutlineCog6Tooth, HiOutlineCheck } from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa6';
import { adminUseCases } from '@/infrastructure/container.js';
import { useAsync } from '@/presentation/hooks/useAsync.js';
import { formatMoney } from '@/domain/shared/money.js';
import { formatDate } from '@/presentation/utils/format.js';
import { toast, alertError, confirmAction } from '@/presentation/utils/swal.js';
import { PageHeader, StatCard } from '@/presentation/components/admin/AdminUi.jsx';
import { DEFAULT_VIP_CONFIG } from '@/domain/cart/cart.js';

function VipConfigModal({ isOpen, onClose, initialConfig, onSaved }) {
    const [config, setConfig] = useState(initialConfig || DEFAULT_VIP_CONFIG);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initialConfig) setConfig(initialConfig);
    }, [initialConfig]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const saved = await adminUseCases.saveVipConfig(config);
            toast('Reglas del Club VIP actualizadas con éxito');
            onSaved?.(saved);
            onClose();
        } catch (err) {
            alertError('No se pudo guardar la configuración', err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-taupe/20">
                <header className="px-6 py-4 bg-gradient-to-r from-brand-wine to-brand-dark text-white flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl">⚙️</span>
                        <div>
                            <h2 className="font-display font-bold text-lg leading-tight">Configuración del Club VIP</h2>
                            <p className="text-[11px] text-cream/70">Define las reglas y el modo del descuento para tus clientes</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="text-cream/70 hover:text-white p-1 text-lg">✕</button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-ink">
                    {/* 1. Activar / Pausar */}
                    <div className="flex items-center justify-between p-3.5 bg-cream/30 rounded-lg border border-taupe/15">
                        <div>
                            <p className="font-bold text-sm text-ink">Estado del Club VIP</p>
                            <p className="text-taupe mt-0.5 text-[11px]">Habilitar o pausar descuentos para clientes registrados</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.enabled}
                                onChange={(e) => setConfig((c) => ({ ...c, enabled: e.target.checked }))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                    </div>

                    {/* 2. Porcentaje de descuento */}
                    <div>
                        <label className="block font-bold text-sm mb-1 text-ink">
                            Porcentaje de descuento VIP (%)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="1"
                                max="80"
                                value={config.discountPercent}
                                onChange={(e) => setConfig((c) => ({ ...c, discountPercent: Math.max(1, Math.min(80, Number(e.target.value) || 10)) }))}
                                className="input py-2 text-sm w-28 font-bold text-center"
                            />
                            <span className="text-xs font-semibold text-taupe">% de descuento aplicado</span>
                        </div>
                    </div>

                    {/* 3. Modo de aplicación */}
                    <div>
                        <label className="block font-bold text-sm mb-2 text-ink">
                            ¿Cuándo se aplica el descuento al cliente?
                        </label>
                        <div className="space-y-2.5">
                            <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${config.mode === 'first_orders' && (config.maxOrders || 1) === 1 ? 'border-brand-wine bg-brand-wine/5 ring-1 ring-brand-wine/30' : 'border-taupe/20 hover:bg-cream/20'}`}>
                                <input
                                    type="radio"
                                    name="vipMode"
                                    checked={config.mode === 'first_orders' && (config.maxOrders || 1) === 1}
                                    onChange={() => setConfig((c) => ({ ...c, mode: 'first_orders', maxOrders: 1 }))}
                                    className="mt-0.5 text-brand-wine"
                                />
                                <div>
                                    <p className="font-bold text-ink">Solo en la 1ª compra de bienvenida (Recomendado)</p>
                                    <p className="text-taupe mt-0.5 text-[11px]">El cliente recibe el descuento en su primer pedido. En compras posteriores paga precio estándar.</p>
                                </div>
                            </label>

                            <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${config.mode === 'first_orders' && (config.maxOrders || 1) > 1 ? 'border-brand-wine bg-brand-wine/5 ring-1 ring-brand-wine/30' : 'border-taupe/20 hover:bg-cream/20'}`}>
                                <input
                                    type="radio"
                                    name="vipMode"
                                    checked={config.mode === 'first_orders' && (config.maxOrders || 1) > 1}
                                    onChange={() => setConfig((c) => ({ ...c, mode: 'first_orders', maxOrders: c.maxOrders > 1 ? c.maxOrders : 3 }))}
                                    className="mt-0.5 text-brand-wine"
                                />
                                <div className="flex-1">
                                    <p className="font-bold text-ink">En las primeras compras del cliente</p>
                                    <p className="text-taupe mt-0.5 text-[11px]">Válido durante sus primeros pedidos para incentivar compras repetidas.</p>
                                    {config.mode === 'first_orders' && (config.maxOrders || 1) > 1 && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[11px] font-semibold">Válido en las primeras:</span>
                                            <input
                                                type="number"
                                                min="2"
                                                max="10"
                                                value={config.maxOrders}
                                                onChange={(e) => setConfig((c) => ({ ...c, maxOrders: Math.max(2, Math.min(10, Number(e.target.value) || 2)) }))}
                                                className="input py-1 px-2 text-xs w-20 font-bold"
                                            />
                                            <span className="text-[11px]">compras</span>
                                        </div>
                                    )}
                                </div>
                            </label>

                            <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${config.mode === 'all_orders' ? 'border-brand-wine bg-brand-wine/5 ring-1 ring-brand-wine/30' : 'border-taupe/20 hover:bg-cream/20'}`}>
                                <input
                                    type="radio"
                                    name="vipMode"
                                    checked={config.mode === 'all_orders'}
                                    onChange={() => setConfig((c) => ({ ...c, mode: 'all_orders' }))}
                                    className="mt-0.5 text-brand-wine"
                                />
                                <div>
                                    <p className="font-bold text-ink">Permanente en todas las compras (De por vida)</p>
                                    <p className="text-taupe mt-0.5 text-[11px]">Cada vez que el cliente compre con su cuenta tendrá el descuento asegurado.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Vista previa en vivo */}
                    <div className="rounded-lg bg-amber-500/10 p-3.5 border border-amber-300/60">
                        <p className="font-bold text-amber-900 flex items-center gap-1.5">
                            <span>👑</span>
                            <span>Vista previa de la regla:</span>
                        </p>
                        <p className="mt-1 text-amber-950/80 text-[11px] leading-relaxed">
                            {config.enabled ? (
                                <>
                                    Los clientes registrados recibirán un <strong>{config.discountPercent}% de descuento</strong>{' '}
                                    {config.mode === 'first_orders'
                                        ? ((config.maxOrders || 1) === 1 ? 'en su primera compra de bienvenida' : `en sus primeras ${config.maxOrders} compras`)
                                        : 'en todas sus compras de por vida'}.
                                </>
                            ) : (
                                <span className="text-red-700 font-semibold">El Club VIP está pausado actualmente. No se aplicarán descuentos automáticos.</span>
                            )}
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-taupe/15">
                        <button type="button" onClick={onClose} className="btn-outline px-4 py-2 text-xs">
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving} className="btn-brand px-6 py-2 text-xs shadow-md">
                            {saving ? 'Guardando…' : 'Guardar Reglas VIP'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminCustomers() {
    const [version, setVersion] = useState(0);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all'); // 'all' | 'vip' | 'regular'
    const [updatingId, setUpdatingId] = useState(null);
    const [configModalOpen, setConfigModalOpen] = useState(false);

    const { data: customers = [], loading, error } = useAsync(() => adminUseCases.listCustomers(), [version]);
    const { data: vipConfig = DEFAULT_VIP_CONFIG, execute: reloadConfig } = useAsync(() => adminUseCases.getVipConfig(), [version]);

    const stats = useMemo(() => {
        const total = customers.length;
        const vips = customers.filter((c) => c.isVip).length;
        const regulars = total - vips;
        const totalSpent = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
        return { total, vips, regulars, totalSpent };
    }, [customers]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return customers.filter((c) => {
            const matchesQuery = !q ||
                c.fullName?.toLowerCase().includes(q) ||
                c.email?.toLowerCase().includes(q) ||
                c.phone?.includes(q);

            if (!matchesQuery) return false;
            if (filter === 'vip') return c.isVip;
            if (filter === 'regular') return !c.isVip;
            return true;
        });
    }, [customers, query, filter]);

    const handleToggleVip = async (customer) => {
        const nextState = !customer.isVip;
        const confirmed = await confirmAction({
            title: nextState ? '¿Asignar membresía VIP?' : '¿Desactivar membresía VIP?',
            text: nextState
                ? `El cliente ${customer.fullName || customer.email} recibirá el beneficio del Club VIP en sus pedidos.`
                : `El cliente ${customer.fullName || customer.email} volverá a los precios estándar sin descuento VIP.`,
            confirmButtonText: nextState ? 'Sí, hacer VIP' : 'Sí, quitar VIP',
        });

        if (!confirmed) return;

        setUpdatingId(customer.id);
        try {
            await adminUseCases.toggleCustomerVip(customer.id, nextState);
            toast(nextState ? `👑 ${customer.fullName || customer.email} ahora es Cliente VIP` : `Estado VIP desactivado`);
            setVersion((v) => v + 1);
        } catch (err) {
            alertError('No se pudo actualizar la membresía', err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <>
            <PageHeader
                title="Clientes y Club VIP"
                subtitle="Gestiona los usuarios registrados, sus pedidos acumulados y personaliza las reglas del beneficio VIP."
            >
                <button
                    type="button"
                    onClick={() => setConfigModalOpen(true)}
                    className="btn-brand flex items-center gap-2 text-xs shadow-md"
                >
                    <HiOutlineCog6Tooth className="h-4 w-4" />
                    Configurar Reglas VIP ({vipConfig.discountPercent}%)
                </button>
            </PageHeader>

            {/* Banner de resumen de la regla activa */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-amber-500/5 border border-amber-300/60 shadow-xs">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-xl text-amber-900 font-bold">
                        👑
                    </span>
                    <div>
                        <p className="font-bold text-sm text-amber-950">
                            Regla activa: {vipConfig.discountPercent}% de descuento{' '}
                            {vipConfig.mode === 'first_orders'
                                ? ((vipConfig.maxOrders || 1) === 1 ? 'en la 1ª compra de bienvenida' : `en las primeras ${vipConfig.maxOrders} compras`)
                                : 'permanente en todas las compras'}
                        </p>
                        <p className="text-[11px] text-amber-900/80">
                            {vipConfig.enabled ? 'Campaña activa para clientes registrados.' : 'Campaña pausada globalmente.'}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setConfigModalOpen(true)}
                    className="text-xs font-bold text-brand-wine underline hover:text-ink self-start sm:self-auto"
                >
                    Cambiar reglas
                </button>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Clientes"
                    value={stats.total}
                    hint="Cuentas registradas"
                />
                <StatCard
                    label={`Clientes VIP (${vipConfig.discountPercent}% OFF)`}
                    value={stats.vips}
                    hint="Con beneficio exclusivo activo"
                    accent
                />
                <StatCard
                    label="Clientes Estándar"
                    value={stats.regulars}
                    hint="Sin membresía VIP activa"
                />
                <StatCard
                    label="Ventas a Clientes"
                    value={formatMoney(stats.totalSpent)}
                    hint="Facturación de usuarios registrados"
                />
            </div>

            {/* Controles de Búsqueda y Filtros */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-md">
                    <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe h-4 w-4" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar por nombre, email o celular…"
                        className="input pl-9 text-xs w-full"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 text-xs transition ${filter === 'all' ? 'bg-ink text-cream-light font-semibold' : 'bg-white text-ink/70 ring-1 ring-taupe/20 hover:ring-ink'}`}
                    >
                        Todos ({customers.length})
                    </button>
                    <button
                        onClick={() => setFilter('vip')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition ${filter === 'vip' ? 'bg-amber-600 text-white font-semibold' : 'bg-white text-amber-800 ring-1 ring-amber-300 hover:bg-amber-50'}`}
                    >
                        👑 Solo VIPs ({stats.vips})
                    </button>
                    <button
                        onClick={() => setFilter('regular')}
                        className={`px-3 py-1.5 text-xs transition ${filter === 'regular' ? 'bg-ink text-cream-light font-semibold' : 'bg-white text-ink/70 ring-1 ring-taupe/20 hover:ring-ink'}`}
                    >
                        Estándar ({stats.regulars})
                    </button>
                </div>
            </div>

            {loading && <p className="text-taupe py-8 text-center text-sm">Cargando clientes…</p>}
            {error && <p className="text-red-800 py-8 text-center text-sm">No se pudieron cargar los clientes: {error.message}</p>}

            {!loading && !error && filtered.length === 0 && (
                <div className="bg-white p-12 text-center text-sm text-taupe ring-1 ring-taupe/10">
                    <HiOutlineUserGroup className="mx-auto h-12 w-12 text-taupe/40" />
                    <p className="mt-3 font-medium text-ink">No se encontraron clientes</p>
                    <p className="mt-1 text-xs text-taupe">
                        {query ? 'Prueba con otro término de búsqueda.' : 'Los clientes aparecerán automáticamente al registrarse en la tienda.'}
                    </p>
                </div>
            )}

            {!loading && !error && filtered.length > 0 && (
                <div className="overflow-x-auto bg-white shadow-xs ring-1 ring-taupe/10 rounded">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-taupe/15 bg-cream/40 text-[10px] uppercase font-bold tracking-wider text-taupe">
                            <tr>
                                <th className="px-5 py-3.5">Cliente</th>
                                <th className="px-5 py-3.5">Contacto</th>
                                <th className="px-5 py-3.5">Pedidos / Compras</th>
                                <th className="px-5 py-3.5">Registro</th>
                                <th className="px-5 py-3.5 text-right">Estado VIP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-taupe/15">
                            {filtered.map((c) => {
                                const initials = (c.fullName || c.email)
                                    .split(' ')
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase();
                                const phoneDigits = String(c.phone || '').replace(/\D/g, '');
                                const isUpdating = updatingId === c.id;

                                return (
                                    <tr key={c.id} className="hover:bg-cream/20 transition">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {c.avatarUrl ? (
                                                    <img src={c.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-taupe/20" />
                                                ) : (
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-wine/10 font-bold text-brand-wine text-xs">
                                                        {initials || 'CL'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-ink text-sm">{c.fullName || 'Sin nombre'}</span>
                                                        {c.role !== 'customer' && (
                                                            <span className="rounded bg-sky-100 px-1.5 py-0.2 text-[9px] font-bold uppercase text-sky-800">
                                                                {c.role}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-taupe text-[11px]">{c.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            {c.phone ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-ink">{c.phone}</span>
                                                    <a
                                                        href={`https://wa.me/${phoneDigits.startsWith('57') ? phoneDigits : `57${phoneDigits}`}?text=${encodeURIComponent(`Hola ${c.fullName.split(' ')[0]}, te saludamos de CANRES Viandes 🥩!`)}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title="Escribir por WhatsApp"
                                                        className="text-emerald-700 hover:text-emerald-800 transition"
                                                    >
                                                        <FaWhatsapp className="h-3.5 w-3.5" />
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-taupe/60 italic">Sin teléfono</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            {c.ordersCount > 0 ? (
                                                <div>
                                                    <span className="font-bold text-ink">{c.ordersCount} {c.ordersCount === 1 ? 'pedido' : 'pedidos'}</span>
                                                    <p className="text-[11px] text-taupe">{formatMoney(c.totalSpent)}</p>
                                                </div>
                                            ) : (
                                                <span className="text-taupe/70">Sin compras aún</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-taupe text-[11px]">
                                            {c.createdAt ? formatDate(c.createdAt) : '—'}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                type="button"
                                                disabled={isUpdating}
                                                onClick={() => handleToggleVip(c)}
                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition shadow-xs ${
                                                    c.isVip
                                                        ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                                        : 'bg-taupe/10 text-taupe hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 border border-transparent'
                                                }`}
                                            >
                                                {c.isVip ? (
                                                    <>
                                                        <span>👑</span>
                                                        <span>VIP Activo ({vipConfig.discountPercent}% OFF)</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>☆</span>
                                                        <span>Asignar VIP</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <VipConfigModal
                isOpen={configModalOpen}
                onClose={() => setConfigModalOpen(false)}
                initialConfig={vipConfig}
                onSaved={() => {
                    reloadConfig();
                    setVersion((v) => v + 1);
                }}
            />
        </>
    );
}
