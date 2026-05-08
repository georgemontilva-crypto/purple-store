import { ShoppingBag, Heart, Palette } from "lucide-react";
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
    toast.success("¡Añadido al carrito!", {
      description: name,
      duration: 2000,
    });
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <Link href={`/producto/${slug}`}>
      <div
        className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
        style={{
          background: "oklch(0.99 0.004 295)",
          border: "1px solid oklch(0.91 0.04 295)",
          boxShadow: "0 2px 12px oklch(0.42 0.24 295 / 0.06)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 8px 32px oklch(0.42 0.24 295 / 0.16)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(0.72 0.18 295 / 0.5)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 2px 12px oklch(0.42 0.24 295 / 0.06)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(0.91 0.04 295)";
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.92 0.06 295) 0%, oklch(0.78 0.14 295) 100%)",
              }}
            >
              <Palette className="w-12 h-12 text-white/50" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {featured && (
              <span
                className="px-2.5 py-1 text-white text-xs font-black rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)",
                  boxShadow: "0 2px 8px oklch(0.42 0.24 295 / 0.4)",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                ✦ Destacado
              </span>
            )}
            {discount && (
              <span className="px-2.5 py-1 bg-rose-500 text-white text-xs font-black rounded-full">
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
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            style={{ background: "oklch(1 0 0 / 0.95)", boxShadow: "0 2px 8px oklch(0 0 0 / 0.1)" }}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${wished ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`}
            />
          </button>

          {/* Add to cart overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className={`w-full py-2.5 rounded-xl text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all ${adding ? "scale-95 opacity-80" : "hover:opacity-90"}`}
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)",
                boxShadow: "0 4px 16px oklch(0.42 0.24 295 / 0.4)",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {adding ? "Añadiendo..." : "Añadir al carrito"}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          {categoryName && (
            <p
              className="text-xs font-bold mb-1 uppercase tracking-wider"
              style={{ color: "oklch(0.62 0.22 295)", fontFamily: "'Nunito', sans-serif" }}
            >
              {categoryName}
            </p>
          )}
          <h3
            className="font-bold text-foreground text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {name}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className="text-base font-black"
              style={{ color: "oklch(0.35 0.22 295)", fontFamily: "'Nunito', sans-serif" }}
            >
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
