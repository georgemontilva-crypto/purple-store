import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import {
  Home,
  ShoppingBag,
  Users,
  Phone,
  HelpCircle,
  ShoppingCart,
  Settings,
  LogOut,
  LogIn,
  Palette,
  User,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const navLinks = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/tienda", icon: ShoppingBag, label: "Tienda" },
  { href: "/nosotros", icon: Users, label: "Nosotros" },
  { href: "/contacto", icon: Phone, label: "Contacto" },
  { href: "/faqs", icon: HelpCircle, label: "FAQs" },
];

export default function SidebarNav() {
  const [location] = useLocation();
  const { cartCount, setCartOpen } = useCart();
  const { user, isAuthenticated } = useAuth();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: () => {
      toast.error("Error al cerrar sesión");
    },
  });

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const nunito = { fontFamily: "'Nunito', sans-serif" };

  return (
    <aside
      className="fixed top-0 left-0 h-full z-40 flex flex-col items-center py-5 gap-2"
      style={{
        width: "72px",
        background: "oklch(0.98 0.008 295)",
        borderRight: "1.5px solid oklch(0.91 0.04 295)",
        boxShadow: "2px 0 16px oklch(0.42 0.24 295 / 0.06)",
      }}
    >
      {/* Logo */}
      <Link href="/">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3 cursor-pointer transition-transform hover:scale-105"
          style={{
            background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)",
            boxShadow: "0 4px 16px oklch(0.42 0.24 295 / 0.35)",
          }}
          title="BoraHae Art"
        >
          <Palette className="w-5 h-5 text-white" />
        </div>
      </Link>

      {/* Divider */}
      <div className="w-8 h-px mb-1" style={{ background: "oklch(0.91 0.04 295)" }} />

      {/* Nav links */}
      <nav className="flex flex-col items-center gap-1.5 flex-1">
        {navLinks.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}>
              <div
                className="relative group w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-150"
                style={{
                  background: active
                    ? "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)"
                    : "transparent",
                  boxShadow: active ? "0 4px 14px oklch(0.42 0.24 295 / 0.30)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLDivElement).style.background = "oklch(0.92 0.06 295)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }
                }}
                title={label}
              >
                <Icon
                  className="w-5 h-5 transition-colors"
                  style={{ color: active ? "white" : "oklch(0.52 0.14 295)" }}
                />
                {/* Tooltip */}
                <div
                  className="absolute left-14 px-2.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
                  style={{
                    background: "oklch(0.22 0.08 295)",
                    color: "white",
                    fontFamily: "'Nunito', sans-serif",
                    boxShadow: "0 4px 12px oklch(0 0 0 / 0.25)",
                  }}
                >
                  {label}
                  {/* Arrow */}
                  <div
                    className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
                    style={{ borderRightColor: "oklch(0.22 0.08 295)" }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="flex flex-col items-center gap-1.5 mt-auto">
        {/* Divider */}
        <div className="w-8 h-px mb-1" style={{ background: "oklch(0.91 0.04 295)" }} />

        {/* Cart */}
        <div className="relative group">
          <button
            onClick={() => setCartOpen(true)}
            className="relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-150"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.92 0.06 295)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
            title="Carrito"
          >
            <ShoppingCart className="w-5 h-5" style={{ color: "oklch(0.52 0.14 295)" }} />
            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none"
                style={{
                  background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)",
                  width: "18px",
                  height: "18px",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
          {/* Tooltip */}
          <div
            className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
            style={{
              background: "oklch(0.22 0.08 295)",
              color: "white",
              fontFamily: "'Nunito', sans-serif",
              boxShadow: "0 4px 12px oklch(0 0 0 / 0.25)",
            }}
          >
            Carrito
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: "oklch(0.22 0.08 295)" }} />
          </div>
        </div>

        {/* Admin (only for admins) */}
        {user?.role === "admin" && (
          <div className="relative group">
            <Link href="/admin">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-150"
                style={{
                  background: location.startsWith("/admin")
                    ? "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)"
                    : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!location.startsWith("/admin")) {
                    (e.currentTarget as HTMLDivElement).style.background = "oklch(0.92 0.06 295)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!location.startsWith("/admin")) {
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }
                }}
                title="Admin"
              >
                <Settings
                  className="w-5 h-5"
                  style={{ color: location.startsWith("/admin") ? "white" : "oklch(0.52 0.14 295)" }}
                />
              </div>
            </Link>
            <div
              className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
              style={{
                background: "oklch(0.22 0.08 295)",
                color: "white",
                fontFamily: "'Nunito', sans-serif",
                boxShadow: "0 4px 12px oklch(0 0 0 / 0.25)",
              }}
            >
              Panel Admin
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: "oklch(0.22 0.08 295)" }} />
            </div>
          </div>
        )}

        {/* User / Login */}
        {isAuthenticated ? (
          <div className="relative group">
            <button
              onClick={() => logoutMutation.mutate()}
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-150 overflow-hidden"
              style={{ background: "oklch(0.92 0.06 295)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.88 0.08 295)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.92 0.06 295)";
              }}
              title={user?.name ?? "Usuario"}
            >
              {user?.name ? (
                <span
                  className="text-sm font-black"
                  style={{ color: "oklch(0.35 0.22 295)", fontFamily: "'Nunito', sans-serif" }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-5 h-5" style={{ color: "oklch(0.42 0.24 295)" }} />
              )}
            </button>
            <div
              className="absolute left-14 bottom-0 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
              style={{
                background: "oklch(0.22 0.08 295)",
                color: "white",
                fontFamily: "'Nunito', sans-serif",
                boxShadow: "0 4px 12px oklch(0 0 0 / 0.25)",
              }}
            >
              <p style={{ color: "oklch(0.85 0.06 295)" }}>{user?.name}</p>
              <p className="font-semibold mt-0.5" style={{ color: "oklch(0.65 0.08 295)" }}>Cerrar sesión</p>
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: "oklch(0.22 0.08 295)" }} />
            </div>
          </div>
        ) : (
          <div className="relative group">
            <a
              href={getLoginUrl()}
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-150"
              style={{ background: "transparent" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "oklch(0.92 0.06 295)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              }}
              title="Iniciar sesión"
            >
              <LogIn className="w-5 h-5" style={{ color: "oklch(0.52 0.14 295)" }} />
            </a>
            <div
              className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
              style={{
                background: "oklch(0.22 0.08 295)",
                color: "white",
                fontFamily: "'Nunito', sans-serif",
                boxShadow: "0 4px 12px oklch(0 0 0 / 0.25)",
              }}
            >
              Iniciar sesión
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: "oklch(0.22 0.08 295)" }} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
