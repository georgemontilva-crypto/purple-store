import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import { CartProvider } from "@/contexts/CartContext";

interface StoreLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

function StoreLayoutInner({ children, hideFooter }: StoreLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      {!hideFooter && <Footer />}
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
