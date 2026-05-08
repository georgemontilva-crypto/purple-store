import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Star, Package, ImageOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ProductForm from "./ProductForm";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.products.adminList.useQuery({
    search: search || undefined,
    page,
    limit: 15,
  });

  const { data: catData } = trpc.categories.list.useQuery();
  const categories = (catData as any)?.categories ?? catData ?? [];

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => { toast.success("Producto eliminado"); utils.products.adminList.invalidate(); },
    onError: (err) => toast.error("Error al eliminar", { description: err.message }),
  });

  const toggleActiveMutation = trpc.products.update.useMutation({
    onSuccess: () => utils.products.adminList.invalidate(),
  });

  const products = data?.products ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 15);

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    utils.products.adminList.invalidate();
  };

  if (showForm) {
    return (
      <AdminLayout title={editingProduct ? "Editar producto" : "Nuevo producto"}>
        <ProductForm product={editingProduct} categories={categories} onClose={handleFormClose} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 max-w-6xl">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Productos</h2>
            <p className="text-sm text-muted-foreground">{total} producto{total !== 1 ? "s" : ""} en total</p>
          </div>
          <Button
            onClick={() => { setEditingProduct(null); setShowForm(true); }}
            className="rounded-xl gradient-purple text-white border-0 shadow-purple hover:opacity-90 gap-2 font-semibold"
          >
            <Plus className="w-4 h-4" />
            Nuevo producto
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border p-4" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 rounded-xl border-border/60 bg-muted/30 focus:bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold text-foreground">No hay productos</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? "Prueba con otro término de búsqueda" : "Crea tu primer producto para comenzar"}
              </p>
              {!search && (
                <Button
                  onClick={() => { setEditingProduct(null); setShowForm(true); }}
                  className="mt-4 rounded-xl gradient-purple text-white border-0 shadow-purple gap-2"
                >
                  <Plus className="w-4 h-4" /> Crear producto
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "oklch(0.93 0.02 295)", background: "oklch(0.98 0.01 295)" }}>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Producto</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Categoría</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Precio</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Stock</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Estado</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "oklch(0.95 0.01 295)" }}>
                  {products.map((product) => {
                    const category = categories.find((c: any) => c.id === product.categoryId);
                    return (
                      <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageOff className="w-4 h-4 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-foreground truncate max-w-[160px]">{product.name}</p>
                                {product.featured && (
                                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate max-w-[160px]">{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {category ? (
                            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/8 text-primary font-medium">
                              {(category as any).name}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-bold text-foreground">${parseFloat(product.price).toFixed(2)}</p>
                            {product.comparePrice && (
                              <p className="text-xs text-muted-foreground line-through">${parseFloat(product.comparePrice).toFixed(2)}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            product.stock === 0
                              ? "bg-rose-50 text-rose-600"
                              : product.stock <= 3
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}>
                            {product.stock === 0 ? "Sin stock" : `${product.stock} uds`}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <button
                            onClick={() => toggleActiveMutation.mutate({ id: product.id, active: !product.active })}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                              product.active
                                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${product.active ? "bg-emerald-500" : "bg-gray-400"}`} />
                            {product.active ? "Activo" : "Inactivo"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => toggleActiveMutation.mutate({ id: product.id, active: !product.active })}
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors sm:hidden"
                            >
                              {product.active ? (
                                <Eye className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                            <button
                              onClick={() => { setEditingProduct(product); setShowForm(true); }}
                              className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-primary" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar "${product.name}"?`)) {
                                  deleteMutation.mutate({ id: product.id });
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
              <p className="text-xs text-muted-foreground">
                Página {page} de {totalPages} · {total} productos
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl text-xs">
                  Anterior
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl text-xs">
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
