import StoreLayout from "@/components/StoreLayout";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, CheckCircle, ShoppingBag, CreditCard, MapPin } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function Checkout() {
  const { sessionId, clearCart } = useCart();
  const [, navigate] = useLocation();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const { data: cartItems = [] } = trpc.cart.get.useQuery({ sessionId });

  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    shippingAddress: "",
    shippingCity: "",
    shippingCountry: "",
    shippingZip: "",
    notes: "",
  });

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (order) => {
      setOrderNumber(order.orderNumber);
      clearCart();
    },
    onError: (err) => {
      toast.error("Error al procesar el pedido", { description: err.message });
    },
  });

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + parseFloat(item.product?.price ?? "0") * item.quantity;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guestName || !form.guestEmail || !form.shippingAddress || !form.shippingCity || !form.shippingCountry) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }
    createOrderMutation.mutate({ sessionId, ...form });
  };

  if (orderNumber) {
    return (
      <StoreLayout hideFooter>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-24 h-24 rounded-full gradient-purple-soft flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
            <h1
              className="text-3xl font-bold text-foreground mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              ¡Pedido confirmado!
            </h1>
            <p className="text-muted-foreground mb-2">
              Tu pedido ha sido recibido exitosamente.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <span className="text-sm font-medium text-primary">Número de pedido: {orderNumber}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              Recibirás una confirmación por email. Guarda tu número de pedido para hacer seguimiento.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/tienda">
                <Button className="w-full rounded-xl gradient-purple text-white border-0 shadow-purple">
                  Seguir comprando
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full rounded-xl">
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 lg:px-8 py-24 text-center">
          <ShoppingBag className="w-16 h-16 text-primary/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
          <Link href="/tienda">
            <Button className="rounded-full gradient-purple text-white border-0">
              Explorar tienda
            </Button>
          </Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout hideFooter>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <Link href="/tienda">
          <Button variant="ghost" className="rounded-full text-muted-foreground gap-1.5 mb-8 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
          </Button>
        </Link>

        <h1
          className="text-3xl font-bold text-foreground mb-8"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Finalizar compra
        </h1>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8">
            {/* Contact info */}
            <div>
              <h2 className="font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Información de contacto
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre completo <span className="text-rose-500">*</span></label>
                  <Input
                    placeholder="Tu nombre"
                    value={form.guestName}
                    onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email <span className="text-rose-500">*</span></label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={form.guestEmail}
                    onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Teléfono</label>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    value={form.guestPhone}
                    onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h2 className="font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Dirección de envío
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Dirección <span className="text-rose-500">*</span></label>
                  <Input
                    placeholder="Calle, número, apartamento..."
                    value={form.shippingAddress}
                    onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ciudad <span className="text-rose-500">*</span></label>
                  <Input
                    placeholder="Ciudad"
                    value={form.shippingCity}
                    onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">País <span className="text-rose-500">*</span></label>
                  <Input
                    placeholder="País"
                    value={form.shippingCountry}
                    onChange={(e) => setForm({ ...form, shippingCountry: e.target.value })}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Código postal</label>
                  <Input
                    placeholder="00000"
                    value={form.shippingZip}
                    onChange={(e) => setForm({ ...form, shippingZip: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas del pedido (opcional)</label>
              <textarea
                placeholder="Instrucciones especiales para la entrega..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-border/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground placeholder:text-muted-foreground text-sm resize-none"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-xl gradient-purple text-white border-0 shadow-purple h-14 text-base font-semibold hover:opacity-90"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? "Procesando..." : `Confirmar pedido • $${subtotal.toFixed(2)}`}
            </Button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-card rounded-2xl border border-border/50 p-6 space-y-4">
              <h2 className="font-semibold text-foreground text-lg">Resumen del pedido</h2>

              <div className="space-y-3">
                {cartItems.map((item) => {
                  if (!item.product) return null;
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full gradient-purple-soft" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                        <p className="text-sm font-bold text-foreground">
                          ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-emerald-600 font-medium">Gratis</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
