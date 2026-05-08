import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
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
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-background z-50 shadow-2xl transition-transform duration-300 flex flex-col ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Mi carrito</h2>
            {cartItems.length > 0 && (
              <span className="w-5 h-5 gradient-purple text-white text-xs rounded-full flex items-center justify-center font-bold">
                {cartItems.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 rounded-full gradient-purple-soft flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Tu carrito está vacío</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Descubre nuestros productos y añade algo especial
                </p>
              </div>
              <Link href="/tienda" onClick={() => setCartOpen(false)}>
                <Button className="rounded-full gradient-purple text-white border-0 shadow-purple">
                  Explorar tienda
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                if (!item.product) return null;
                const price = parseFloat(item.product.price);
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 rounded-xl bg-muted/50 border border-border/50"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full gradient-purple-soft flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-primary/40" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                        {item.product.name}
                      </p>
                      <p className="text-sm font-bold text-primary mt-1">
                        ${price.toFixed(2)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-semibold w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="ml-auto p-1 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
          <div className="p-5 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Subtotal</span>
              <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Envío calculado en el checkout
            </p>
            <Link href="/checkout" onClick={() => setCartOpen(false)}>
              <Button className="w-full rounded-xl gradient-purple text-white border-0 shadow-purple h-12 text-base font-semibold">
                Finalizar compra
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/tienda" onClick={() => setCartOpen(false)}>
              <Button variant="ghost" className="w-full rounded-xl text-sm">
                Seguir comprando
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
