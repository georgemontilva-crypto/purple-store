import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, X, ArrowLeft, Loader2 } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductFormProps {
  product?: any;
  categories: Category[];
  onClose: () => void;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductForm({ product, categories, onClose }: ProductFormProps) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    comparePrice: product?.comparePrice ?? "",
    stock: product?.stock ?? 0,
    categoryId: product?.categoryId ?? "",
    imageUrl: product?.imageUrl ?? "",
    imageKey: product?.imageKey ?? "",
    featured: product?.featured ?? false,
    active: product?.active ?? true,
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (data) => {
      setForm((f) => ({ ...f, imageUrl: data.url, imageKey: data.key }));
      toast.success("Imagen subida correctamente");
    },
    onError: (err) => toast.error("Error al subir imagen", { description: err.message }),
    onSettled: () => setUploading(false),
  });

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Producto creado");
      onClose();
    },
    onError: (err) => toast.error("Error al crear producto", { description: err.message }),
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Producto actualizado");
      onClose();
    },
    onError: (err) => toast.error("Error al actualizar producto", { description: err.message }),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        filename: file.name,
        contentType: file.type,
        data: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("Nombre y precio son requeridos");
      return;
    }
    const slug = form.slug || slugify(form.name);
    const data = {
      name: form.name,
      slug,
      description: form.description || undefined,
      price: form.price,
      comparePrice: form.comparePrice || undefined,
      stock: Number(form.stock),
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      imageUrl: form.imageUrl || undefined,
      imageKey: form.imageKey || undefined,
      featured: form.featured,
      active: form.active,
    };
    if (isEdit) {
      updateMutation.mutate({ id: product.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-2xl">
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a productos
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <h3 className="font-semibold text-foreground mb-4">Imagen del producto</h3>
          <div className="flex items-start gap-4">
            <div className="w-28 h-28 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full gradient-purple-soft flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary/40" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl gap-2"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Subiendo..." : "Subir imagen"}
              </Button>
              {form.imageUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-xl gap-2 text-destructive hover:text-destructive"
                  onClick={() => setForm((f) => ({ ...f, imageUrl: "", imageKey: "" }))}
                >
                  <X className="w-4 h-4" />
                  Eliminar
                </Button>
              )}
              <p className="text-xs text-muted-foreground">JPG, PNG o WebP. Máx 5MB.</p>
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Información básica</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre <span className="text-rose-500">*</span></label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
              placeholder="Nombre del producto"
              className="rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug (URL)</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="nombre-del-producto"
              className="rounded-xl font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción del producto..."
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-border/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground placeholder:text-muted-foreground text-sm resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoría</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-border/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground text-sm"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Precio e inventario</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Precio <span className="text-rose-500">*</span></label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Precio anterior</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.comparePrice}
                onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                placeholder="0.00"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stock</label>
              <Input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-3">
          <h3 className="font-semibold text-foreground">Opciones</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4 rounded accent-primary"
            />
            <span className="text-sm text-foreground">Producto destacado (aparece en el home)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4 rounded accent-primary"
            />
            <span className="text-sm text-foreground">Producto activo (visible en la tienda)</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1 rounded-xl gradient-purple text-white border-0 shadow-purple h-11"
            disabled={isPending}
          >
            {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl h-11"
            onClick={onClose}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
