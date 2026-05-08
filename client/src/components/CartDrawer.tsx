import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight, Palette } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CartDrawer() {
  const { sessionId, cartOpen, setCartOpen, removeFromCart, updateQuantity } = useCart();

  const { data: cartItems = [] } = trpc.cart.get.useQuery(
    { sessionId },
    { enabled: cartOpen, refetchOnWindowFocus: false }
  );

  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.product?.price ?? "0");
    return sum + price * item.quantity;
  }, 0);

  const nunito = { fontFamily: "'Nunito', sans-serif" };

  return (
    <>
      {/* Overlay */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 shadow-2xl transition-transform duration-300 flex flex-col ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "white" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1.5px solid oklch(0.91 0.04 295)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)" }}
            >
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-black text-foreground text-base" style={nunito}>Mi carrito</h2>
            {cartItems.length > 0 && (
              <span
                className="w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-black"
                style={{
                  background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                {cartItems.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 rounded-xl transition-colors hover:bg-muted"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, oklch(0.92 0.06 295) 0%, oklch(0.78 0.14 295) 100%)" }}
              >
                <ShoppingBag className="w-9 h-9 text-white/60" />
              </div>
              <div>
                <p className="font-black text-foreground" style={nunito}>Tu carrito está vacío</p>
                <p className="text-sm font-semibold text-muted-foreground mt-1" style={nunito}>
                  Descubre nuestros cuadros y añade algo especial
                </p>
              </div>
              <Link href="/tienda" onClick={() => setCartOpen(false)}>
                <Button
                  className="rounded-full font-black border-0"
                  style={{
                    ...nunito,
                    background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)",
                    color: "white",
                  }}
                >
                  Explorar tienda
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => {
                if (!item.product) return null;
                const price = parseFloat(item.product.price);
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 rounded-2xl transition-all"
                    style={{
                      background: "oklch(0.98 0.008 295)",
                      border: "1.5px solid oklch(0.91 0.04 295)",
                    }}
                  >
                    {/* Image */}
                    <div
                      className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ border: "1px solid oklch(0.91 0.04 295)" }}
                    >
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, oklch(0.92 0.06 295) 0%, oklch(0.78 0.14 295) 100%)" }}
                        >
                          <Palette className="w-5 h-5 text-white/50" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-foreground line-clamp-2 leading-snug" style={nunito}>
                        {item.product.name}
                      </p>
                      <p className="text-sm font-black mt-1" style={{ ...nunito, color: "oklch(0.42 0.24 295)" }}>
                        ${price.toFixed(2)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                          style={{ background: "oklch(0.92 0.06 295)", border: "1px solid oklch(0.82 0.10 295 / 0.5)" }}
                        >
                          <Minus className="w-3 h-3" style={{ color: "oklch(0.42 0.24 295)" }} />
                        </button>
                        <span className="text-sm font-black w-5 text-center" style={nunito}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                          style={{ background: "oklch(0.92 0.06 295)", border: "1px solid oklch(0.82 0.10 295 / 0.5)" }}
                        >
                          <Plus className="w-3 h-3" style={{ color: "oklch(0.42 0.24 295)" }} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="ml-auto p-1 rounded-lg transition-colors hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div
            className="p-5 space-y-3"
            style={{ borderTop: "1.5px solid oklch(0.91 0.04 295)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm font-semibold" style={nunito}>Subtotal</span>
              <span className="font-black text-lg" style={{ ...nunito, color: "oklch(0.35 0.22 295)" }}>
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <p className="text-xs font-semibold text-muted-foreground" style={nunito}>
              Envío gratis en todos los pedidos
            </p>
            <Link href="/checkout" onClick={() => setCartOpen(false)}>
              <Button
                className="w-full rounded-2xl font-black h-12 text-base border-0 hover:opacity-90 transition-opacity"
                style={{
                  ...nunito,
                  background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)",
                  color: "white",
                  boxShadow: "0 6px 24px oklch(0.42 0.24 295 / 0.35)",
                }}
              >
                Finalizar compra
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/tienda" onClick={() => setCartOpen(false)}>
              <Button
                variant="ghost"
                className="w-full rounded-2xl text-sm font-bold"
                style={{ ...nunito, color: "oklch(0.55 0.06 295)" }}
              >
                Seguir comprando
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
