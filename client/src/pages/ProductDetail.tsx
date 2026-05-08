import StoreLayout from "@/components/StoreLayout";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag, ArrowLeft, Star, Minus, Plus, Heart } from "lucide-react";
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

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square rounded-3xl bg-muted" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded-xl w-3/4" />
              <div className="h-6 bg-muted rounded-xl w-1/3" />
              <div className="h-24 bg-muted rounded-xl" />
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
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <Link href="/tienda">
            <Button className="rounded-full gradient-purple text-white border-0">
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
    for (let i = 0; i < qty; i++) {
      addToCart(product.id);
    }
    toast.success("Añadido al carrito", { description: `${qty}x ${product.name}` });
    setCartOpen(true);
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/tienda" className="hover:text-primary transition-colors">Tienda</Link>
          {category && (
            <>
              <span>/</span>
              <Link href={`/tienda?categoria=${category.slug}`} className="hover:text-primary transition-colors">
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-muted relative">
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full gradient-purple-soft flex items-center justify-center">
                  <ShoppingBag className="w-20 h-20 text-primary/20" />
                </div>
              )}
              {discount && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-rose-500 text-white text-sm font-bold rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i ? "border-primary shadow-purple" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {category && (
              <Link href={`/tienda?categoria=${category.slug}`}>
                <span className="text-sm font-medium text-primary uppercase tracking-wider hover:underline">
                  {category.name}
                </span>
              </Link>
            )}

            <h1
              className="text-3xl lg:text-4xl font-bold text-foreground leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {product.name}
            </h1>

            {/* Rating placeholder */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(24 reseñas)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-foreground">
                ${parseFloat(product.price).toFixed(2)}
              </span>
              {product.comparePrice && parseFloat(product.comparePrice) > parseFloat(product.price) && (
                <span className="text-xl text-muted-foreground line-through">
                  ${parseFloat(product.comparePrice).toFixed(2)}
                </span>
              )}
              {discount && (
                <span className="px-2.5 py-1 bg-rose-50 text-rose-600 text-sm font-semibold rounded-full">
                  Ahorras {discount}%
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
              <span className="text-sm text-muted-foreground">
                {product.stock > 0 ? `${product.stock} unidades disponibles` : "Sin stock"}
              </span>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">Cantidad:</span>
              <div className="flex items-center gap-2 border border-border rounded-xl p-1">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 rounded-xl gradient-purple text-white border-0 shadow-purple h-14 text-base font-semibold hover:opacity-90"
                disabled={product.stock === 0}
                onClick={handleAddToCart}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {product.stock === 0 ? "Sin stock" : "Añadir al carrito"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-14 h-14 rounded-xl p-0 border-border"
                onClick={() => setWished(!wished)}
              >
                <Heart className={`w-5 h-5 transition-colors ${wished ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
              </Button>
            </div>

            <Link href="/tienda">
              <Button variant="ghost" className="rounded-full text-muted-foreground gap-1.5 -ml-2">
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
