import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Search, Eye, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente", color: "bg-amber-100 text-amber-700" },
  { value: "confirmed", label: "Confirmado", color: "bg-blue-100 text-blue-700" },
  { value: "processing", label: "Procesando", color: "bg-purple-100 text-purple-700" },
  { value: "shipped", label: "Enviado", color: "bg-indigo-100 text-indigo-700" },
  { value: "delivered", label: "Entregado", color: "bg-emerald-100 text-emerald-700" },
  { value: "cancelled", label: "Cancelado", color: "bg-rose-100 text-rose-700" },
  { value: "refunded", label: "Reembolsado", color: "bg-gray-100 text-gray-700" },
];

function getStatus(value: string) {
  return STATUS_OPTIONS.find((s) => s.value === value) ?? { value, label: value, color: "bg-gray-100 text-gray-700" };
}

function OrderDetail({ orderId, onClose }: { orderId: number; onClose: () => void }) {
  const { data: order, isLoading } = trpc.orders.byId.useQuery({ id: orderId });
  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => { toast.success("Estado actualizado"); utils.orders.byId.invalidate({ id: orderId }); utils.orders.list.invalidate(); },
    onError: (err) => toast.error("Error", { description: err.message }),
  });

  if (isLoading) return <div className="p-8 text-center"><div className="w-8 h-8 rounded-full gradient-purple animate-pulse mx-auto" /></div>;
  if (!order) return <div className="p-8 text-center text-muted-foreground">Pedido no encontrado</div>;

  const status = getStatus(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString("es")}</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={onClose}>← Volver</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Customer info */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <h3 className="font-semibold text-foreground mb-3">Información del cliente</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Nombre:</span><span className="font-medium">{order.guestName ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span className="font-medium">{order.guestEmail ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Teléfono:</span><span className="font-medium">{order.guestPhone ?? "—"}</span></div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <h3 className="font-semibold text-foreground mb-3">Dirección de envío</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{order.shippingAddress}</p>
            <p>{order.shippingCity}{order.shippingZip ? `, ${order.shippingZip}` : ""}</p>
            <p>{order.shippingCountry}</p>
          </div>
        </div>
      </div>

      {/* Status update */}
      <div className="bg-card rounded-2xl border border-border/50 p-5">
        <h3 className="font-semibold text-foreground mb-3">Estado del pedido</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => updateStatusMutation.mutate({ id: orderId, status: s.value })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2 ${
                order.status === s.value ? `${s.color} border-current` : "bg-transparent border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">Productos</h3>
        </div>
        <div className="divide-y divide-border">
          {(order.items as any[])?.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" /> : <div className="w-full h-full gradient-purple-soft" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-foreground">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border flex justify-between">
          <span className="font-semibold text-foreground">Total</span>
          <span className="font-bold text-lg text-foreground">${parseFloat(order.total).toFixed(2)}</span>
        </div>
      </div>

      {order.notes && (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <h3 className="font-semibold text-foreground mb-2">Notas</h3>
          <p className="text-sm text-muted-foreground">{order.notes}</p>
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

  if (selectedOrderId !== null) {
    return (
      <AdminLayout title="Detalle del pedido">
        <OrderDetail orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Pedidos">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por número o cliente..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 rounded-xl" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-border/60 bg-background text-foreground text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Todos los estados</option>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pedido</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-10 bg-muted rounded-lg animate-pulse" /></td></tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center">
                    <ShoppingCart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No hay pedidos</p>
                  </td></tr>
                ) : (
                  orders.map((order) => {
                    const status = getStatus(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3"><p className="text-sm font-mono font-medium text-foreground">{order.orderNumber}</p></td>
                        <td className="px-4 py-3 hidden md:table-cell"><p className="text-sm text-foreground">{order.guestName ?? "—"}</p><p className="text-xs text-muted-foreground">{order.guestEmail ?? ""}</p></td>
                        <td className="px-4 py-3 hidden sm:table-cell"><p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("es")}</p></td>
                        <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span></td>
                        <td className="px-4 py-3"><span className="text-sm font-bold text-foreground">${parseFloat(order.total).toFixed(2)}</span></td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setSelectedOrderId(order.id)} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-primary">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-border">
              <Button variant="outline" size="sm" className="rounded-full" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button>
              <span className="flex items-center text-sm text-muted-foreground px-2">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" className="rounded-full" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Siguiente</Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
