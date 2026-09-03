import StoreLayout from "@/components/StoreLayout";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag, ArrowLeft, Star, Minus, Plus, Heart, Palette, Brush, Clock, Shield } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface ProductDetailProps {
  slug: string;
}

export default function ProductDetail({ slug }: ProductDetailProps) {
  const { data: product, isLoading } = trpc.products.bySlug.useQuery({ slug });
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { addToCart, setCartOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const nunito = { fontFamily: "'Nunito', sans-serif" };

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-10 animate-pulse">
            <div className="aspect-square rounded-3xl" style={{ background: "#f6effe" }} />
            <div className="space-y-4">
              <div className="h-6 rounded-2xl w-1/4" style={{ background: "#f6effe" }} />
              <div className="h-10 rounded-2xl w-3/4" style={{ background: "#f6effe" }} />
              <div className="h-8 rounded-2xl w-1/3" style={{ background: "#f6effe" }} />
              <div className="h-24 rounded-2xl" style={{ background: "#f6effe" }} />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 lg:px-8 py-24 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "linear-gradient(135deg, #f6effe 0%, #d6f4f2 100%)" }}
          >
            <Palette className="w-10 h-10 text-white/60" />
          </div>
          <h1 className="text-2xl font-black mb-3" style={nunito}>Cuadro no encontrado</h1>
          <p className="text-muted-foreground mb-6 font-semibold" style={nunito}>
            Este cuadro no existe o fue eliminado
          </p>
          <Link href="/tienda">
            <Button
              className="rounded-full font-black border-0"
              style={{ ...nunito, background: "linear-gradient(135deg, #944fdd 0%, #ff39a0 100%)", color: "white" }}
            >
              Volver a la tienda
            </Button>
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const images = [product.imageUrl, ...(product.images as string[] ?? [])].filter(Boolean) as string[];
  const discount =
    product.comparePrice && parseFloat(product.comparePrice) > parseFloat(product.price)
      ? Math.round((1 - parseFloat(product.price) / parseFloat(product.comparePrice)) * 100)
      : null;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product.id);
    toast.success("¡Añadido al carrito!", { description: `${qty}x ${product.name}` });
    setCartOpen(true);
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ fontFamily: "'Nunito', sans-serif" }}>
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors font-semibold">Inicio</Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/tienda" className="text-muted-foreground hover:text-primary transition-colors font-semibold">Tienda</Link>
          {category && (
            <>
              <span className="text-muted-foreground">/</span>
              <Link href={`/tienda?categoria=${category.slug}`} className="text-muted-foreground hover:text-primary transition-colors font-semibold">
                {category.name}
              </Link>
            </>
          )}
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-black line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-14">
          {/* Images */}
          <div className="space-y-3">
            <div
              className="aspect-square rounded-3xl overflow-hidden relative"
              style={{ border: "1.5px solid #e6dcf8" }}
            >
              {images[selectedImage] ? (
                <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #f6effe 0%, #d6f4f2 100%)" }}
                >
                  <Palette className="w-20 h-20 text-white/40" />
                </div>
              )}
              {discount && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-rose-500 text-white text-sm font-black rounded-full" style={nunito}>
                  -{discount}%
                </span>
              )}
              {/* Wishlist */}
              <button
                onClick={() => setWished(!wished)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "oklch(1 0 0 / 0.95)", boxShadow: "0 2px 8px oklch(0 0 0 / 0.1)" }}
              >
                <Heart className={`w-5 h-5 transition-colors ${wished ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
              </button>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2.5">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className="w-20 h-20 rounded-2xl overflow-hidden transition-all"
                    style={{
                      border: selectedImage === i
                        ? "2.5px solid #862bd8"
                        : "2px solid #e6dcf8",
                      boxShadow: selectedImage === i ? "0 2px 12px rgb(122 22 202 / 0.3)" : "none",
                    }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            {/* Category */}
            {category && (
              <Link href={`/tienda?categoria=${category.slug}`}>
                <span
                  className="text-xs font-black uppercase tracking-widest hover:underline"
                  style={{ color: "#a159f1", fontFamily: "'Nunito', sans-serif" }}
                >
                  {category.name}
                </span>
              </Link>
            )}

            {/* Title */}
            <h1
              className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground leading-tight"
              style={nunito}
            >
              {product.name}
            </h1>

            {/* Stars */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-semibold text-muted-foreground" style={nunito}>(24 reseñas)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl md:text-4xl font-black" style={{ ...nunito, color: "#6400aa" }}>
                ${parseFloat(product.price).toFixed(2)}
              </span>
              {product.comparePrice && parseFloat(product.comparePrice) > parseFloat(product.price) && (
                <span className="text-xl text-muted-foreground line-through font-semibold" style={nunito}>
                  ${parseFloat(product.comparePrice).toFixed(2)}
                </span>
              )}
              {discount && (
                <span
                  className="px-2.5 py-1 text-sm font-black rounded-full"
                  style={{ background: "#f6e6ff", color: "#6400aa", fontFamily: "'Nunito', sans-serif" }}
                >
                  Ahorras {discount}%
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed font-semibold text-sm" style={nunito}>
                {product.description}
              </p>
            )}

            {/* Stock badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-black"
              style={{
                background: product.stock > 0 ? "oklch(0.95 0.08 160)" : "oklch(0.95 0.05 20)",
                color: product.stock > 0 ? "oklch(0.40 0.15 160)" : "oklch(0.50 0.20 20)",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: product.stock > 0 ? "oklch(0.55 0.20 160)" : "oklch(0.60 0.25 20)" }}
              />
              {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-black text-foreground" style={nunito}>Cantidad:</span>
              <div
                className="flex items-center gap-1 p-1 rounded-2xl"
                style={{ border: "1.5px solid #e6dcf8", background: "#f9f7fc" }}
              >
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-accent"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-black text-foreground" style={nunito}>{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-accent"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 rounded-2xl font-black h-14 text-base border-0 hover:opacity-90 transition-opacity"
                style={{
                  ...nunito,
                  background: product.stock === 0
                    ? "#d0cbd9"
                    : "linear-gradient(135deg, #944fdd 0%, #ff39a0 100%)",
                  color: product.stock === 0 ? "#78698f" : "white",
                  boxShadow: product.stock > 0 ? "0 6px 24px rgb(122 22 202 / 0.35)" : "none",
                }}
                disabled={product.stock === 0}
                onClick={handleAddToCart}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {product.stock === 0 ? "Sin stock" : "Añadir al carrito"}
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Brush, label: "Hecho a mano" },
                { icon: Clock, label: "Envío en 3-5 días" },
                { icon: Shield, label: "Garantía total" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center"
                  style={{ background: "#f6f4fb", border: "1px solid #e6dcf8" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#862bd8" }} />
                  <span className="text-xs font-black text-foreground leading-tight" style={nunito}>{label}</span>
                </div>
              ))}
            </div>

            <Link href="/tienda">
              <Button
                variant="ghost"
                className="rounded-full gap-1.5 font-bold -ml-2"
                style={{ ...nunito, color: "#78698f" }}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a la tienda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
