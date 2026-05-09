import { useState } from "react";
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
  Menu,
  X,
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

const nunito = { fontFamily: "'Nunito', sans-serif" };
const purple = "oklch(0.42 0.24 295)";
const purpleLight = "oklch(0.62 0.22 295)";
const purpleBg = "oklch(0.98 0.008 295)";
const purpleBorder = "oklch(0.91 0.04 295)";
const purpleHover = "oklch(0.92 0.06 295)";
const purpleDark = "oklch(0.22 0.08 295)";
const purpleMid = "oklch(0.52 0.14 295)";

export default function SidebarNav() {
  const [location] = useLocation();
  const { cartCount, setCartOpen } = useCart();
  const { user, refetch } = useCustomAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: logoData } = trpc.content.get.useQuery({ key: "site_logo" });
  const { data: siteNameData } = trpc.content.get.useQuery({ key: "site_name" });
  const logoUrl = logoData?.value ?? "";
  const siteName = siteNameData?.value ?? "BoraHae Art";

  const logoutMutation = trpc.customAuth.logout.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Sesión cerrada");
      setMobileOpen(false);
      window.location.href = "/";
    },
    onError: () => toast.error("Error al cerrar sesión"),
  });

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const gradientBg = `linear-gradient(135deg, ${purple} 0%, ${purpleLight} 100%)`;

  return (
    <>
      {/* ── DESKTOP SIDEBAR (hidden on mobile) ─────────────────────────── */}
      <aside
        className="hidden md:flex fixed top-0 left-0 h-full z-40 flex-col items-center py-5 gap-2"
        style={{
          width: "72px",
          background: purpleBg,
          borderRight: `1.5px solid ${purpleBorder}`,
          boxShadow: `2px 0 16px oklch(0.42 0.24 295 / 0.06)`,
        }}
      >
        {/* Logo */}
        <Link href="/">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 cursor-pointer transition-transform hover:scale-105"
            style={logoUrl ? {} : { background: gradientBg, boxShadow: `0 4px 16px oklch(0.42 0.24 295 / 0.35)` }}
            title={siteName}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" style={{ borderRadius: "0" }} />
            ) : (
              <Palette className="w-6 h-6 text-white" />
            )}
          </div>
        </Link>

        <div className="w-8 h-px mb-1" style={{ background: purpleBorder }} />

        {/* Nav links */}
        <nav className="flex flex-col items-center gap-1.5 flex-1">
          {navLinks.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href}>
                <div
                  className="relative group w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-150"
                  style={{
                    background: active ? gradientBg : "transparent",
                    boxShadow: active ? `0 4px 14px oklch(0.42 0.24 295 / 0.30)` : "none",
                  }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = purpleHover; }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  title={label}
                >
                  <Icon className="w-5 h-5 transition-colors" style={{ color: active ? "white" : purpleMid }} />
                  {/* Tooltip */}
                  <div
                    className="absolute left-14 px-2.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
                    style={{ background: purpleDark, color: "white", ...nunito, boxShadow: "0 4px 12px oklch(0 0 0 / 0.25)" }}
                  >
                    {label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: purpleDark }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="flex flex-col items-center gap-1.5 mt-auto">
          <div className="w-8 h-px mb-1" style={{ background: purpleBorder }} />

          {/* Cart */}
          <DesktopSidebarButton
            icon={<ShoppingCart className="w-5 h-5" style={{ color: purpleMid }} />}
            label="Carrito"
            onClick={() => setCartOpen(true)}
            badge={cartCount > 0 ? (cartCount > 9 ? "9+" : String(cartCount)) : undefined}
          />

          {user ? (
            <div className="relative group">
              {/* Avatar button - solo muestra el menú, no hace logout */}
              <button
                className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-150"
                style={{ background: purpleHover }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.88 0.08 295)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = purpleHover; }}
                title={user.name ?? "Usuario"}
              >
                {user.name ? (
                  <span className="text-sm font-black" style={{ color: "oklch(0.35 0.22 295)", ...nunito }}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="w-5 h-5" style={{ color: purple }} />
                )}
              </button>
              {/* Dropdown menu */}
              <div
                className="absolute left-14 bottom-0 rounded-xl text-xs font-black whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 z-50 overflow-hidden"
                style={{ background: purpleDark, color: "white", ...nunito, boxShadow: "0 4px 16px oklch(0 0 0 / 0.3)", minWidth: "165px" }}
              >
                {/* User info */}
                <div className="px-3 py-2.5 border-b" style={{ borderColor: "oklch(0.32 0.1 295)" }}>
                  <p className="font-bold text-xs" style={{ color: "oklch(0.88 0.06 295)" }}>{user.name}</p>
                  <p style={{ color: "oklch(0.55 0.08 295)", fontSize: "10px", marginTop: "1px" }}>{user.email}</p>
                </div>
                {/* Admin link */}
                {user.role === "admin" && (
                  <Link href="/admin">
                    <div className="px-3 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors">
                      <Settings className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.72 0.18 295)" }} />
                      <span style={{ color: "oklch(0.88 0.06 295)" }}>Panel Admin</span>
                    </div>
                  </Link>
                )}
                {/* Logout */}
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="w-full px-3 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.62 0.08 295)" }} />
                  <span style={{ color: "oklch(0.72 0.06 295)" }}>Cerrar sesión</span>
                </button>
                <div className="absolute right-full bottom-8 border-4 border-transparent" style={{ borderRightColor: purpleDark }} />
              </div>
            </div>
          ) : (
            <>
              <Link href="/login">
                <DesktopSidebarIconLink
                  icon={<LogIn className="w-5 h-5" style={{ color: isActive("/login") ? "white" : purpleMid }} />}
                  label="Iniciar sesión"
                  active={isActive("/login")}
                />
              </Link>
              <Link href="/registro">
                <DesktopSidebarIconLink
                  icon={<UserPlus className="w-5 h-5" style={{ color: isActive("/registro") ? "white" : purpleMid }} />}
                  label="Registrarse"
                  active={isActive("/registro")}
                />
              </Link>
            </>
          )}
        </div>
      </aside>

      {/* ── MOBILE TOP NAVBAR ───────────────────────────────────────────── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
        style={{
          height: "60px",
          background: purpleBg,
          borderBottom: `1.5px solid ${purpleBorder}`,
          boxShadow: "0 2px 12px oklch(0.42 0.24 295 / 0.08)",
        }}
      >
        {/* Logo */}
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <div className="flex items-center gap-2 cursor-pointer">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-9 w-auto object-contain flex-shrink-0" style={{ maxWidth: "100px" }} />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: gradientBg, boxShadow: `0 3px 10px oklch(0.42 0.24 295 / 0.35)` }}
              >
                <Palette className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="font-black text-base" style={{ color: purple, ...nunito }}>
              {siteName}
            </span>
          </div>
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: purpleHover }}
          >
            <ShoppingCart className="w-4 h-4" style={{ color: purple }} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 text-white text-[9px] font-black rounded-full flex items-center justify-center"
                style={{ background: gradientBg, width: "17px", height: "17px", ...nunito }}
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: mobileOpen ? gradientBg : purpleHover }}
          >
            {mobileOpen
              ? <X className="w-4 h-4 text-white" />
              : <Menu className="w-4 h-4" style={{ color: purple }} />
            }
          </button>
        </div>
      </header>

      {/* ── MOBILE MENU DRAWER ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ top: "60px" }}
          onClick={() => setMobileOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ background: "oklch(0 0 0 / 0.35)" }} />

          {/* Menu panel */}
          <div
            className="absolute top-0 left-0 right-0 flex flex-col"
            style={{
              background: purpleBg,
              borderBottom: `1.5px solid ${purpleBorder}`,
              boxShadow: "0 8px 32px oklch(0.42 0.24 295 / 0.15)",
              borderRadius: "0 0 24px 24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nav links */}
            <nav className="flex flex-col px-4 pt-3 pb-2 gap-1">
              {navLinks.map(({ href, icon: Icon, label }) => {
                const active = isActive(href);
                return (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all"
                      style={{
                        background: active ? gradientBg : "transparent",
                        boxShadow: active ? `0 4px 14px oklch(0.42 0.24 295 / 0.25)` : "none",
                      }}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" style={{ color: active ? "white" : purpleMid }} />
                      <span
                        className="font-bold text-sm"
                        style={{ color: active ? "white" : "oklch(0.35 0.18 295)", ...nunito }}
                      >
                        {label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="mx-4 h-px" style={{ background: purpleBorder }} />

            {/* Bottom actions */}
            <div className="flex flex-col px-4 pt-2 pb-4 gap-1">
              {user?.role === "admin" && (
                <Link href="/admin" onClick={() => setMobileOpen(false)}>
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all"
                    style={{
                      background: location.startsWith("/admin") ? gradientBg : "transparent",
                    }}
                  >
                    <Settings className="w-5 h-5 flex-shrink-0" style={{ color: location.startsWith("/admin") ? "white" : purpleMid }} />
                    <span className="font-bold text-sm" style={{ color: location.startsWith("/admin") ? "white" : "oklch(0.35 0.18 295)", ...nunito }}>
                      Panel Admin
                    </span>
                  </div>
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: purpleHover }}>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: gradientBg }}
                  >
                    <span className="text-xs font-black text-white" style={nunito}>
                      {user.name?.charAt(0).toUpperCase() ?? "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate" style={{ color: "oklch(0.35 0.22 295)", ...nunito }}>{user.name}</p>
                    <p className="text-xs truncate" style={{ color: purpleMid, ...nunito }}>{user.email}</p>
                  </div>
                  <button
                    onClick={() => logoutMutation.mutate()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{ background: "oklch(0.88 0.08 295)", color: "oklch(0.35 0.22 295)", ...nunito }}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Salir
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 mt-1">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                    <div
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm cursor-pointer"
                      style={{ background: purpleHover, color: purple, ...nunito }}
                    >
                      <LogIn className="w-4 h-4" />
                      Iniciar sesión
                    </div>
                  </Link>
                  <Link href="/registro" onClick={() => setMobileOpen(false)} className="flex-1">
                    <div
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm cursor-pointer"
                      style={{ background: gradientBg, color: "white", ...nunito, boxShadow: `0 4px 14px oklch(0.42 0.24 295 / 0.30)` }}
                    >
                      <UserPlus className="w-4 h-4" />
                      Registrarse
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Desktop helper components ────────────────────────────────────────────────

function DesktopSidebarButton({ icon, label, onClick, badge }: {
  icon: React.ReactNode; label: string; onClick?: () => void; badge?: string;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-150"
        style={{ background: "transparent" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = purpleHover; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        title={label}
      >
        {icon}
        {badge && (
          <span
            className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none"
            style={{ background: `linear-gradient(135deg, ${purple} 0%, ${purpleLight} 100%)`, width: "18px", height: "18px", ...nunito }}
          >
            {badge}
          </span>
        )}
      </button>
      <div
        className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
        style={{ background: purpleDark, color: "white", ...nunito, boxShadow: "0 4px 12px oklch(0 0 0 / 0.25)" }}
      >
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: purpleDark }} />
      </div>
    </div>
  );
}

function DesktopSidebarIconLink({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  const gradientBg = `linear-gradient(135deg, ${purple} 0%, ${purpleLight} 100%)`;
  return (
    <div
      className="relative group w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-150"
      style={{
        background: active ? gradientBg : "transparent",
        boxShadow: active ? `0 4px 14px oklch(0.42 0.24 295 / 0.30)` : "none",
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = purpleHover; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
    >
      {icon}
      <div
        className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
        style={{ background: purpleDark, color: "white", ...nunito, boxShadow: "0 4px 12px oklch(0 0 0 / 0.25)" }}
      >
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: purpleDark }} />
      </div>
    </div>
  );
}
