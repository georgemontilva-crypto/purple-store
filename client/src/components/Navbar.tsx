import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ShoppingBag, Menu, X, User, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/tienda", label: "Tienda" },
  { href: "/sobre-nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
  { href: "/faqs", label: "FAQs" },
];

export default function Navbar() {
  const { cartCount, setCartOpen } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-sm border-b border-border/50" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl gradient-purple flex items-center justify-center shadow-purple">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span
              className="font-display font-semibold text-xl text-foreground group-hover:text-primary transition-colors"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Purple Store
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  location === link.href
                    ? "bg-primary text-primary-foreground shadow-purple"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 rounded-full hover:bg-accent transition-colors"
              aria-label="Carrito de compras"
            >
              <ShoppingBag className="w-5 h-5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 gradient-purple text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-purple">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* User */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1">
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="hidden md:flex gap-1.5 rounded-full text-primary hover:bg-accent">
                      <Settings className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <div className="w-8 h-8 rounded-full gradient-purple flex items-center justify-center text-white text-sm font-semibold shadow-purple">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </div>
              </div>
            ) : (
              <a href={getLoginUrl()}>
                <Button
                  size="sm"
                  className="hidden md:flex rounded-full gradient-purple text-white border-0 shadow-purple hover:opacity-90 transition-opacity"
                >
                  <User className="w-4 h-4 mr-1.5" />
                  Entrar
                </Button>
              </a>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-full hover:bg-accent transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border/50">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <a href={getLoginUrl()} className="mt-2">
                <Button className="w-full rounded-xl gradient-purple text-white border-0">
                  Iniciar sesión
                </Button>
              </a>
            )}
            {user?.role === "admin" && (
              <Link href="/admin">
                <Button variant="outline" className="w-full rounded-xl mt-1">
                  Panel de administración
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
