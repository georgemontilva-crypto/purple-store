import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Edit2, Trash2, Tags, ImageOff, Star, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function CategoryForm({ category, onClose }: { category?: any; onClose: () => void }) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    imageUrl: category?.imageUrl ?? "",
    imageKey: category?.imageKey ?? "",
    featured: category?.featured ?? false,
    sortOrder: category?.sortOrder ?? 0,
  });
  const [uploading, setUploading] = useState(false);

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (data) => { setForm((f) => ({ ...f, imageUrl: data.url, imageKey: data.key })); setUploading(false); },
    onError: (err) => { toast.error("Error al subir imagen", { description: err.message }); setUploading(false); },
  });

  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => { toast.success("Categoría creada"); utils.categories.list.invalidate(); onClose(); },
    onError: (err) => toast.error("Error", { description: err.message }),
  });

  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => { toast.success("Categoría actualizada"); utils.categories.list.invalidate(); onClose(); },
    onError: (err) => toast.error("Error", { description: err.message }),
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({ filename: file.name, contentType: file.type, data: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, slug: form.slug || slugify(form.name), sortOrder: Number(form.sortOrder) };
    if (category) updateMutation.mutate({ id: category.id, ...payload });
    else createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
        <h3 className="font-semibold text-sm text-foreground mb-3">Imagen de categoría</h3>
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0 border" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageOff className="w-6 h-6 text-muted-foreground/40" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="cursor-pointer">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${uploading ? "opacity-50" : "hover:bg-muted"}`} style={{ borderColor: "oklch(0.93 0.02 295)" }}>
                <Upload className="w-4 h-4" />
                {uploading ? "Subiendo..." : "Subir imagen"}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
            {form.imageUrl && (
              <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: "", imageKey: "" }))} className="mt-2 flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700">
                <X className="w-3 h-3" /> Eliminar imagen
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
        <h3 className="font-semibold text-sm text-foreground">Información</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nombre *</label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} placeholder="Ej: Shonen" required className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Slug *</label>
            <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="shonen" required className="rounded-xl font-mono text-sm" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descripción</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción breve..." rows={2} className="w-full px-3 py-2 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background" style={{ borderColor: "oklch(0.88 0.04 295)" }} />
        </div>
        <div className="flex items-center gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Orden</label>
            <Input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} className="rounded-xl w-24" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer mt-5">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm font-medium text-foreground">Categoría destacada</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} className="rounded-xl gap-2"><X className="w-4 h-4" /> Cancelar</Button>
        <Button type="submit" disabled={isPending} className="rounded-xl gradient-purple text-white border-0 shadow-purple">
          {isPending ? "Guardando..." : category ? "Guardar cambios" : "Crear categoría"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminCategories() {
  const utils = trpc.useUtils();
  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);

  const { data: catData, isLoading } = trpc.categories.list.useQuery();
  const categories: any[] = (catData as any)?.categories ?? (Array.isArray(catData) ? catData : []);

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => { toast.success("Categoría eliminada"); utils.categories.list.invalidate(); },
    onError: (err) => toast.error("Error al eliminar", { description: err.message }),
  });

  if (showForm) {
    return (
      <AdminLayout title={editingCat ? "Editar categoría" : "Nueva categoría"}>
        <CategoryForm category={editingCat} onClose={() => { setShowForm(false); setEditingCat(null); }} />
      </AdminLayout>
    );
  }

  const addBtn = (
    <button
      onClick={() => { setEditingCat(null); setShowForm(true); }}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
    >
      <Plus className="w-4 h-4" /> Add Category
    </button>
  );

  return (
    <AdminLayout title="Categories" subtitle={`${categories.length} categories`} action={addBtn}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Cargando...</div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center">
            <Tags className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No hay categorías</p>
            <button onClick={() => { setEditingCat(null); setShowForm(true); }} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors mx-auto">
              <Plus className="w-4 h-4" /> Crear categoría
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">IMAGE</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">NAME</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">SLUG</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">DESCRIPTION</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tags className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-semibold text-gray-900">{cat.name}</span>
                    {cat.featured && <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700"><Star className="w-2.5 h-2.5" /> Featured</span>}
                  </td>
                  <td className="px-6 py-3.5 text-gray-400 font-mono text-xs hidden md:table-cell">{cat.slug}</td>
                  <td className="px-6 py-3.5 text-gray-500 hidden lg:table-cell">{cat.description ? <span className="line-clamp-1">{cat.description}</span> : <span className="text-gray-300">—</span>}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditingCat(cat); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm(`¿Eliminar "${cat.name}"?`)) deleteMutation.mutate({ id: cat.id }); }} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
