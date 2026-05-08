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

  return (
    <AdminLayout>
      <div className="space-y-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Categorías</h2>
            <p className="text-sm text-muted-foreground">{categories.length} categoría{categories.length !== 1 ? "s" : ""}</p>
          </div>
          <Button onClick={() => { setEditingCat(null); setShowForm(true); }} className="rounded-xl gradient-purple text-white border-0 shadow-purple hover:opacity-90 gap-2 font-semibold">
            <Plus className="w-4 h-4" /> Nueva categoría
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="rounded-2xl bg-muted animate-pulse aspect-[4/3]" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-2xl border py-16 text-center" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
            <Tags className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold text-foreground">No hay categorías</p>
            <p className="text-sm text-muted-foreground mt-1">Crea tu primera categoría para organizar los productos</p>
            <Button onClick={() => { setEditingCat(null); setShowForm(true); }} className="mt-4 rounded-xl gradient-purple text-white border-0 shadow-purple gap-2">
              <Plus className="w-4 h-4" /> Crear categoría
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat: any) => (
              <div key={cat.id} className="bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-all group" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
                <div className="aspect-video relative overflow-hidden bg-muted">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.88 0.10 295), oklch(0.72 0.18 295))" }}>
                      <Tags className="w-8 h-8 text-white/50" />
                    </div>
                  )}
                  {cat.featured && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "oklch(0.42 0.20 295)", color: "white" }}>
                      <Star className="w-3 h-3 fill-white" /> Destacada
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => { setEditingCat(cat); setShowForm(true); }} className="p-2 rounded-xl bg-white/90 hover:bg-white transition-colors">
                      <Edit2 className="w-4 h-4 text-primary" />
                    </button>
                    <button onClick={() => { if (confirm(`¿Eliminar "${cat.name}"?`)) deleteMutation.mutate({ id: cat.id }); }} className="p-2 rounded-xl bg-white/90 hover:bg-white transition-colors">
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm text-foreground truncate">{cat.name}</p>
                  {cat.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cat.description}</p>}
                  <p className="text-xs text-muted-foreground/50 mt-1 font-mono">{cat.slug}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
