import SidebarNav from "./SidebarNav";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import { CartProvider } from "@/contexts/CartContext";

interface StoreLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

function StoreLayoutInner({ children, hideFooter }: StoreLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar fijo izquierdo */}
      <SidebarNav />

      {/* Contenido principal desplazado a la derecha del sidebar */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: "72px" }}>
        <main className="flex-1">
          {children}
        </main>
        {!hideFooter && <Footer />}
      </div>

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
