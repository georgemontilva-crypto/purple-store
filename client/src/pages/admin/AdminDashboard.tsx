import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Package, Users, DollarSign, ArrowRight, Plus } from "lucide-react";
import { Link } from "wouter";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:    { label: "Pendiente",   className: "bg-amber-50 text-amber-700 border border-amber-200" },
  confirmed:  { label: "Confirmado",  className: "bg-blue-50 text-blue-700 border border-blue-200" },
  processing: { label: "Procesando",  className: "bg-guaiqui-purple-50 text-guaiqui-purple-dark border border-violet-200" },
  shipped:    { label: "Enviado",     className: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  delivered:  { label: "Entregado",   className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  cancelled:  { label: "Cancelado",   className: "bg-red-50 text-red-700 border border-red-200" },
  refunded:   { label: "Reembolsado", className: "bg-gray-50 text-gray-600 border border-gray-200" },
};

export default function AdminDashboard() {
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: recentOrdersData } = trpc.dashboard.recentOrders.useQuery();
  const recentOrders = recentOrdersData?.orders ?? [];

  const metricCards = [
    {
      label: "Total Pedidos",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      iconColor: "text-gray-500",
      href: "/admin/pedidos",
    },
    {
      label: "Total Ingresos",
      value: `$${(stats?.totalRevenue ?? 0).toLocaleString("es", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      iconColor: "text-green-500",
      href: "/admin/pedidos",
    },
    {
      label: "Pedidos Pendientes",
      value: 0,
      icon: ShoppingCart,
      iconColor: "text-amber-500",
      href: "/admin/pedidos",
    },
    {
      label: "Total Clientes",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      iconColor: "text-guaiqui-purple",
      href: "/admin/clientes",
    },
    {
      label: "Total Productos",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      iconColor: "text-blue-500",
      href: "/admin/productos",
    },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="Resumen de tu tienda">
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {metricCards.map((card, i) => (
            <Link key={i} href={card.href}>
              <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-shadow cursor-pointer">
                <card.icon className={`w-6 h-6 ${card.iconColor} mb-3`} />
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Pedidos Recientes</h3>
              <p className="text-xs text-gray-400 mt-0.5">Overview of your store performance</p>
            </div>
            <Link href="/admin/pedidos">
              <span className="text-xs text-guaiqui-purple hover:text-guaiqui-purple-dark flex items-center gap-1 font-medium">
                Ver todos <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No orders yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pedido</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Cliente</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.slice(0, 8).map((order) => {
                  const s = STATUS_CONFIG[order.status] ?? { label: order.status, className: "bg-gray-50 text-gray-600 border border-gray-200" };
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="px-6 py-3.5 text-gray-600 hidden md:table-cell">{order.guestName ?? "Cliente"}</td>
                      <td className="px-6 py-3.5 text-gray-400 hidden sm:table-cell">
                        {new Date(order.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${s.className}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-gray-900">
                        ${parseFloat(order.total).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Acciones rápidas</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/productos/nuevo">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-guaiqui-purple text-white text-sm font-medium hover:bg-guaiqui-purple-dark transition-colors">
                <Plus className="w-4 h-4" /> Nuevo producto
              </button>
            </Link>
            <Link href="/admin/pedidos">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                <ShoppingCart className="w-4 h-4" /> Ver pedidos
              </button>
            </Link>
            <Link href="/admin/clientes">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                <Users className="w-4 h-4" /> Ver clientes
              </button>
            </Link>
            <Link href="/admin/contenido">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                <Package className="w-4 h-4" /> Contenido del sitio
              </button>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
