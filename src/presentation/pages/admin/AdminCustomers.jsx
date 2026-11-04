import { useState, useMemo } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineUserGroup, HiOutlineSparkles, HiOutlineCheckBadge } from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa6';
import { adminUseCases } from '@/infrastructure/container.js';
import { useAsync } from '@/presentation/hooks/useAsync.js';
import { formatMoney } from '@/domain/shared/money.js';
import { formatDate } from '@/presentation/utils/format.js';
import { toast, alertError, confirmAction } from '@/presentation/utils/swal.js';
import { PageHeader, StatCard } from '@/presentation/components/admin/AdminUi.jsx';

export default function AdminCustomers() {
    const [version, setVersion] = useState(0);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all'); // 'all' | 'vip' | 'regular'
    const [updatingId, setUpdatingId] = useState(null);

    const { data: customers = [], loading, error } = useAsync(() => adminUseCases.listCustomers(), [version]);

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
                ? `El cliente ${customer.fullName || customer.email} recibirá 10% de descuento automático en todos sus pedidos.`
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
                subtitle="Gestiona los usuarios registrados, sus pedidos acumulados y asigna membresías VIP con 10% de descuento."
            />

            {/* Tarjetas de estadísticas */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Clientes"
                    value={stats.total}
                    hint="Cuentas registradas"
                />
                <StatCard
                    label="Clientes VIP (10% OFF)"
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
                                <th className="px-5 py-3.5 text-right">Estado VIP (10% OFF)</th>
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
                                                        <span>VIP Activo (10% OFF)</span>
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
        </>
    );
}
