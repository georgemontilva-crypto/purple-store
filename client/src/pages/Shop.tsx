import StoreLayout from "@/components/StoreLayout";
import ProductCard from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { Search, SlidersHorizontal, X, Palette, Grid3X3, List } from "lucide-react";
import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Shop() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialCat = params.get("categoria") ?? "";

  const [search, setSearch] = useState("");
  const [selectedCatSlug, setSelectedCatSlug] = useState(initialCat);
  const [page, setPage] = useState(1);
  const [viewGrid, setViewGrid] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: categories = [] } = trpc.categories.list.useQuery();

  const selectedCat = useMemo(
    () => categories.find((c) => c.slug === selectedCatSlug),
    [categories, selectedCatSlug]
  );

  const { data, isLoading } = trpc.products.list.useQuery({
    categoryId: selectedCat?.id,
    search: search || undefined,
    page,
    limit: 12,
  });

  const products = data?.products ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 12);

  return (
    <StoreLayout>
      {/* Header banner */}
      <div className="px-4 lg:px-8 pt-4 pb-2">
        <div
          className="rounded-2xl px-5 py-7 md:px-8 md:py-10 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, oklch(0.35 0.22 295) 0%, oklch(0.52 0.24 295) 55%, oklch(0.72 0.18 295) 100%)",
          }}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20"
            style={{ background: "oklch(0.88 0.10 295)" }} />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full blur-2xl opacity-15"
            style={{ background: "oklch(0.95 0.06 295)" }} />
          <div className="absolute top-4 right-20 w-12 h-12 rounded-full border-2 border-white/20" />
          <div className="absolute top-10 right-36 w-6 h-6 rounded-full border border-white/15" />

          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-black"
              style={{ background: "oklch(1 0 0 / 0.15)", color: "white", border: "1px solid oklch(1 0 0 / 0.25)" }}
            >
              <Palette className="w-3.5 h-3.5" />
              Arte Anime · Hecho a mano
            </div>
            <h1
              className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Nuestra Colección
            </h1>
            <p className="text-white/75 text-sm">
              {total > 0 ? `${total} cuadros disponibles` : "Explora todos nuestros cuadros originales"}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-6">
        {/* Mobile filter toggle */}
        <div className="lg:hidden flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cuadros..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 rounded-2xl font-semibold text-sm"
              style={{ fontFamily: "'Nunito', sans-serif", border: "1.5px solid oklch(0.91 0.04 295)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm flex-shrink-0"
            style={{
              fontFamily: "'Nunito', sans-serif",
              background: filtersOpen ? "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)" : "oklch(0.95 0.02 295)",
              color: filtersOpen ? "white" : "oklch(0.42 0.24 295)",
            }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Mobile categories filter */}
        {filtersOpen && (
          <div
            className="lg:hidden rounded-2xl p-4 mb-4"
            style={{ background: "oklch(0.98 0.008 295)", border: "1.5px solid oklch(0.91 0.04 295)" }}
          >
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setSelectedCatSlug(""); setPage(1); setFiltersOpen(false); }}
                className="px-4 py-2 rounded-full text-sm font-bold transition-all"
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  background: !selectedCatSlug ? "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)" : "oklch(0.92 0.06 295)",
                  color: !selectedCatSlug ? "white" : "oklch(0.42 0.24 295)",
                }}
              >Todos</button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCatSlug(cat.slug); setPage(1); setFiltersOpen(false); }}
                  className="px-4 py-2 rounded-full text-sm font-bold transition-all"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    background: selectedCatSlug === cat.slug ? "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)" : "oklch(0.92 0.06 295)",
                    color: selectedCatSlug === cat.slug ? "white" : "oklch(0.42 0.24 295)",
                  }}
                >{cat.name}</button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar (desktop only) */}
          <aside className="hidden lg:block lg:w-60 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cuadros..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9 rounded-2xl font-semibold text-sm"
                  style={{ fontFamily: "'Nunito', sans-serif", border: "1.5px solid oklch(0.91 0.04 295)" }}
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Categories */}
              <div
                className="rounded-2xl p-4"
                style={{ background: "oklch(0.98 0.008 295)", border: "1.5px solid oklch(0.91 0.04 295)" }}
              >
                <h3
                  className="font-black text-foreground mb-3 flex items-center gap-2 text-sm"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  Categorías
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => { setSelectedCatSlug(""); setPage(1); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      background: !selectedCatSlug ? "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)" : "transparent",
                      color: !selectedCatSlug ? "white" : "oklch(0.55 0.06 295)",
                    }}
                  >
                    Todos los cuadros
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCatSlug(cat.slug); setPage(1); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-all"
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        background: selectedCatSlug === cat.slug
                          ? "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)"
                          : "transparent",
                        color: selectedCatSlug === cat.slug ? "white" : "oklch(0.55 0.06 295)",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCatSlug !== cat.slug)
                          (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.92 0.06 295)";
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCatSlug !== cat.slug)
                          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex flex-wrap gap-2">
                {selectedCatSlug && selectedCat && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
                    style={{
                      background: "oklch(0.92 0.06 295)",
                      color: "oklch(0.35 0.22 295)",
                      fontFamily: "'Nunito', sans-serif",
                    }}
                  >
                    {selectedCat.name}
                    <button onClick={() => setSelectedCatSlug("")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {search && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
                    style={{
                      background: "oklch(0.92 0.06 295)",
                      color: "oklch(0.35 0.22 295)",
                      fontFamily: "'Nunito', sans-serif",
                    }}
                  >
                    "{search}"
                    <button onClick={() => setSearch("")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {!selectedCatSlug && !search && (
                  <p className="text-sm text-muted-foreground font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {total > 0 ? `${total} cuadros` : "Todos los cuadros"}
                  </p>
                )}
              </div>
              {/* View toggle */}
              <div
                className="flex items-center gap-1 p-1 rounded-xl"
                style={{ background: "oklch(0.95 0.02 295)" }}
              >
                <button
                  onClick={() => setViewGrid(true)}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ background: viewGrid ? "white" : "transparent", boxShadow: viewGrid ? "0 1px 4px oklch(0 0 0 / 0.1)" : "none" }}
                >
                  <Grid3X3 className="w-4 h-4 text-foreground" />
                </button>
                <button
                  onClick={() => setViewGrid(false)}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ background: !viewGrid ? "white" : "transparent", boxShadow: !viewGrid ? "0 1px 4px oklch(0 0 0 / 0.1)" : "none" }}
                >
                  <List className="w-4 h-4 text-foreground" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className={`grid gap-4 ${viewGrid ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl animate-pulse"
                    style={{ aspectRatio: viewGrid ? "1/1.2" : "4/1", background: "oklch(0.95 0.02 295)" }}
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "linear-gradient(135deg, oklch(0.92 0.06 295) 0%, oklch(0.78 0.14 295) 100%)" }}
                >
                  <Palette className="w-9 h-9 text-white/70" />
                </div>
                <h3
                  className="font-black text-foreground text-lg mb-2"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  No encontramos cuadros
                </h3>
                <p className="text-muted-foreground text-sm mb-6 font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Intenta con otros filtros o términos de búsqueda
                </p>
                <Button
                  className="rounded-full font-black border-0"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)",
                    color: "white",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                  onClick={() => { setSearch(""); setSelectedCatSlug(""); }}
                >
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 ${viewGrid ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>
                  {products.map((product) => {
                    const category = categories.find((c) => c.id === product.categoryId);
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full font-black"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Anterior
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        size="sm"
                        className="rounded-full w-9 h-9 p-0 font-black"
                        style={{
                          fontFamily: "'Nunito', sans-serif",
                          background: p === page
                            ? "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)"
                            : "transparent",
                          color: p === page ? "white" : "oklch(0.42 0.24 295)",
                          border: p === page ? "none" : "1.5px solid oklch(0.91 0.04 295)",
                        }}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full font-black"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
