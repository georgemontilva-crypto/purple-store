import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  FileText,
  HelpCircle,
  MessageSquare,
  LogOut,
  Menu,
  Store,
  Palette,
  X,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const navGroups = [
  {
    label: "Principal",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/productos", label: "Productos", icon: Package },
      { href: "/admin/categorias", label: "Categorías", icon: Tags },
    ],
  },
  {
    label: "Ventas",
    items: [
      { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
      { href: "/admin/clientes", label: "Clientes", icon: Users },
    ],
  },
  {
    label: "Contenido",
    items: [
      { href: "/admin/contenido", label: "Contenido del sitio", icon: FileText },
      { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/admin/mensajes", label: "Mensajes", icon: MessageSquare },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function AdminLayout({ children, title, subtitle, action }: AdminLayoutProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: logoData } = trpc.content.get.useQuery({ key: "site_logo" });
  const { data: siteNameData } = trpc.content.get.useQuery({ key: "site_name" });
  const logoUrl = logoData?.value ?? "";
  const siteName = siteNameData?.value ?? "Guaiqui Avenue";

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => (window.location.href = "/"),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-guaiqui-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="w-14 h-14 rounded-2xl bg-guaiqui-purple flex items-center justify-center mx-auto mb-5">
            <Palette className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold mb-2 text-gray-900">Panel de administración</h1>
          <p className="text-gray-500 mb-6 text-sm">Inicia sesión con tu cuenta de administrador para continuar.</p>
          <a href={getLoginUrl()}>
            <button className="w-full px-6 py-3 rounded-lg bg-guaiqui-purple text-white font-semibold hover:bg-guaiqui-purple-dark transition-colors">
              Iniciar sesión
            </button>
          </a>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm mx-auto px-6">
          <p className="text-4xl mb-4">🚫</p>
          <p className="text-xl font-bold mb-2 text-gray-900">Acceso denegado</p>
          <p className="text-gray-500 mb-6 text-sm">No tienes permisos para acceder al panel de administración.</p>
          <Link href="/">
            <button className="px-6 py-3 rounded-lg bg-guaiqui-purple text-white font-semibold hover:bg-guaiqui-purple-dark transition-colors">
              Volver al inicio
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location === href;
    return location === href || location.startsWith(href + "/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-gray-100">
        <Link href="/admin" onClick={() => setSidebarOpen(false)}>
          <div className="flex items-center gap-2.5 cursor-pointer">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain flex-shrink-0" style={{ maxWidth: "80px" }} />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-guaiqui-purple flex items-center justify-center flex-shrink-0">
                <Palette className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <p className="font-bold text-sm text-gray-900 leading-tight">{siteName}</p>
              <p className="text-[11px] text-gray-400 leading-tight">Admin Panel</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-1">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, (item as any).exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-guaiqui-purple-50 text-guaiqui-purple-dark"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-guaiqui-purple" : "text-gray-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-3 border-t border-gray-100 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
          onClick={() => setSidebarOpen(false)}
        >
          <Store className="w-4 h-4 text-gray-400" />
          Ver tienda
        </Link>
        <button
          onClick={() => logoutMutation.mutate()}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
        <div className="mt-2 px-2.5 py-2 rounded-lg bg-gray-50 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-guaiqui-purple flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.name ?? "Admin"}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email ?? ""}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-52 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-52 z-50 lg:hidden flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
            <div>
              {title && <h1 className="font-bold text-gray-900 text-base leading-tight">{title}</h1>}
              {subtitle && <p className="text-xs text-gray-400 leading-tight">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {action}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-7 h-7 rounded-full bg-guaiqui-purple flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() ?? "A"}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
