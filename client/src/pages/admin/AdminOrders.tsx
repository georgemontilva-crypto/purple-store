import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Search, ShoppingCart, Eye, ArrowLeft, Package, User, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "pending",    label: "Pendiente",   dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "confirmed",  label: "Confirmado",  dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "processing", label: "Procesando",  dot: "bg-violet-400",  badge: "bg-violet-50 text-violet-700 border-violet-200" },
  { value: "shipped",    label: "Enviado",     dot: "bg-indigo-400",  badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: "delivered",  label: "Entregado",   dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "cancelled",  label: "Cancelado",   dot: "bg-rose-400",    badge: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "refunded",   label: "Reembolsado", dot: "bg-gray-400",    badge: "bg-gray-50 text-gray-600 border-gray-200" },
];

function getStatus(value: string) {
  return STATUS_OPTIONS.find((s) => s.value === value) ?? { label: value, dot: "bg-gray-400", badge: "bg-gray-50 text-gray-600 border-gray-200" };
}

function StatusBadge({ status }: { status: string }) {
  const s = getStatus(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function OrderDetail({ orderId, onBack }: { orderId: number; onBack: () => void }) {
  const utils = trpc.useUtils();
  const { data: order, isLoading } = trpc.orders.byId.useQuery({ id: orderId });

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => { toast.success("Estado actualizado"); utils.orders.byId.invalidate({ id: orderId }); utils.orders.list.invalidate(); },
    onError: (err) => toast.error("Error", { description: err.message }),
  });

  if (isLoading) return (
    <div className="space-y-4 max-w-3xl">
      <div className="h-10 bg-muted rounded-xl animate-pulse w-40" />
      <div className="h-64 bg-muted rounded-2xl animate-pulse" />
    </div>
  );

  if (!order) return <div className="text-muted-foreground">Pedido no encontrado</div>;

  return (
    <div className="space-y-4 max-w-3xl">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Volver a pedidos
      </button>

      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-foreground">{order.orderNumber}</h2>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-foreground">${parseFloat(order.total).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{(order.items as any[])?.length ?? 0} artículo{((order.items as any[])?.length ?? 0) !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
        <h3 className="font-semibold text-sm text-foreground mb-3">Actualizar estado</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.filter((s) => s.value).map((s) => (
            <button
              key={s.value}
              onClick={() => updateStatusMutation.mutate({ id: orderId, status: s.value as any })}
              disabled={order.status === s.value || updateStatusMutation.isPending}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                order.status === s.value
                  ? `${s.badge} ring-2 ring-offset-1 ring-current`
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Cliente
          </h3>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">{order.guestName ?? "—"}</p>
            {order.guestEmail && (
              <a href={`mailto:${order.guestEmail}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                <Mail className="w-3.5 h-3.5" /> {order.guestEmail}
              </a>
            )}
            {order.guestPhone && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5" /> {order.guestPhone}
              </p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Envío
          </h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            {order.shippingAddress ? (
              <p>{order.shippingAddress as string}</p>
            ) : (
              <p className="text-muted-foreground/60">Sin dirección registrada</p>
            )}
            {order.shippingCity && <p>{order.shippingCity}{order.shippingZip ? `, ${order.shippingZip}` : ""}</p>}
            {order.shippingCountry && <p>{order.shippingCountry}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" /> Artículos del pedido
          </h3>
        </div>
        <div className="divide-y" style={{ borderColor: "oklch(0.95 0.01 295)" }}>
          {(order.items as any[])?.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{item.productName}</p>
                <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-sm text-foreground">${(parseFloat(item.price ?? item.unitPrice ?? 0) * item.quantity).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">${parseFloat(item.price ?? item.unitPrice ?? 0).toFixed(2)} c/u</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t flex justify-end" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total del pedido</p>
            <p className="text-xl font-black text-foreground">${parseFloat(order.total).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
          <p className="text-xs font-semibold text-amber-700 mb-1">Notas del pedido</p>
          <p className="text-sm text-amber-800">{order.notes}</p>
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data, isLoading } = trpc.orders.list.useQuery({
    status: statusFilter || undefined,
    page,
    limit: 15,
  });

  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 15);

  const filteredOrders = search
    ? orders.filter((o) =>
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        (o.guestName ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  if (selectedOrderId !== null) {
    return (
      <AdminLayout title="Detalle del pedido">
        <OrderDetail orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Pedidos" subtitle={`${total} pedido${total !== 1 ? "s" : ""} en total`}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Buscar por número o cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-gray-200 bg-white text-sm" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold text-foreground">No hay pedidos</p>
              <p className="text-sm text-muted-foreground mt-1">Los pedidos aparecerán aquí cuando los clientes compren</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "oklch(0.93 0.02 295)", background: "oklch(0.98 0.01 295)" }}>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Pedido</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Cliente</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Fecha</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Estado</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Total</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Ver</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "oklch(0.95 0.01 295)" }}>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedOrderId(order.id)}>
                      <td className="px-4 py-3">
                        <p className="font-bold text-foreground">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{order.guestName}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="font-medium text-foreground">{order.guestName ?? "—"}</p>
                        {order.guestEmail && <p className="text-xs text-muted-foreground truncate max-w-[180px]">{order.guestEmail}</p>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-foreground">{new Date(order.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-bold text-foreground">${parseFloat(order.total).toFixed(2)}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedOrderId(order.id); }}>
                          <Eye className="w-4 h-4 text-primary" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
              <p className="text-xs text-muted-foreground">Página {page} de {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl text-xs">Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl text-xs">Siguiente</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
