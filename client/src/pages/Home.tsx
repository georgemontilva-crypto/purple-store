import StoreLayout from "@/components/StoreLayout";
import ProductCard from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Truck,
  Palette,
  Star,
  Clock,
  Heart,
  Package,
  Brush,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef, useCallback } from "react";
/* --- Hero Carousel ---------------------------------------------------------- */
function HeroSection() {
  const { data: heroTitle } = trpc.content.get.useQuery({ key: "hero_title" });
  const { data: heroSubtitle } = trpc.content.get.useQuery({ key: "hero_subtitle" });
  const { data: heroCta } = trpc.content.get.useQuery({ key: "hero_cta" });
  const { data: slides = [] } = trpc.banner.list.useQuery();

  const title = heroTitle?.value ?? "Detalles que\nEnamoran";
  const subtitle = heroSubtitle?.value ?? "Accesorios, maquillaje y arreglos florales elegidos con cariño. Stock disponible y pedidos personalizados.";
  const ctaText = heroCta?.value ?? "Ver coleccion";

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const total = slides.length;

  const goTo = useCallback((idx: number) => {
    setCurrent((prev) => {
      const prevVid = videoRefs.current[prev];
      if (prevVid) { prevVid.pause(); prevVid.currentTime = 0; }
      return idx;
    });
  }, []);

  const next = useCallback(() => goTo((current + 1) % total), [current, total, goTo]);
  const prev = useCallback(() => goTo((current - 1 + total) % total), [current, total, goTo]);

  useEffect(() => {
    if (total <= 1 || paused) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [total, paused, next]);

  useEffect(() => {
    if (!slides[current]) return;
    if (slides[current].type === "video") {
      const vid = videoRefs.current[current];
      if (vid) { vid.play().catch(() => {}); }
    }
  }, [current, slides]);

  const hasSlides = total > 0;
  const currentSlide = slides[current];

  return (
    <section className="py-4 px-4 lg:px-8">
      <div
        className="hero-container relative w-full"
        style={{ minHeight: "480px", maxHeight: "680px", borderRadius: "1.5rem", overflow: "hidden" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {hasSlides ? (
          <div className="absolute inset-0">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
              >
                {slide.type === "video" ? (
                  <video
                    ref={(el) => { videoRefs.current[i] = el; }}
                    src={slide.url}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay={i === 0}
                  />
                ) : (
                  <img src={slide.url} alt={slide.title ?? `Slide ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[rgb(18 0 42 / 0.80)] via-[rgb(18 0 42 / 0.45)] to-transparent" />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(125deg, #2a1147 0%, #7331bd 35%, #ff39a0 68%, #40c9e9 100%)" }}
          >
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: "#e3c8ff" }} />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: "#f6e6ff" }} />
            <div className="absolute top-8 right-24 w-16 h-16 rounded-full border-2 border-white/20" />
            <div className="absolute top-16 right-40 w-8 h-8 rounded-full border border-white/15" />
            <div className="absolute bottom-12 right-16 w-24 h-24 rounded-full border-2 border-white/10" />
          </div>
        )}
        <div className="relative z-10 flex flex-col justify-center h-full px-5 sm:px-8 lg:px-14 py-12 lg:py-16" style={{ minHeight: "480px" }}>
          <div className="max-w-xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-sm font-semibold"
              style={{ background: "oklch(1 0 0 / 0.15)", border: "1px solid oklch(1 0 0 / 0.25)", color: "white", backdropFilter: "blur(8px)" }}
            >
              <Brush className="w-3.5 h-3.5" />
              Elegido con cariño · Envío a todo el país
            </div>
            <h1
              className="font-black leading-tight mb-4 text-white"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontFamily: "'Nunito', sans-serif", whiteSpace: "pre-line", textShadow: "0 2px 20px oklch(0 0 0 / 0.3)" }}
            >
              {(hasSlides && currentSlide?.title) ? currentSlide.title : title}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed mb-5 lg:mb-7" style={{ color: "oklch(1 0 0 / 0.85)", maxWidth: "420px" }}>
              {(hasSlides && currentSlide?.subtitle) ? currentSlide.subtitle : subtitle}
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link href="/tienda">
                <Button size="lg" className="rounded-full font-bold h-12 px-7 text-sm border-0 shadow-lg hover:scale-105 transition-transform" style={{ background: "oklch(1 0 0)", color: "#6400aa" }}>
                  {ctaText}<ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/tienda?tipo=encargo">
                <Button size="lg" variant="outline" className="rounded-full font-bold h-12 px-7 text-sm hover:scale-105 transition-transform" style={{ borderColor: "oklch(1 0 0 / 0.4)", color: "white", background: "oklch(1 0 0 / 0.08)", backdropFilter: "blur(8px)" }}>
                  Pedir por encargo
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 right-6 hidden lg:flex gap-3" style={{ zIndex: 10 }}>
          {[{ value: "100%", label: "Hecho a mano" }, { value: "+200", label: "Cuadros vendidos" }, { value: "★ 5.0", label: "Calificacion" }].map((s, i) => (
            <div key={i} className="flex flex-col items-center px-4 py-2.5 rounded-2xl text-center" style={{ background: "oklch(1 0 0 / 0.12)", border: "1px solid oklch(1 0 0 / 0.2)", backdropFilter: "blur(12px)", color: "white" }}>
              <span className="font-black text-lg leading-none">{s.value}</span>
              <span className="text-xs mt-0.5" style={{ color: "oklch(1 0 0 / 0.7)" }}>{s.label}</span>
            </div>
          ))}
        </div>
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "oklch(1 0 0 / 0.18)", border: "1px solid oklch(1 0 0 / 0.3)", backdropFilter: "blur(8px)", zIndex: 10 }}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "oklch(1 0 0 / 0.18)", border: "1px solid oklch(1 0 0 / 0.3)", backdropFilter: "blur(8px)", zIndex: 10 }}
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}
        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5" style={{ zIndex: 10 }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === current ? "20px" : "6px",
                  height: "6px",
                  background: i === current ? "oklch(1 0 0)" : "oklch(1 0 0 / 0.45)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* --- Quick Info Bar (Marquee) ------------------------------------------------- */
function QuickInfoBar() {
  const items = [
    { icon: Brush, text: "Pintado a mano" },
    { icon: Package, text: "Stock disponible" },
    { icon: Clock, text: "Encargos en 7-14 días" },
    { icon: Heart, text: "Personalizable" },
    { icon: Truck, text: "Envío a todo el país" },
    { icon: Shield, text: "Garantía de calidad" },
  ];
  // Duplicamos para el loop infinito
  const doubled = [...items, ...items];
  return (
    <div className="px-4 lg:px-8 py-3">
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll 18s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div
        className="rounded-2xl py-3 overflow-hidden"
        style={{
          background: "#f4effd",
          border: "1px solid #e6dcf8",
        }}
      >
        <div className="flex">
          <div className="marquee-track flex items-center gap-0 whitespace-nowrap">
            {doubled.map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-5 flex-shrink-0">
                <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-semibold text-foreground">{item.text}</span>
                <span className="ml-4 text-primary/30 font-bold">✦</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Featured Categories ----------------------------------------------------- */
function FeaturedCategories() {
  const { data: categories = [] } = trpc.categories.featured.useQuery();

  return (
    <section className="py-10 px-4 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-foreground">Categorías</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Explora por estilo</p>
        </div>
        <Link href="/tienda">
          <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-accent gap-1 font-bold">
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Carrusel en móvil, grid en desktop */}
      <div className="sm:hidden -mx-4 px-4">
        <div
          className="no-scrollbar flex gap-3 overflow-x-auto pb-2"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {(categories.length > 0
            ? categories.map((cat) => (
                <Link key={cat.id} href={`/tienda?categoria=${cat.slug}`}>
                  <div
                    className="group relative rounded-2xl overflow-hidden cursor-pointer flex-shrink-0"
                    style={{ aspectRatio: "3/4", width: "72vw", scrollSnapAlign: "start" }}
                  >
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, oklch(0.88 0.10 ${340 - (cat.id * 35) % 150}) 0%, oklch(0.68 0.18 ${330 - (cat.id * 40) % 140}) 100%)` }}
                      >
                        <Palette className="w-10 h-10 text-white/60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-black text-sm leading-tight">{cat.name}</h3>
                    </div>
                  </div>
                </Link>
              ))
            : ["Accesorios", "Maquillaje", "Flores", "Regalos", "Cuidado personal", "Personalizados"].map((name, i) => (
                <Link key={i} href="/tienda">
                  <div
                    className="group relative rounded-2xl overflow-hidden cursor-pointer flex-shrink-0"
                    style={{ aspectRatio: "3/4", width: "72vw", scrollSnapAlign: "start" }}
                  >
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, oklch(0.88 0.10 ${340 - (i * 35) % 150}) 0%, oklch(0.62 0.20 ${330 - (i * 40) % 140}) 100%)` }}
                    >
                      <Palette className="w-10 h-10 text-white/50" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-black text-sm">{name}</h3>
                    </div>
                  </div>
                </Link>
              ))
          )}
        </div>
      </div>

      {/* Grid en sm+ */}
      {categories.length > 0 ? (
        <div className="hidden sm:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/tienda?categoria=${cat.slug}`}>
              <div
                className="group relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-purple transition-all duration-300 hover:-translate-y-1"
                style={{ aspectRatio: "3/4" }}
              >
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, oklch(0.88 0.10 ${340 - (cat.id * 35) % 150}) 0%, oklch(0.68 0.18 ${330 - (cat.id * 40) % 140}) 100%)` }}
                  >
                    <Palette className="w-10 h-10 text-white/60" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-black text-sm leading-tight">{cat.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="hidden sm:grid grid-cols-3 lg:grid-cols-6 gap-3">
          {["Accesorios", "Maquillaje", "Flores", "Regalos", "Cuidado personal", "Personalizados"].map((name, i) => (
            <Link key={i} href="/tienda">
              <div
                className="group relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-purple transition-all duration-300 hover:-translate-y-1"
                style={{ aspectRatio: "3/4" }}
              >
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, oklch(0.88 0.10 ${340 - (i * 35) % 150}) 0%, oklch(0.62 0.20 ${330 - (i * 40) % 140}) 100%)` }}
                >
                  <Palette className="w-10 h-10 text-white/50" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-black text-sm">{name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/* --- Featured Products ------------------------------------------------------- */
function FeaturedProducts() {
  const { data: products = [] } = trpc.products.featured.useQuery({ limit: 8 });
  const { data: allCats = [] } = trpc.categories.list.useQuery();

  return (
    <section className="py-10 px-4 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-foreground">Destacados</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Los más amados por nuestra comunidad</p>
        </div>
        <Link href="/tienda">
          <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-accent gap-1 font-bold">
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Carrusel en móvil */}
      <div className="sm:hidden -mx-4 px-4">
        <div
          className="no-scrollbar flex gap-3 overflow-x-auto pb-2"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {products.length > 0
            ? products.map((product) => {
                const category = allCats.find((c) => c.id === product.categoryId);
                return (
                  <div key={product.id} className="flex-shrink-0" style={{ width: "75vw", scrollSnapAlign: "start" }}>
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      price={product.price}
                      comparePrice={product.comparePrice}
                      imageUrl={product.imageUrl}
                      categoryName={category?.name}
                      featured={product.featured}
                    />
                  </div>
                );
              })
            : Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 rounded-2xl overflow-hidden border border-border/50"
                  style={{ width: "75vw", scrollSnapAlign: "start", background: "#f6f4fb" }}
                >
                  <div
                    className="aspect-square flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, oklch(0.93 0.06 ${340 - (i * 35) % 150}) 0%, oklch(0.80 0.13 ${330 - (i * 40) % 140}) 100%)` }}
                  >
                    <Palette className="w-12 h-12 text-white/40" />
                  </div>
                  <div className="p-3">
                    <div className="h-4 rounded-full bg-muted mb-2 w-3/4" />
                    <div className="h-4 rounded-full bg-muted w-1/2" />
                  </div>
                </div>
              ))
          }
        </div>
      </div>

      {/* Grid en sm+ */}
      {products.length > 0 ? (
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            const category = allCats.find((c) => c.id === product.categoryId);
            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                comparePrice={product.comparePrice}
                imageUrl={product.imageUrl}
                categoryName={category?.name}
                featured={product.featured}
              />
            );
          })}
        </div>
      ) : (
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-border/50"
              style={{ background: "#f6f4fb" }}
            >
              <div
                className="aspect-square flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, oklch(0.93 0.06 ${340 - (i * 35) % 150}) 0%, oklch(0.80 0.13 ${330 - (i * 40) % 140}) 100%)` }}
              >
                <Palette className="w-12 h-12 text-white/40" />
              </div>
              <div className="p-3">
                <div className="h-4 rounded-full bg-muted mb-2 w-3/4" />
                <div className="h-4 rounded-full bg-muted w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* --- Commission Banner ------------------------------------------------------- */
function CommissionBanner() {
  return (
    <section className="px-4 lg:px-8 py-6">
      <div
        className="rounded-2xl p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-6"
        style={{
          background: "linear-gradient(125deg, #7331bd 0%, #944fdd 45%, #ff39a0 78%, #40c9e9 100%)",
        }}
      >
        <div className="text-center lg:text-left">
          <Badge
            className="mb-3 rounded-full font-bold text-xs px-3"
            style={{ background: "oklch(1 0 0 / 0.2)", color: "white", border: "1px solid oklch(1 0 0 / 0.3)" }}
          >
            ✦ Por encargo
          </Badge>
          <h2
            className="text-2xl lg:text-3xl font-black text-white mb-2"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            ¿Quieres tu personaje favorito?
          </h2>
          <p className="text-white/80 text-base max-w-md">
            Armamos el arreglo o el kit de regalo que imagines. Personalización a tu gusto, envío a todo el país.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Link href="/contacto">
            <Button
              size="lg"
              className="rounded-full font-black h-12 px-7 border-0 hover:scale-105 transition-transform shadow-lg"
              style={{ background: "white", color: "#6400aa" }}
            >
              Pedir encargo
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* --- Why Us ------------------------------------------------------------------ */
function WhyUs() {
  const features = [
    {
      icon: Brush,
      title: "100% Hecho a mano",
      desc: "Cada cuadro es pintado a mano con materiales de calidad profesional.",
      color: "#e3c8ff",
    },
    {
      icon: Palette,
      title: "Selección propia",
      desc: "No usamos impresiones. Cada pieza es única e irrepetible.",
      color: "#c8a1ff",
    },
    {
      icon: Clock,
      title: "Encargos rápidos",
      desc: "Tu pedido personalizado listo en 7 a 14 días hábiles.",
      color: "#ae78f3",
    },
    {
      icon: Heart,
      title: "Hecho con cariño",
      desc: "Cuidamos cada detalle, del empaque a la entrega.",
      color: "#954be3",
    },
    {
      icon: Star,
      title: "Alta calidad",
      desc: "Pinturas acrílicas y óleos de alta durabilidad y colores vivos.",
      color: "#7a16ca",
    },
    {
      icon: Shield,
      title: "Garantía total",
      desc: "Si no quedas satisfecho, lo rehacemos sin costo adicional.",
      color: "#7a16ca",
    },
  ];

  return (
    <section className="py-10 px-4 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-foreground mb-2">¿Por qué elegirnos?</h2>
        <p className="text-muted-foreground text-sm">Detalles con alma, calidad garantizada</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {features.map((f, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center p-4 rounded-2xl hover:shadow-purple transition-all duration-300 hover:-translate-y-1 cursor-default"
            style={{
              background: "#f9f7fe",
              border: "1px solid #e9dffb",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: f.color + "30" }}
            >
              <f.icon className="w-5 h-5" style={{ color: f.color }} />
            </div>
            <h3 className="font-black text-foreground text-xs mb-1 leading-tight">{f.title}</h3>
            <p className="text-xs text-muted-foreground leading-snug">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --- About Snippet ----------------------------------------------------------- */
function AboutSnippet() {
  const { data: aboutShort } = trpc.content.get.useQuery({ key: "about_short" });
  const { data: aboutImage } = trpc.content.get.useQuery({ key: "about_image" });

  const text =
    aboutShort?.value ??
    "Somos una tienda de accesorios, maquillaje y arreglos florales. Elegimos cada producto pensando en que te haga sonreír, ya sea para ti o para regalar. Manejamos stock disponible y también armamos pedidos personalizados.";

  return (
    <section className="py-10 px-4 lg:px-8">
      <div
        className="rounded-2xl overflow-hidden grid lg:grid-cols-2"
        style={{ border: "1px solid #e6dcf8" }}
      >
        {/* Image side */}
        <div
          className="relative min-h-[260px] lg:min-h-[320px]"
          style={{
            background: "linear-gradient(135deg, #ffd9ec 0%, #944fdd 100%)",
          }}
        >
          {aboutImage?.value ? (
            <img
              src={aboutImage.value}
              alt="Sobre nosotros"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
                  style={{ background: "oklch(1 0 0 / 0.2)" }}
                >
                  <Palette className="w-10 h-10 text-white" />
                </div>
                <p className="text-white font-black text-xl">Guaiqui Avenue</p>
                <p className="text-white/70 text-sm">Accesorios · Belleza · Flores</p>
              </div>
            </div>
          )}
          {/* Overlay badge */}
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-black"
            style={{
              background: "oklch(1 0 0 / 0.2)",
              color: "white",
              border: "1px solid oklch(1 0 0 / 0.3)",
              backdropFilter: "blur(8px)",
            }}
          >
            ✦ Nuestra historia
          </div>
        </div>

        {/* Text side */}
        <div className="p-8 lg:p-10 flex flex-col justify-center" style={{ background: "#fcfbfe" }}>
          <h2 className="text-2xl lg:text-3xl font-black text-foreground mb-4 leading-tight">
            Detalles que conectan con{" "}
            <span className="text-gradient-purple">tu pasión</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6 text-sm lg:text-base">{text}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/sobre-nosotros">
              <Button
                variant="outline"
                className="rounded-full font-bold border-primary/30 text-primary hover:bg-accent gap-1.5 text-sm"
              >
                Conoce más <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link href="/contacto">
              <Button
                className="rounded-full font-bold gap-1.5 text-sm border-0"
                style={{ background: "#7a16ca", color: "white" }}
              >
                Contáctanos <Heart className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- Page -------------------------------------------------------------------- */
export default function Home() {
  return (
    <StoreLayout>
      <HeroSection />
      <QuickInfoBar />
      <FeaturedCategories />
      <FeaturedProducts />
      <CommissionBanner />
      <WhyUs />
      <AboutSnippet />
    </StoreLayout>
  );
}
