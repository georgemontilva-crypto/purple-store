import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Package, Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Link } from "wouter";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-700" },
  processing: { label: "Procesando", color: "bg-purple-100 text-purple-700" },
  shipped: { label: "Enviado", color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "Entregado", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelado", color: "bg-rose-100 text-rose-700" },
  refunded: { label: "Reembolsado", color: "bg-gray-100 text-gray-700" },
};

export default function AdminDashboard() {
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: recentOrdersData } = trpc.dashboard.recentOrders.useQuery();
  const recentOrders = recentOrdersData?.orders ?? [];

  const statCards = [
    {
      label: "Total pedidos",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Ingresos totales",
      value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Productos",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Clientes",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="p-6 rounded-2xl gradient-purple text-white shadow-purple-lg">
          <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Bienvenida al panel
          </h2>
          <p className="text-white/80 text-sm">
            Aquí tienes un resumen de tu tienda
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-purple transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/admin/productos/nuevo", label: "Nuevo producto", icon: Package },
            { href: "/admin/categorias/nueva", label: "Nueva categoría", icon: Package },
            { href: "/admin/pedidos", label: "Ver pedidos", icon: ShoppingCart },
            { href: "/admin/contenido", label: "Editar contenido", icon: Users },
          ].map((action, i) => (
            <Link key={i} href={action.href}>
              <div className="p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-purple transition-all cursor-pointer text-center">
                <action.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">{action.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Pedidos recientes
            </h3>
            <Link href="/admin/pedidos">
              <span className="text-sm text-primary hover:underline">Ver todos</span>
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No hay pedidos aún
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => {
                const status = STATUS_LABELS[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-700" };
                return (
                  <Link key={order.id} href={`/admin/pedidos/${order.id}`}>
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.guestName ?? "Cliente"} · {new Date(order.createdAt).toLocaleDateString("es")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="font-bold text-foreground text-sm">
                          ${parseFloat(order.total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
