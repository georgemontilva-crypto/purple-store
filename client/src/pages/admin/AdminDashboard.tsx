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
  Sparkles,
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
      href: "/admin/pedidos",
    },
    {
      label: "Pedidos",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: "+5%",
      trendUp: true,
      href: "/admin/pedidos",
    },
    {
      label: "Productos",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      trend: null,
      trendUp: true,
      href: "/admin/productos",
    },
    {
      label: "Clientes",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      trend: "+8%",
      trendUp: true,
      href: "/admin/clientes",
    },
  ];

  const quickActions = [
    { href: "/admin/productos/nuevo", label: "Nuevo producto",   icon: Plus,          color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100", border: "border-violet-100" },
    { href: "/admin/pedidos",         label: "Ver pedidos",      icon: ShoppingCart,  color: "text-blue-600",   bg: "bg-blue-50 hover:bg-blue-100",     border: "border-blue-100" },
    { href: "/admin/contenido",       label: "Editar contenido", icon: FileText,      color: "text-amber-600",  bg: "bg-amber-50 hover:bg-amber-100",   border: "border-amber-100" },
    { href: "/admin/mensajes",        label: "Mensajes",         icon: MessageSquare, color: "text-rose-600",   bg: "bg-rose-50 hover:bg-rose-100",     border: "border-rose-100" },
    { href: "/admin/categorias",      label: "Categorías",       icon: Tags,          color: "text-emerald-600",bg: "bg-emerald-50 hover:bg-emerald-100",border: "border-emerald-100" },
    { href: "/admin/clientes",        label: "Clientes",         icon: Users,         color: "text-indigo-600", bg: "bg-indigo-50 hover:bg-indigo-100",  border: "border-indigo-100" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Welcome Banner - full width with gradient */}
        <div
          className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, oklch(0.32 0.18 295) 0%, oklch(0.48 0.22 295) 50%, oklch(0.62 0.20 295) 100%)" }}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-white/70" />
                <p className="text-white/70 text-sm font-medium">Bienvenida de vuelta</p>
              </div>
              <h2 className="text-2xl font-bold">Panel de BoraHae Art</h2>
              <p className="text-white/60 text-sm mt-1">Aquí tienes el resumen de tu tienda</p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/admin/productos/nuevo">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{ background: "oklch(1 0 0 / 0.15)", border: "1px solid oklch(1 0 0 / 0.25)", color: "white" }}
                >
                  <Plus className="w-4 h-4" />
                  Nuevo producto
                </button>
              </Link>
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute right-16 -bottom-4 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute -right-2 top-6 w-24 h-24 rounded-full bg-white/5" />
        </div>

        {/* Metric Cards - 4 cols */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {metricCards.map((card, i) => (
            <Link key={i} href={card.href}>
              <div
                className="bg-white rounded-2xl border p-5 hover:shadow-lg transition-all cursor-pointer group"
                style={{ borderColor: "oklch(0.93 0.02 295)" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}>
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
                <p className="text-xs text-muted-foreground mt-1 font-medium group-hover:text-primary transition-colors">{card.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Main Grid - 5 cols total: orders 3, actions 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Recent Orders - 3 cols */}
          <div
            className="lg:col-span-3 bg-white rounded-2xl border overflow-hidden"
            style={{ borderColor: "oklch(0.93 0.02 295)" }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Pedidos recientes</h3>
                  <p className="text-xs text-muted-foreground">{recentOrders.length} pedidos</p>
                </div>
              </div>
              <Link href="/admin/pedidos">
                <span className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                  Ver todos <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-blue-300" />
                </div>
                <p className="text-sm font-medium text-foreground">No hay pedidos aún</p>
                <p className="text-xs text-muted-foreground mt-1">Los pedidos aparecerán aquí cuando los clientes compren</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "oklch(0.96 0.01 295)" }}>
                {recentOrders.slice(0, 7).map((order) => {
                  const s = STATUS_CONFIG[order.status] ?? { label: order.status, dot: "bg-gray-400", badge: "bg-gray-50 text-gray-600 border-gray-200" };
                  return (
                    <Link key={order.id} href={`/admin/pedidos/${order.id}`}>
                      <div className="flex items-center gap-3 px-6 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
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
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                          <span className="font-bold text-sm text-foreground">
                            ${parseFloat(order.total).toFixed(2)}
                          </span>
                          <Eye className="w-3.5 h-3.5 text-muted-foreground/40" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions - 2 cols */}
          <div
            className="lg:col-span-2 bg-white rounded-2xl border overflow-hidden"
            style={{ borderColor: "oklch(0.93 0.02 295)" }}
          >
            <div className="px-6 py-4 border-b" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
              <h3 className="font-semibold text-sm text-foreground">Acciones rápidas</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Gestiona tu tienda desde aquí</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {quickActions.map((action, i) => (
                <Link key={i} href={action.href}>
                  <div className={`p-4 rounded-xl border ${action.bg} ${action.border} transition-all cursor-pointer flex flex-col items-center gap-2.5 text-center hover:scale-105`}>
                    <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center`}>
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
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
