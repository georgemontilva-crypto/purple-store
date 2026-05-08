import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Trash2, Search, Package, Eye, EyeOff, Star } from "lucide-react";
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

  const { data: categories = [] } = trpc.categories.list.useQuery();

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Producto eliminado");
      utils.products.adminList.invalidate();
    },
    onError: (err) => toast.error("Error al eliminar", { description: err.message }),
  });

  const toggleActiveMutation = trpc.products.update.useMutation({
    onSuccess: () => utils.products.adminList.invalidate(),
  });

  const products = data?.products ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 15);

  const handleDelete = (id: number, name: string) => {
    if (confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    utils.products.adminList.invalidate();
  };

  if (showForm) {
    return (
      <AdminLayout title={editingProduct ? "Editar producto" : "Nuevo producto"}>
        <ProductForm
          product={editingProduct}
          categories={categories}
          onClose={handleFormClose}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Productos">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 rounded-xl"
            />
          </div>
          <Button
            onClick={() => { setEditingProduct(null); setShowForm(true); }}
            className="rounded-xl gradient-purple text-white border-0 shadow-purple gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo producto
          </Button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Categoría</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Precio</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Estado</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-10 bg-muted rounded-lg animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">No hay productos</p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const category = categories.find((c) => c.id === product.categoryId);
                    return (
                      <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full gradient-purple-soft flex items-center justify-center">
                                  <Package className="w-4 h-4 text-primary/40" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate max-w-[180px]">{product.name}</p>
                              {product.featured && (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  Destacado
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">{category?.name ?? "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-sm font-semibold text-foreground">${parseFloat(product.price).toFixed(2)}</span>
                            {product.comparePrice && (
                              <span className="text-xs text-muted-foreground line-through ml-1">${parseFloat(product.comparePrice).toFixed(2)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`text-sm font-medium ${product.stock > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <button
                            onClick={() => toggleActiveMutation.mutate({ id: product.id, active: !product.active })}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                              product.active
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {product.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {product.active ? "Activo" : "Inactivo"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-primary"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-border">
              <Button variant="outline" size="sm" className="rounded-full" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Anterior
              </Button>
              <span className="flex items-center text-sm text-muted-foreground px-2">
                {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" className="rounded-full" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                Siguiente
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
