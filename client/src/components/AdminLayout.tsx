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
  ChevronRight,
  Bell,
  Settings,
  Palette,
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

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/productos": "Productos",
  "/admin/categorias": "Categorías",
  "/admin/pedidos": "Pedidos",
  "/admin/clientes": "Clientes",
  "/admin/contenido": "Contenido del sitio",
  "/admin/faqs": "FAQs",
  "/admin/mensajes": "Mensajes",
};

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => (window.location.href = "/"),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.97_0.01_295)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-purple animate-pulse" />
          <p className="text-sm text-muted-foreground">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.97_0.01_295)]">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="w-16 h-16 rounded-2xl gradient-purple flex items-center justify-center mx-auto mb-5 shadow-purple">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Panel de administración</h1>
          <p className="text-muted-foreground mb-6 text-sm">Inicia sesión con tu cuenta de administrador para continuar.</p>
          <a href={getLoginUrl()}>
            <button className="w-full px-6 py-3 rounded-xl gradient-purple text-white font-semibold shadow-purple hover:opacity-90 transition-opacity">
              Iniciar sesión
            </button>
          </a>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.97_0.01_295)]">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">🚫</span>
          </div>
          <p className="text-xl font-bold mb-2">Acceso denegado</p>
          <p className="text-muted-foreground mb-6 text-sm">No tienes permisos para acceder al panel de administración.</p>
          <Link href="/">
            <button className="px-6 py-3 rounded-xl gradient-purple text-white font-semibold shadow-purple">
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

  const currentTitle = title ?? pageTitles[location] ?? "Admin";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
          <div className="w-9 h-9 rounded-xl gradient-purple flex items-center justify-center shadow-purple flex-shrink-0">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-tight">BoraHae Art</p>
            <p className="text-xs text-white/50 leading-tight">Panel Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 px-3 mb-1.5">
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-white/15 text-white shadow-sm"
                        : "text-white/65 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-white/50"}`} />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-white/60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-white/10 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/65 hover:bg-white/8 hover:text-white transition-all"
          onClick={() => setSidebarOpen(false)}
        >
          <Store className="w-4 h-4 text-white/50" />
          Ver tienda
        </Link>
        <button
          onClick={() => logoutMutation.mutate()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/65 hover:bg-rose-500/20 hover:text-rose-300 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>

        {/* User card */}
        <div className="mt-2 px-3 py-2.5 rounded-xl bg-white/8 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full gradient-purple flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-purple">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.name ?? "Admin"}</p>
            <p className="text-[10px] text-white/45 truncate">{user?.email ?? ""}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="En línea" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "oklch(0.97 0.01 295)" }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-56 flex-shrink-0"
        style={{
          background: "linear-gradient(180deg, oklch(0.22 0.12 295) 0%, oklch(0.18 0.10 295) 100%)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="fixed left-0 top-0 bottom-0 w-56 z-50 lg:hidden flex flex-col"
            style={{
              background: "linear-gradient(180deg, oklch(0.22 0.12 295) 0%, oklch(0.18 0.10 295) 100%)",
            }}
          >
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header
          className="h-14 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 border-b"
          style={{
            background: "oklch(1 0 0)",
            borderColor: "oklch(0.93 0.02 295)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-foreground text-base leading-tight">{currentTitle}</h1>
              <p className="text-[11px] text-muted-foreground leading-tight hidden sm:block">
                Panel de administración · BoraHae Art
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/mensajes">
              <button className="p-2 rounded-xl hover:bg-muted transition-colors relative">
                <Bell className="w-4.5 h-4.5 text-muted-foreground" />
              </button>
            </Link>
            <Link href="/admin/contenido">
              <button className="p-2 rounded-xl hover:bg-muted transition-colors">
                <Settings className="w-4.5 h-4.5 text-muted-foreground" />
              </button>
            </Link>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-8 h-8 rounded-full gradient-purple flex items-center justify-center text-white text-xs font-bold shadow-purple">
                {user?.name?.[0]?.toUpperCase() ?? "A"}
              </div>
              <span className="text-sm font-medium text-foreground hidden md:block">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
