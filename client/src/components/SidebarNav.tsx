import { useCart } from "@/contexts/CartContext";
import { useCustomAuth } from "@/contexts/AuthContext";
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
  UserPlus,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const navLinks = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/tienda", icon: ShoppingBag, label: "Tienda" },
  { href: "/sobre-nosotros", icon: Users, label: "Nosotros" },
  { href: "/contacto", icon: Phone, label: "Contacto" },
  { href: "/faqs", icon: HelpCircle, label: "FAQs" },
];

export default function SidebarNav() {
  const [location] = useLocation();
  const { cartCount, setCartOpen } = useCart();
  const { user, refetch } = useCustomAuth();

  const logoutMutation = trpc.customAuth.logout.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Sesión cerrada");
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
                  if (!active) (e.currentTarget as HTMLDivElement).style.background = "oklch(0.92 0.06 295)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLDivElement).style.background = "transparent";
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
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: "oklch(0.22 0.08 295)" }} />
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="flex flex-col items-center gap-1.5 mt-auto">
        <div className="w-8 h-px mb-1" style={{ background: "oklch(0.91 0.04 295)" }} />

        {/* Cart */}
        <SidebarButton
          icon={<ShoppingCart className="w-5 h-5" style={{ color: "oklch(0.52 0.14 295)" }} />}
          label="Carrito"
          onClick={() => setCartOpen(true)}
          badge={cartCount > 0 ? (cartCount > 9 ? "9+" : String(cartCount)) : undefined}
        />

        {/* Admin (only for admins) */}
        {user?.role === "admin" && (
          <Link href="/admin">
            <SidebarIconLink
              icon={<Settings className="w-5 h-5" style={{ color: location.startsWith("/admin") ? "white" : "oklch(0.52 0.14 295)" }} />}
              label="Panel Admin"
              active={location.startsWith("/admin")}
            />
          </Link>
        )}

        {/* User / Login / Register */}
        {user ? (
          <div className="relative group">
            <button
              onClick={() => logoutMutation.mutate()}
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-150 overflow-hidden"
              style={{ background: "oklch(0.92 0.06 295)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.88 0.08 295)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.92 0.06 295)"; }}
              title={user.name ?? "Usuario"}
            >
              {user.name ? (
                <span className="text-sm font-black" style={{ color: "oklch(0.35 0.22 295)", fontFamily: "'Nunito', sans-serif" }}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-5 h-5" style={{ color: "oklch(0.42 0.24 295)" }} />
              )}
            </button>
            <div
              className="absolute left-14 bottom-0 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
              style={{ background: "oklch(0.22 0.08 295)", color: "white", fontFamily: "'Nunito', sans-serif", boxShadow: "0 4px 12px oklch(0 0 0 / 0.25)" }}
            >
              <p style={{ color: "oklch(0.85 0.06 295)" }}>{user.name}</p>
              <p className="font-semibold mt-0.5 flex items-center gap-1" style={{ color: "oklch(0.65 0.08 295)" }}>
                <LogOut className="w-3 h-3" /> Cerrar sesión
              </p>
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: "oklch(0.22 0.08 295)" }} />
            </div>
          </div>
        ) : (
          <>
            <Link href="/login">
              <SidebarIconLink
                icon={<LogIn className="w-5 h-5" style={{ color: isActive("/login") ? "white" : "oklch(0.52 0.14 295)" }} />}
                label="Iniciar sesión"
                active={isActive("/login")}
              />
            </Link>
            <Link href="/registro">
              <SidebarIconLink
                icon={<UserPlus className="w-5 h-5" style={{ color: isActive("/registro") ? "white" : "oklch(0.52 0.14 295)" }} />}
                label="Registrarse"
                active={isActive("/registro")}
              />
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}

// Helper components
function SidebarButton({
  icon, label, onClick, badge,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  badge?: string;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-150"
        style={{ background: "transparent" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.92 0.06 295)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        title={label}
      >
        {icon}
        {badge && (
          <span
            className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none"
            style={{ background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)", width: "18px", height: "18px", fontFamily: "'Nunito', sans-serif" }}
          >
            {badge}
          </span>
        )}
      </button>
      <div
        className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
        style={{ background: "oklch(0.22 0.08 295)", color: "white", fontFamily: "'Nunito', sans-serif", boxShadow: "0 4px 12px oklch(0 0 0 / 0.25)" }}
      >
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: "oklch(0.22 0.08 295)" }} />
      </div>
    </div>
  );
}

function SidebarIconLink({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div
      className="relative group w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-150"
      style={{
        background: active ? "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)" : "transparent",
        boxShadow: active ? "0 4px 14px oklch(0.42 0.24 295 / 0.30)" : "none",
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "oklch(0.92 0.06 295)"; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
    >
      {icon}
      <div
        className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
        style={{ background: "oklch(0.22 0.08 295)", color: "white", fontFamily: "'Nunito', sans-serif", boxShadow: "0 4px 12px oklch(0 0 0 / 0.25)" }}
      >
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: "oklch(0.22 0.08 295)" }} />
      </div>
    </div>
  );
}
