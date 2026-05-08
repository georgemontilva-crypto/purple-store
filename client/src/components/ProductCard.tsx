import { ShoppingBag, Heart, Star } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useState } from "react";

interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  price: string;
  comparePrice?: string | null;
  imageUrl?: string | null;
  categoryName?: string;
  featured?: boolean;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  comparePrice,
  imageUrl,
  categoryName,
  featured,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [wished, setWished] = useState(false);
  const [adding, setAdding] = useState(false);

  const discount =
    comparePrice && parseFloat(comparePrice) > parseFloat(price)
      ? Math.round((1 - parseFloat(price) / parseFloat(comparePrice)) * 100)
      : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    addToCart(id);
    toast.success("Producto añadido al carrito", {
      description: name,
      duration: 2000,
    });
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <Link href={`/producto/${slug}`}>
      <div className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-purple cursor-pointer">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full gradient-purple-soft flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-primary/30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {featured && (
              <span className="px-2.5 py-1 gradient-purple text-white text-xs font-semibold rounded-full shadow-purple">
                Destacado
              </span>
            )}
            {discount && (
              <span className="px-2.5 py-1 bg-rose-500 text-white text-xs font-semibold rounded-full">
                -{discount}%
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setWished(!wished);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-sm"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${wished ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`}
            />
          </button>

          {/* Add to cart overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className={`w-full py-2.5 rounded-xl gradient-purple text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-purple transition-all ${adding ? "scale-95 opacity-80" : "hover:opacity-90"}`}
            >
              <ShoppingBag className="w-4 h-4" />
              {adding ? "Añadiendo..." : "Añadir al carrito"}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {categoryName && (
            <p className="text-xs text-primary font-medium mb-1 uppercase tracking-wider">
              {categoryName}
            </p>
          )}
          <h3 className="font-medium text-foreground text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground">
              ${parseFloat(price).toFixed(2)}
            </span>
            {comparePrice && parseFloat(comparePrice) > parseFloat(price) && (
              <span className="text-sm text-muted-foreground line-through">
                ${parseFloat(comparePrice).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
