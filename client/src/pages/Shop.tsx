import StoreLayout from "@/components/StoreLayout";
import ProductCard from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { Search, SlidersHorizontal, X } from "lucide-react";
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
      {/* Header */}
      <div className="gradient-purple-soft py-16 mt-0">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1
            className="text-4xl lg:text-5xl font-bold text-foreground mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Nuestra tienda
          </h1>
          <p className="text-muted-foreground text-lg">
            Descubre {total > 0 ? total : "todos los"} productos increíbles
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 rounded-xl border-border/60 focus:border-primary"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  Categorías
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedCatSlug("");
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                      !selectedCatSlug
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    Todos los productos
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCatSlug(cat.slug);
                        setPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                        selectedCatSlug === cat.slug
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {/* Active filters */}
            {(selectedCatSlug || search) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCatSlug && selectedCat && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                    {selectedCat.name}
                    <button onClick={() => setSelectedCatSlug("")}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                    "{search}"
                    <button onClick={() => setSearch("")}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-muted animate-pulse aspect-[3/4]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full gradient-purple-soft flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  No encontramos productos
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Intenta con otros filtros o términos de búsqueda
                </p>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setSearch("");
                    setSelectedCatSlug("");
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  Mostrando {products.length} de {total} productos
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
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
                  <div className="flex justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Anterior
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        size="sm"
                        variant={p === page ? "default" : "outline"}
                        className={`rounded-full w-9 h-9 p-0 ${p === page ? "gradient-purple text-white border-0 shadow-purple" : ""}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
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
