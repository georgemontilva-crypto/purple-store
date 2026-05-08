import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Trash2, Tags, Upload, X, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

interface CategoryFormProps {
  category?: any;
  onClose: () => void;
}

function CategoryForm({ category, onClose }: CategoryFormProps) {
  const isEdit = !!category;
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
  const fileRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (data) => { setForm((f) => ({ ...f, imageUrl: data.url, imageKey: data.key })); toast.success("Imagen subida"); },
    onError: (err) => toast.error("Error al subir imagen", { description: err.message }),
    onSettled: () => setUploading(false),
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
    if (!form.name) { toast.error("El nombre es requerido"); return; }
    const slug = form.slug || slugify(form.name);
    const data = { name: form.name, slug, description: form.description || undefined, imageUrl: form.imageUrl || undefined, imageKey: form.imageKey || undefined, featured: form.featured, sortOrder: Number(form.sortOrder) };
    if (isEdit) updateMutation.mutate({ id: category.id, ...data });
    else createMutation.mutate(data);
  };

  return (
    <div className="max-w-lg">
      <h3 className="font-semibold text-lg text-foreground mb-5">{isEdit ? "Editar categoría" : "Nueva categoría"}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted border border-border flex-shrink-0">
            {form.imageUrl ? <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full gradient-purple-soft flex items-center justify-center"><Upload className="w-5 h-5 text-primary/40" /></div>}
          </div>
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Button type="button" variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? "Subiendo..." : "Subir imagen"}
            </Button>
            {form.imageUrl && <Button type="button" variant="ghost" size="sm" className="rounded-xl gap-2 text-destructive" onClick={() => setForm((f) => ({ ...f, imageUrl: "", imageKey: "" }))}><X className="w-3.5 h-3.5" />Eliminar</Button>}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre <span className="text-rose-500">*</span></label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} placeholder="Nombre de la categoría" className="rounded-xl" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Slug</label>
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="nombre-categoria" className="rounded-xl font-mono text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Descripción</label>
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción breve" className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Orden de visualización</label>
          <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="rounded-xl" />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded accent-primary" />
          <span className="text-sm text-foreground">Mostrar en el home como categoría destacada</span>
        </label>
        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1 rounded-xl gradient-purple text-white border-0 shadow-purple" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear categoría"}
          </Button>
          <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}

export default function AdminCategories() {
  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const utils = trpc.useUtils();
  const { data: categories = [], isLoading } = trpc.categories.list.useQuery();

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => { toast.success("Categoría eliminada"); utils.categories.list.invalidate(); },
    onError: (err) => toast.error("Error al eliminar", { description: err.message }),
  });

  const handleDelete = (id: number, name: string) => {
    if (confirm(`¿Eliminar "${name}"?`)) deleteMutation.mutate({ id });
  };

  if (showForm) {
    return (
      <AdminLayout title={editingCat ? "Editar categoría" : "Nueva categoría"}>
        <CategoryForm category={editingCat} onClose={() => { setShowForm(false); setEditingCat(null); }} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Categorías">
      <div className="space-y-5">
        <div className="flex justify-end">
          <Button onClick={() => { setEditingCat(null); setShowForm(true); }} className="rounded-xl gradient-purple text-white border-0 shadow-purple gap-2">
            <Plus className="w-4 h-4" />Nueva categoría
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center">
            <Tags className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground">No hay categorías aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:border-primary/30 hover:shadow-purple transition-all">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full gradient-purple-soft flex items-center justify-center"><Tags className="w-8 h-8 text-primary/30" /></div>}
                  {cat.featured && <span className="absolute top-2 left-2 px-2 py-0.5 gradient-purple text-white text-xs font-semibold rounded-full">Destacada</span>}
                </div>
                <div className="p-3">
                  <p className="font-medium text-foreground text-sm truncate">{cat.name}</p>
                  {cat.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{cat.description}</p>}
                  <div className="flex gap-1 mt-3">
                    <button onClick={() => { setEditingCat(cat); setShowForm(true); }} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent hover:text-primary transition-colors">
                      <Pencil className="w-3.5 h-3.5" />Editar
                    </button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
