import SidebarNav from "./SidebarNav";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { ShoppingCart } from "lucide-react";

interface StoreLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

function FloatingCartButton() {
  const { cartCount, setCartOpen } = useCart();
  if (cartCount === 0) return null;
  return (
    <button
      onClick={() => setCartOpen(true)}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
      style={{
        background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)",
        boxShadow: "0 8px 32px oklch(0.42 0.24 295 / 0.45)",
        fontFamily: "'Nunito', sans-serif",
      }}
      aria-label="Abrir carrito"
    >
      <div className="relative">
        <ShoppingCart className="w-5 h-5 text-white" />
        <span
          className="absolute -top-2 -right-2 text-[10px] font-black rounded-full flex items-center justify-center leading-none"
          style={{
            background: "oklch(0.92 0.08 295)",
            color: "oklch(0.28 0.18 295)",
            width: "18px",
            height: "18px",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          {cartCount > 9 ? "9+" : cartCount}
        </span>
      </div>
      <span className="text-white text-sm font-black">Ver carrito</span>
    </button>
  );
}

function StoreLayoutInner({ children, hideFooter }: StoreLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Navigation: sidebar on desktop, top navbar on mobile */}
      <SidebarNav />

      {/*
        Desktop: margin-left 72px for sidebar
        Mobile: padding-top 60px for top navbar, no left margin
      */}
      <div
        className="flex-1 flex flex-col w-full"
        style={{ marginLeft: "0" }}
      >
        {/* Desktop sidebar offset */}
        <div className="hidden md:block" style={{ marginLeft: "0" }} />
        <div className="md:ml-[72px] flex flex-col flex-1">
          {/* Mobile top navbar offset */}
          <div className="h-[60px] md:hidden flex-shrink-0" />
          <main className="flex-1">
            {children}
          </main>
          {!hideFooter && <Footer />}
        </div>
      </div>

      {/* Floating cart button - appears when cart has items */}
      <FloatingCartButton />
      <CartDrawer />
    </div>
  );
}

export default function StoreLayout({ children, hideFooter }: StoreLayoutProps) {
  return (
    <CartProvider>
      <StoreLayoutInner hideFooter={hideFooter}>{children}</StoreLayoutInner>
    </CartProvider>
  );
}
