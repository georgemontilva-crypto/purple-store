import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Clock,
  Plus,
  FileText,
  MessageSquare,
  Tags,
  Eye,
} from "lucide-react";
import { Link } from "wouter";

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  pending:    { label: "Pendiente",   dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed:  { label: "Confirmado",  dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200" },
  processing: { label: "Procesando",  dot: "bg-violet-400",  badge: "bg-violet-50 text-violet-700 border-violet-200" },
  shipped:    { label: "Enviado",     dot: "bg-indigo-400",  badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  delivered:  { label: "Entregado",   dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled:  { label: "Cancelado",   dot: "bg-rose-400",    badge: "bg-rose-50 text-rose-700 border-rose-200" },
  refunded:   { label: "Reembolsado", dot: "bg-gray-400",    badge: "bg-gray-50 text-gray-600 border-gray-200" },
};

export default function AdminDashboard() {
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: recentOrdersData } = trpc.dashboard.recentOrders.useQuery();
  const recentOrders = recentOrdersData?.orders ?? [];

  const metricCards = [
    {
      label: "Ingresos totales",
      value: `$${(stats?.totalRevenue ?? 0).toLocaleString("es", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Pedidos",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: "+5%",
      trendUp: true,
    },
    {
      label: "Productos",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      trend: null,
      trendUp: true,
    },
    {
      label: "Clientes",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      trend: "+8%",
      trendUp: true,
    },
  ];

  const quickActions = [
    { href: "/admin/productos/nuevo", label: "Nuevo producto",    icon: Plus,         color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100" },
    { href: "/admin/pedidos",         label: "Ver pedidos",       icon: ShoppingCart, color: "text-blue-600",   bg: "bg-blue-50 hover:bg-blue-100" },
    { href: "/admin/contenido",       label: "Editar contenido",  icon: FileText,     color: "text-amber-600",  bg: "bg-amber-50 hover:bg-amber-100" },
    { href: "/admin/mensajes",        label: "Mensajes",          icon: MessageSquare,color: "text-rose-600",   bg: "bg-rose-50 hover:bg-rose-100" },
    { href: "/admin/categorias",      label: "Categorías",        icon: Tags,         color: "text-emerald-600",bg: "bg-emerald-50 hover:bg-emerald-100" },
    { href: "/admin/clientes",        label: "Clientes",          icon: Users,        color: "text-indigo-600", bg: "bg-indigo-50 hover:bg-indigo-100" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-6xl">

        {/* Welcome Banner */}
        <div
          className="rounded-2xl p-5 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, oklch(0.42 0.20 295) 0%, oklch(0.55 0.22 295) 100%)" }}
        >
          <div className="relative z-10">
            <p className="text-white/70 text-sm font-medium mb-0.5">Bienvenida de vuelta 👋</p>
            <h2 className="text-xl font-bold">Panel de BoraHae Art</h2>
            <p className="text-white/60 text-sm mt-1">Aquí tienes el resumen de tu tienda</p>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/8" />
          <div className="absolute -right-2 top-8 w-20 h-20 rounded-full bg-white/5" />
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {metricCards.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border p-4 hover:shadow-md transition-all"
              style={{ borderColor: "oklch(0.93 0.02 295)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                {card.trend && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                    <TrendingUp className="w-3 h-3 inline mr-0.5" />
                    {card.trend}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-foreground leading-tight">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent Orders - 2 cols */}
          <div
            className="lg:col-span-2 bg-white rounded-2xl border overflow-hidden"
            style={{ borderColor: "oklch(0.93 0.02 295)" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">Pedidos recientes</h3>
              </div>
              <Link href="/admin/pedidos">
                <span className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                  Ver todos <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-10 text-center">
                <ShoppingCart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No hay pedidos aún</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Los pedidos aparecerán aquí cuando los clientes compren</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "oklch(0.95 0.01 295)" }}>
                {recentOrders.slice(0, 6).map((order) => {
                  const s = STATUS_CONFIG[order.status] ?? { label: order.status, dot: "bg-gray-400", badge: "bg-gray-50 text-gray-600 border-gray-200" };
                  return (
                    <Link key={order.id} href={`/admin/pedidos/${order.id}`}>
                      <div className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {(order.guestName ?? "C")[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{order.orderNumber}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {order.guestName ?? "Cliente"} · {new Date(order.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                          <span className="font-bold text-sm text-foreground">
                            ${parseFloat(order.total).toFixed(2)}
                          </span>
                          <Eye className="w-3.5 h-3.5 text-muted-foreground/50" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions - 1 col */}
          <div
            className="bg-white rounded-2xl border overflow-hidden"
            style={{ borderColor: "oklch(0.93 0.02 295)" }}
          >
            <div className="px-5 py-4 border-b" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
              <h3 className="font-semibold text-sm text-foreground">Acciones rápidas</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Gestiona tu tienda desde aquí</p>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {quickActions.map((action, i) => (
                <Link key={i} href={action.href}>
                  <div className={`p-3 rounded-xl ${action.bg} transition-colors cursor-pointer flex flex-col items-center gap-2 text-center`}>
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                    <span className="text-xs font-semibold text-foreground leading-tight">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
