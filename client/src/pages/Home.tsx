import StoreLayout from "@/components/StoreLayout";
import ProductCard from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Sparkles, Shield, Truck, RefreshCw, Star } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

function HeroSection() {
  const { data: heroTitle } = trpc.content.get.useQuery({ key: "hero_title" });
  const { data: heroSubtitle } = trpc.content.get.useQuery({ key: "hero_subtitle" });
  const { data: heroImage } = trpc.content.get.useQuery({ key: "hero_image" });
  const { data: heroCta } = trpc.content.get.useQuery({ key: "hero_cta" });

  const title = heroTitle?.value ?? "Descubre tu estilo único";
  const subtitle =
    heroSubtitle?.value ??
    "Colecciones exclusivas diseñadas para la mujer moderna. Moda, elegancia y sofisticación en cada pieza.";
  const ctaText = heroCta?.value ?? "Explorar colección";
  const bgImage = heroImage?.value;

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      {bgImage ? (
        <div className="absolute inset-0">
          <img src={bgImage} alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0">
          <div className="absolute inset-0 gradient-purple opacity-10" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 70% 50%, oklch(0.87 0.08 295 / 0.3) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, oklch(0.78 0.13 295 / 0.2) 0%, transparent 50%)",
            }}
          />
          {/* Decorative circles */}
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full gradient-purple opacity-10 blur-3xl" />
          <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-purple-300 opacity-15 blur-2xl" />
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Nueva colección disponible</span>
          </div>

          <h1
            className="text-5xl lg:text-7xl font-bold leading-tight mb-6"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: bgImage ? "white" : "oklch(0.15 0.01 285)",
            }}
          >
            {title}
          </h1>

          <p
            className="text-lg lg:text-xl leading-relaxed mb-8 max-w-lg"
            style={{ color: bgImage ? "rgba(255,255,255,0.85)" : "oklch(0.55 0.04 285)" }}
          >
            {subtitle}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/tienda">
              <Button
                size="lg"
                className="rounded-full gradient-purple text-white border-0 shadow-purple-lg h-14 px-8 text-base font-semibold hover:opacity-90 transition-opacity"
              >
                {ctaText}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/sobre-nosotros">
              <Button
                size="lg"
                variant="outline"
                className={`rounded-full h-14 px-8 text-base font-semibold ${bgImage ? "border-white/50 text-white hover:bg-white/10" : "border-border hover:bg-accent"}`}
              >
                Nuestra historia
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-primary/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
      </div>
    </section>
  );
}

function FeaturedCategories() {
  const { data: categories = [] } = trpc.categories.featured.useQuery();

  if (!categories.length) return null;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-4xl font-bold text-foreground mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Nuestras categorías
          </h2>
          <p className="text-muted-foreground text-lg">
            Encuentra exactamente lo que buscas
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/tienda?categoria=${cat.slug}`}>
              <div className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer hover:shadow-purple transition-all duration-300">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full gradient-purple-soft" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-white/70 text-sm mt-0.5 line-clamp-1">{cat.description}</p>
                  )}
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full gradient-purple flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-purple">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const { data: products = [] } = trpc.products.featured.useQuery({ limit: 8 });
  const { data: allCats = [] } = trpc.categories.list.useQuery();

  if (!products.length) return null;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2
              className="text-4xl font-bold text-foreground mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Productos destacados
            </h2>
            <p className="text-muted-foreground text-lg">
              Selección especial para ti
            </p>
          </div>
          <Link href="/tienda">
            <Button variant="ghost" className="rounded-full text-primary hover:bg-accent gap-1.5">
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
      </div>
    </section>
  );
}

function StoreFeatures() {
  const features = [
    {
      icon: Truck,
      title: "Envío gratuito",
      desc: "En pedidos superiores a $50",
    },
    {
      icon: Shield,
      title: "Compra segura",
      desc: "Pagos 100% protegidos",
    },
    {
      icon: RefreshCw,
      title: "Devoluciones fáciles",
      desc: "30 días para devolver",
    },
    {
      icon: Star,
      title: "Calidad premium",
      desc: "Productos seleccionados",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-purple transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl gradient-purple-soft flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoreInfo() {
  const { data: aboutShort } = trpc.content.get.useQuery({ key: "about_short" });
  const { data: aboutImage } = trpc.content.get.useQuery({ key: "about_image" });

  const text =
    aboutShort?.value ??
    "Somos una tienda apasionada por la moda femenina. Cada pieza de nuestra colección es cuidadosamente seleccionada para ofrecerte lo mejor en estilo, calidad y elegancia. Creemos que cada mujer merece sentirse especial.";

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Nuestra historia</span>
            </div>
            <h2
              className="text-4xl font-bold text-foreground mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Moda que te hace sentir{" "}
              <span className="text-gradient-purple">extraordinaria</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">{text}</p>
            <Link href="/sobre-nosotros">
              <Button
                variant="outline"
                className="rounded-full border-primary/30 text-primary hover:bg-accent gap-2"
              >
                Conoce más sobre nosotros
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="relative">
            {aboutImage?.value ? (
              <img
                src={aboutImage.value}
                alt="Sobre nosotros"
                className="w-full aspect-square object-cover rounded-3xl shadow-purple-lg"
              />
            ) : (
              <div className="w-full aspect-square rounded-3xl gradient-purple-soft flex items-center justify-center shadow-purple-lg">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full gradient-purple mx-auto flex items-center justify-center shadow-purple mb-4">
                    <span
                      className="text-white text-4xl font-bold"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      P
                    </span>
                  </div>
                  <p className="text-primary font-semibold text-lg">Purple Store</p>
                </div>
              </div>
            )}
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-purple border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">4.9 / 5.0</p>
                  <p className="text-muted-foreground text-xs">+500 reseñas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <StoreLayout>
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <StoreFeatures />
      <StoreInfo />
    </StoreLayout>
  );
}
