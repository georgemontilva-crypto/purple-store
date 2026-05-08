import StoreLayout from "@/components/StoreLayout";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, CheckCircle, ShoppingBag, CreditCard, MapPin, Palette, Truck } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function Checkout() {
  const { sessionId, clearCart } = useCart();
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

  const nunito = { fontFamily: "'Nunito', sans-serif" };

  const inputStyle = {
    ...nunito,
    border: "1.5px solid oklch(0.91 0.04 295)",
    borderRadius: "14px",
    fontWeight: "600",
  };

  if (orderNumber) {
    return (
      <StoreLayout hideFooter>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md mx-auto">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)",
                boxShadow: "0 12px 40px oklch(0.42 0.24 295 / 0.35)",
              }}
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-3" style={nunito}>
              ¡Pedido confirmado!
            </h1>
            <p className="text-muted-foreground font-semibold mb-3" style={nunito}>
              Tu pedido ha sido recibido exitosamente.
            </p>
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6"
              style={{
                background: "oklch(0.92 0.06 295)",
                border: "1.5px solid oklch(0.78 0.14 295 / 0.5)",
              }}
            >
              <span className="text-sm font-black" style={{ color: "oklch(0.35 0.22 295)", fontFamily: "'Nunito', sans-serif" }}>
                Pedido #{orderNumber}
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-semibold mb-8" style={nunito}>
              Recibirás una confirmación por email. Guarda tu número de pedido para hacer seguimiento.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/tienda">
                <Button
                  className="w-full rounded-2xl font-black h-12 border-0 hover:opacity-90"
                  style={{
                    ...nunito,
                    background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)",
                    color: "white",
                    boxShadow: "0 6px 24px oklch(0.42 0.24 295 / 0.35)",
                  }}
                >
                  Seguir comprando
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="ghost"
                  className="w-full rounded-2xl font-bold"
                  style={{ ...nunito, color: "oklch(0.55 0.06 295)" }}
                >
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
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "linear-gradient(135deg, oklch(0.92 0.06 295) 0%, oklch(0.78 0.14 295) 100%)" }}
          >
            <ShoppingBag className="w-9 h-9 text-white/60" />
          </div>
          <h1 className="text-2xl font-black mb-3" style={nunito}>Tu carrito está vacío</h1>
          <p className="text-muted-foreground font-semibold mb-6" style={nunito}>
            Agrega algunos cuadros antes de continuar
          </p>
          <Link href="/tienda">
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
      </StoreLayout>
    );
  }

  return (
    <StoreLayout hideFooter>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <Link href="/tienda">
          <Button
            variant="ghost"
            className="rounded-full gap-1.5 mb-6 -ml-2 font-bold"
            style={{ ...nunito, color: "oklch(0.55 0.06 295)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
          </Button>
        </Link>

        <h1 className="text-3xl font-black text-foreground mb-8" style={nunito}>
          Finalizar compra
        </h1>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-7">
            {/* Contact */}
            <div
              className="p-6 rounded-2xl"
              style={{ background: "oklch(0.98 0.008 295)", border: "1.5px solid oklch(0.91 0.04 295)" }}
            >
              <h2 className="font-black text-foreground text-base mb-5 flex items-center gap-2" style={nunito}>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)" }}
                >
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                Información de contacto
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-black text-foreground" style={nunito}>
                    Nombre completo <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="Tu nombre"
                    value={form.guestName}
                    onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-black text-foreground" style={nunito}>
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={form.guestEmail}
                    onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-black text-foreground" style={nunito}>Teléfono / WhatsApp</label>
                  <Input
                    placeholder="+57 300 000 0000"
                    value={form.guestPhone}
                    onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div
              className="p-6 rounded-2xl"
              style={{ background: "oklch(0.98 0.008 295)", border: "1.5px solid oklch(0.91 0.04 295)" }}
            >
              <h2 className="font-black text-foreground text-base mb-5 flex items-center gap-2" style={nunito}>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)" }}
                >
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                Dirección de envío
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-black text-foreground" style={nunito}>
                    Dirección <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="Calle, número, apartamento..."
                    value={form.shippingAddress}
                    onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-black text-foreground" style={nunito}>
                    Ciudad <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="Ciudad"
                    value={form.shippingCity}
                    onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-black text-foreground" style={nunito}>
                    País <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="Colombia"
                    value={form.shippingCountry}
                    onChange={(e) => setForm({ ...form, shippingCountry: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-black text-foreground" style={nunito}>Código postal</label>
                  <Input
                    placeholder="110000"
                    value={form.shippingZip}
                    onChange={(e) => setForm({ ...form, shippingZip: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div
              className="p-6 rounded-2xl"
              style={{ background: "oklch(0.98 0.008 295)", border: "1.5px solid oklch(0.91 0.04 295)" }}
            >
              <label className="text-sm font-black text-foreground block mb-1.5" style={nunito}>
                Notas del pedido (opcional)
              </label>
              <textarea
                placeholder="Instrucciones especiales, referencias de encargo, etc..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 focus:outline-none focus:ring-2 bg-background text-foreground placeholder:text-muted-foreground text-sm resize-none transition-all font-semibold"
                style={{
                  ...nunito,
                  border: "1.5px solid oklch(0.91 0.04 295)",
                  borderRadius: "14px",
                }}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-2xl font-black h-14 text-base border-0 hover:opacity-90 transition-opacity"
              style={{
                ...nunito,
                background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)",
                color: "white",
                boxShadow: "0 8px 32px oklch(0.42 0.24 295 / 0.40)",
              }}
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? "Procesando..." : `Confirmar pedido · $${subtotal.toFixed(2)}`}
            </Button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div
              className="sticky top-24 rounded-2xl p-6 space-y-4"
              style={{
                background: "oklch(0.98 0.008 295)",
                border: "1.5px solid oklch(0.91 0.04 295)",
                boxShadow: "0 4px 24px oklch(0.42 0.24 295 / 0.08)",
              }}
            >
              <h2 className="font-black text-foreground text-base" style={nunito}>Resumen del pedido</h2>

              <div className="space-y-3">
                {cartItems.map((item) => {
                  if (!item.product) return null;
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div
                        className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ border: "1px solid oklch(0.91 0.04 295)" }}
                      >
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, oklch(0.92 0.06 295) 0%, oklch(0.78 0.14 295) 100%)" }}
                          >
                            <Palette className="w-5 h-5 text-white/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-foreground line-clamp-1" style={nunito}>{item.product.name}</p>
                        <p className="text-xs font-semibold text-muted-foreground" style={nunito}>Cant: {item.quantity}</p>
                        <p className="text-sm font-black" style={{ ...nunito, color: "oklch(0.35 0.22 295)" }}>
                          ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                className="pt-4 space-y-2"
                style={{ borderTop: "1.5px solid oklch(0.91 0.04 295)" }}
              >
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-semibold" style={nunito}>Subtotal</span>
                  <span className="font-bold" style={nunito}>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-semibold" style={nunito}>Envío</span>
                  <span className="font-black" style={{ ...nunito, color: "oklch(0.45 0.18 160)" }}>Gratis</span>
                </div>
                <div
                  className="flex justify-between font-black text-lg pt-3"
                  style={{ borderTop: "1.5px solid oklch(0.91 0.04 295)", ...nunito }}
                >
                  <span>Total</span>
                  <span style={{ color: "oklch(0.35 0.22 295)" }}>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust */}
              <div
                className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: "oklch(0.92 0.06 295)" }}
              >
                <Truck className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.42 0.24 295)" }} />
                <p className="text-xs font-black" style={{ color: "oklch(0.35 0.22 295)", fontFamily: "'Nunito', sans-serif" }}>
                  Envío gratis en todos los pedidos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
