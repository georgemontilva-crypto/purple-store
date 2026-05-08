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
