import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Upload, Loader2, Save, ImageIcon, FileText, Phone, Sparkles,
  Video, Trash2, Plus, GripVertical, CheckCircle2, XCircle, Image as ImageLucide, LayoutTemplate,
  Bell, Users, Clock, Mail,
} from "lucide-react";

// ─── ContentField ─────────────────────────────────────────────────────────────
function ContentField({ fieldKey, label, type, placeholder }: { fieldKey: string; label: string; type: string; placeholder?: string }) {
  const { data } = trpc.content.get.useQuery({ key: fieldKey });
  const [value, setValue] = useState<string>("");
  const [initialized, setInitialized] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  if (!initialized && data !== undefined) { setValue(data?.value ?? ""); setInitialized(true); }

  const setMutation = trpc.content.set.useMutation({
    onSuccess: () => { toast.success("Guardado"); utils.content.get.invalidate({ key: fieldKey }); },
    onError: (err) => toast.error("Error", { description: err.message }),
  });

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (res) => { setValue(res.url); setMutation.mutate({ key: fieldKey, value: res.url }); toast.success("Imagen guardada"); },
    onError: (err) => toast.error("Error al subir", { description: err.message }),
    onSettled: () => setUploading(false),
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => { const base64 = (reader.result as string).split(",")[1]; uploadMutation.mutate({ filename: file.name, contentType: file.type, data: base64 }); };
    reader.readAsDataURL(file);
  };

  if (type === "image") return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted border flex-shrink-0" style={{ borderColor: "#eae5f3" }}>
          {value ? <img src={value} alt={label} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-muted-foreground/40" /></div>}
        </div>
        <div className="space-y-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <Button type="button" variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? "Subiendo..." : "Subir imagen"}
          </Button>
          {value && <p className="text-xs text-muted-foreground/60">Imagen guardada</p>}
        </div>
      </div>
    </div>
  );

  if (type === "textarea") return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="flex gap-2">
        <textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} rows={3} className="flex-1 px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background" style={{ borderColor: "#dcd2ee" }} />
        <Button type="button" size="sm" className="rounded-xl gradient-purple text-white border-0 shadow-purple self-start" onClick={() => setMutation.mutate({ key: fieldKey, value })} disabled={setMutation.isPending}>
          {setMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="rounded-xl flex-1" onKeyDown={(e) => e.key === "Enter" && setMutation.mutate({ key: fieldKey, value })} />
        <Button type="button" size="sm" className="rounded-xl gradient-purple text-white border-0 shadow-purple gap-1" onClick={() => setMutation.mutate({ key: fieldKey, value })} disabled={setMutation.isPending}>
          {setMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Guardar
        </Button>
      </div>
    </div>
  );
}

// ─── LogoField ────────────────────────────────────────────────────────────────
function LogoField() {
  const { data } = trpc.content.get.useQuery({ key: "site_logo" });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const logoUrl = data?.value ?? "";

  const setMutation = trpc.content.set.useMutation({
    onSuccess: () => { toast.success("Logo guardado"); utils.content.get.invalidate({ key: "site_logo" }); },
    onError: (err) => toast.error("Error", { description: err.message }),
  });

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (res) => { setMutation.mutate({ key: "site_logo", value: res.url }); toast.success("Logo subido y guardado"); },
    onError: (err) => toast.error("Error al subir", { description: err.message }),
    onSettled: () => setUploading(false),
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => { const base64 = (reader.result as string).split(",")[1]; uploadMutation.mutate({ filename: file.name, contentType: file.type, data: base64 }); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-start gap-5">
      <div className="w-28 h-16 rounded-xl overflow-hidden bg-muted border flex items-center justify-center flex-shrink-0" style={{ borderColor: "#eae5f3" }}>
        {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" /> : <ImageLucide className="w-7 h-7 text-muted-foreground/30" />}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Logo de la tienda</p>
        <p className="text-xs text-muted-foreground">Aparece en el menu lateral y en el footer. Recomendado: PNG transparente, min 200px de ancho.</p>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <Button type="button" variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? "Subiendo..." : logoUrl ? "Cambiar logo" : "Subir logo"}
        </Button>
      </div>
    </div>
  );
}

// ─── BannerSlidesManager ──────────────────────────────────────────────────────
function BannerSlidesManager() {
  const { data: slides = [], isLoading } = trpc.banner.adminList.useQuery();
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const createMutation = trpc.banner.create.useMutation({
    onSuccess: () => { toast.success("Slide agregado"); utils.banner.adminList.invalidate(); utils.banner.list.invalidate(); },
    onError: (err) => toast.error("Error", { description: err.message }),
    onSettled: () => setUploading(false),
  });

  const updateMutation = trpc.banner.update.useMutation({
    onSuccess: () => { toast.success("Guardado"); utils.banner.adminList.invalidate(); utils.banner.list.invalidate(); setEditingId(null); },
    onError: (err) => toast.error("Error", { description: err.message }),
  });

  const deleteMutation = trpc.banner.delete.useMutation({
    onSuccess: () => { toast.success("Slide eliminado"); utils.banner.adminList.invalidate(); utils.banner.list.invalidate(); },
    onError: (err) => toast.error("Error", { description: err.message }),
  });

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (res) => {
      const isVideo = res.url.match(/\.(mp4|webm|mov|avi)$/i);
      createMutation.mutate({ url: res.url, type: isVideo ? "video" : "image", sortOrder: slides.length });
    },
    onError: (err) => { toast.error("Error al subir", { description: err.message }); setUploading(false); },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = () => { const base64 = (reader.result as string).split(",")[1]; uploadMutation.mutate({ filename: file.name, contentType: file.type, data: base64 }); };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Slides del carrusel</p>
          <p className="text-xs text-muted-foreground">{slides.length} slide{slides.length !== 1 ? "s" : ""} · Acepta imagenes y videos (MP4, WebM)</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm,video/mov" multiple className="hidden" onChange={handleFileUpload} />
          <Button type="button" size="sm" className="rounded-xl gradient-purple text-white border-0 shadow-purple gap-2" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {uploading ? "Subiendo..." : "Agregar slide"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : slides.length === 0 ? (
        <div className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors" style={{ borderColor: "#dcd2ee" }} onClick={() => fileRef.current?.click()}>
          <div className="flex items-center justify-center gap-3 mb-2">
            <ImageLucide className="w-6 h-6 text-muted-foreground/40" />
            <Video className="w-6 h-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-foreground">Sube tu primera imagen o video</p>
          <p className="text-xs text-muted-foreground mt-1">Puedes subir varios a la vez. Se mostraran con dots de navegacion.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {slides.map((slide, index) => (
            <div key={slide.id} className={`bg-muted/30 rounded-xl border overflow-hidden transition-all ${!slide.active ? "opacity-60" : ""}`} style={{ borderColor: "#eae5f3" }}>
              {editingId === slide.id ? (
                <div className="p-3 space-y-2">
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Titulo (opcional)" className="rounded-lg text-sm" />
                  <Input value={editSubtitle} onChange={(e) => setEditSubtitle(e.target.value)} placeholder="Subtitulo (opcional)" className="rounded-lg text-sm" />
                  <div className="flex gap-2">
                    <Button size="sm" className="rounded-lg gradient-purple text-white border-0 text-xs" onClick={() => updateMutation.mutate({ id: slide.id, title: editTitle, subtitle: editSubtitle })} disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Guardar"}
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-lg text-xs" onClick={() => setEditingId(null)}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
                  <span className="text-xs font-bold text-muted-foreground/40 w-4">{index + 1}</span>
                  <div className="w-14 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {slide.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <Video className="w-4 h-4 text-white/60" />
                      </div>
                    ) : (
                      <img src={slide.url} alt={slide.title ?? `Slide ${index + 1}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{slide.title || `Slide ${index + 1}`}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${slide.type === "video" ? "bg-blue-50 text-blue-600" : "bg-guaiqui-purple-50 text-guaiqui-purple"}`}>
                        {slide.type === "video" ? <Video className="w-2.5 h-2.5" /> : <ImageLucide className="w-2.5 h-2.5" />}
                        {slide.type === "video" ? "Video" : "Imagen"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => updateMutation.mutate({ id: slide.id, active: !slide.active })} className={`px-2 py-0.5 rounded-full text-xs font-semibold border transition-colors ${slide.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                      {slide.active ? <CheckCircle2 className="w-3 h-3 inline" /> : <XCircle className="w-3 h-3 inline" />}
                    </button>
                    <button onClick={() => { setEditingId(slide.id); setEditTitle(slide.title ?? ""); setEditSubtitle(slide.subtitle ?? ""); }} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                      <Save className="w-3.5 h-3.5 text-primary" />
                    </button>
                    <button onClick={() => { if (confirm("Eliminar este slide?")) deleteMutation.mutate({ id: slide.id }); }} className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const CONTENT_SECTIONS = [
  {
    title: "Sobre nosotros",
    description: "Informacion sobre la artista y la historia de Guaiqui Avenue",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
    fields: [
      { key: "about_title", label: "Titulo de la pagina", type: "text", placeholder: "Sobre Guaiqui Avenue" },
      { key: "about_subtitle", label: "Subtitulo", type: "text", placeholder: "Arte anime con alma" },
      { key: "about_short", label: "Texto corto (aparece en el Home)", type: "textarea", placeholder: "Somos artistas apasionados..." },
      { key: "about_body", label: "Texto completo (pagina Sobre Nosotros)", type: "textarea", placeholder: "Historia detallada..." },
      { key: "about_mission", label: "Mision", type: "textarea", placeholder: "Nuestra mision es..." },
      { key: "about_vision", label: "Vision", type: "textarea", placeholder: "Nuestra vision es..." },
      { key: "about_image", label: "Imagen principal", type: "image" },
      { key: "about_image2", label: "Imagen secundaria", type: "image" },
    ],
  },
  {
    title: "Textos del hero",
    description: "Titulo, descripcion y boton del banner principal",
    icon: Sparkles,
    color: "text-guaiqui-purple",
    bg: "bg-guaiqui-purple-50",
    fields: [
      { key: "hero_title", label: "Titulo principal", type: "text", placeholder: "Arte Anime Hecho a Mano" },
      { key: "hero_subtitle", label: "Subtitulo / descripcion", type: "textarea", placeholder: "Cuadros originales de anime..." },
      { key: "hero_cta", label: "Texto del boton CTA", type: "text", placeholder: "Ver coleccion" },
    ],
  },
  {
    title: "Informacion de contacto",
    description: "Datos que aparecen en la pagina de contacto y el footer",
    icon: Phone,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    fields: [
      { key: "contact_email", label: "Email de contacto", type: "text", placeholder: "hola@guaiquiavenue.com" },
      { key: "contact_phone", label: "Telefono / WhatsApp", type: "text", placeholder: "+57 300 123 4567" },
      { key: "contact_address", label: "Ciudad / Pais", type: "text", placeholder: "Bogota, Colombia" },
    ],
  },
];

// ─── PopupManager ────────────────────────────────────────────────────────────
function PopupManager() {
  const { data: popup, isLoading } = trpc.popup.get.useQuery();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    title: "", subtitle: "", body: "", imageUrl: "",
    buttonText: "", buttonUrl: "",
    showNewsletter: true, active: true, delaySeconds: 2, showOnce: true,
  });
  const [initialized, setInitialized] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!initialized && popup !== undefined && popup !== null) {
    setForm({
      title: popup.title ?? "",
      subtitle: popup.subtitle ?? "",
      body: popup.body ?? "",
      imageUrl: popup.imageUrl ?? "",
      buttonText: popup.buttonText ?? "",
      buttonUrl: popup.buttonUrl ?? "",
      showNewsletter: popup.showNewsletter ?? true,
      active: popup.active ?? true,
      delaySeconds: popup.delaySeconds ?? 2,
      showOnce: popup.showOnce ?? true,
    });
    setInitialized(true);
  }

  const updateMutation = trpc.popup.update.useMutation({
    onSuccess: () => { toast.success("Pop-up guardado"); utils.popup.get.invalidate(); },
    onError: (err) => toast.error("Error", { description: err.message }),
  });

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (res) => { setForm(f => ({ ...f, imageUrl: res.url })); toast.success("Imagen subida"); },
    onError: (err) => toast.error("Error al subir", { description: err.message }),
    onSettled: () => setUploading(false),
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => { const base64 = (reader.result as string).split(",")[1]; uploadMutation.mutate({ filename: file.name, contentType: file.type, data: base64 }); };
    reader.readAsDataURL(file);
  };

  if (isLoading) return <div className="h-20 rounded-xl bg-muted animate-pulse" />;

  return (
    <div className="space-y-5">
      {/* Activar/desactivar */}
      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: form.active ? "#f6e6ff" : "#f3f0f8" }}>
        <div>
          <p className="text-sm font-bold text-foreground">Pop-up activo</p>
          <p className="text-xs text-muted-foreground">Cuando está activo, se muestra a los visitantes</p>
        </div>
        <button
          onClick={() => setForm(f => ({ ...f, active: !f.active }))}
          className="relative w-12 h-6 rounded-full transition-all"
          style={{ background: form.active ? "#7a16ca" : "#c0bbc9" }}
        >
          <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: form.active ? "26px" : "2px" }} />
        </button>
      </div>

      {/* Imagen */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Imagen del pop-up</label>
        <div className="flex items-start gap-4">
          <div className="w-32 h-20 rounded-xl overflow-hidden bg-muted border flex-shrink-0" style={{ borderColor: "#eae5f3" }}>
            {form.imageUrl ? <img src={form.imageUrl} alt="Pop-up" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-muted-foreground/40" /></div>}
          </div>
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Button type="button" variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? "Subiendo..." : "Subir imagen"}
            </Button>
            {form.imageUrl && (
              <button onClick={() => setForm(f => ({ ...f, imageUrl: "" }))} className="text-xs text-red-500 hover:underline block">Quitar imagen</button>
            )}
          </div>
        </div>
      </div>

      {/* Título */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Título</label>
        <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="¡Bienvenidos a Guaiqui Avenue!" className="rounded-xl" />
      </div>

      {/* Subtítulo */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subtítulo</label>
        <Input value={form.subtitle} onChange={(e) => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Arte anime hecho a mano con amor" className="rounded-xl" />
      </div>

      {/* Cuerpo */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Texto del cuerpo</label>
        <textarea value={form.body} onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Descripción del pop-up..." rows={3} className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background" style={{ borderColor: "#dcd2ee" }} />
      </div>

      {/* Botón CTA */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Texto del botón</label>
          <Input value={form.buttonText} onChange={(e) => setForm(f => ({ ...f, buttonText: e.target.value }))} placeholder="Explorar tienda" className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">URL del botón</label>
          <Input value={form.buttonUrl} onChange={(e) => setForm(f => ({ ...f, buttonUrl: e.target.value }))} placeholder="/tienda" className="rounded-xl" />
        </div>
      </div>

      {/* Opciones */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Delay (segundos)</label>
          <Input type="number" min={0} max={30} value={form.delaySeconds} onChange={(e) => setForm(f => ({ ...f, delaySeconds: parseInt(e.target.value) || 0 }))} className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mostrar solo una vez</label>
          <button
            onClick={() => setForm(f => ({ ...f, showOnce: !f.showOnce }))}
            className="flex items-center gap-2 mt-1"
          >
            <span className="relative w-10 h-5 rounded-full transition-all inline-block" style={{ background: form.showOnce ? "#7a16ca" : "#c0bbc9" }}>
              <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: form.showOnce ? "22px" : "2px" }} />
            </span>
            <span className="text-sm text-foreground">{form.showOnce ? "Sí" : "No"}</span>
          </button>
        </div>
      </div>

      {/* Mostrar suscripción */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
        <div>
          <p className="text-sm font-semibold text-foreground">Mostrar formulario de suscripción</p>
          <p className="text-xs text-muted-foreground">Permite a los visitantes suscribirse al boletín desde el pop-up</p>
        </div>
        <button
          onClick={() => setForm(f => ({ ...f, showNewsletter: !f.showNewsletter }))}
          className="relative w-10 h-5 rounded-full transition-all"
          style={{ background: form.showNewsletter ? "#7a16ca" : "#c0bbc9" }}
        >
          <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: form.showNewsletter ? "22px" : "2px" }} />
        </button>
      </div>

      {/* Guardar */}
      <Button
        onClick={() => updateMutation.mutate(form)}
        disabled={updateMutation.isPending}
        className="w-full rounded-xl gradient-purple text-white border-0 shadow-purple gap-2"
      >
        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar cambios del pop-up
      </Button>
    </div>
  );
}

// ─── NewsletterManager ────────────────────────────────────────────────────────
function NewsletterManager() {
  const { data: subscribers = [], isLoading, refetch } = trpc.newsletter.list.useQuery();
  const removeMutation = trpc.newsletter.remove.useMutation({
    onSuccess: () => { toast.success("Suscriptor eliminado"); refetch(); },
    onError: (err) => toast.error("Error", { description: err.message }),
  });

  if (isLoading) return <div className="h-20 rounded-xl bg-muted animate-pulse" />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{subscribers.length} suscriptor{subscribers.length !== 1 ? "es" : ""}</p>
      </div>
      {subscribers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aún no hay suscriptores</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {subscribers.map((sub: any) => (
            <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
              <div>
                <p className="text-sm font-semibold text-foreground">{sub.name || "Sin nombre"}</p>
                <p className="text-xs text-muted-foreground">{sub.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">{new Date(sub.subscribedAt).toLocaleDateString("es")}</p>
                <button
                  onClick={() => removeMutation.mutate({ id: sub.id })}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  title="Eliminar suscriptor"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminContent() {
  return (
    <AdminLayout>
      <div className="space-y-5 max-w-3xl">
        <div>
          <h2 className="text-lg font-bold text-foreground">Contenido del sitio</h2>
          <p className="text-sm text-muted-foreground">Los cambios se aplican inmediatamente en la tienda</p>
        </div>

        {/* Logo */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#eae5f3" }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "#eae5f3" }}>
            <div className="w-9 h-9 rounded-xl bg-guaiqui-purple-50 flex items-center justify-center flex-shrink-0">
              <LayoutTemplate className="w-4 h-4 text-guaiqui-purple" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Logo de la tienda</h3>
              <p className="text-xs text-muted-foreground">Aparece en el menu lateral y en el footer</p>
            </div>
          </div>
           <div className="p-5">
            <LogoField />
          </div>
        </div>
        {/* Site Name */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#eae5f3" }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "#eae5f3" }}>
            <div className="w-9 h-9 rounded-xl bg-guaiqui-purple-50 flex items-center justify-center flex-shrink-0">
              <LayoutTemplate className="w-4 h-4 text-guaiqui-purple" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Nombre de la tienda</h3>
              <p className="text-xs text-muted-foreground">Aparece en el menu lateral, footer y titulo del sitio</p>
            </div>
          </div>
          <div className="p-5">
            <ContentField fieldKey="site_name" label="Nombre de la tienda" type="text" placeholder="Guaiqui Avenue" />
          </div>
        </div>
        {/* Banner Slides */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#eae5f3" }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "#eae5f3" }}>
            <div className="w-9 h-9 rounded-xl bg-guaiqui-purple-50 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-guaiqui-purple" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Carrusel del hero</h3>
              <p className="text-xs text-muted-foreground">Imagenes y videos que rotan en el banner principal con dots de navegacion</p>
            </div>
          </div>
          <div className="p-5">
            <BannerSlidesManager />
          </div>
        </div>

        {/* Welcome Popup */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#eae5f3" }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "#eae5f3" }}>
            <div className="w-9 h-9 rounded-xl bg-guaiqui-purple-50 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-guaiqui-purple" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Pop-up de bienvenida</h3>
              <p className="text-xs text-muted-foreground">Se muestra a los visitantes al entrar a la tienda. Puedes agregar imagen, texto y suscripción al boletín.</p>
            </div>
          </div>
          <div className="p-5">
            <PopupManager />
          </div>
        </div>

        {/* Newsletter Subscribers */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#eae5f3" }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "#eae5f3" }}>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Suscriptores del boletín</h3>
              <p className="text-xs text-muted-foreground">Personas que se suscribieron desde el pop-up de bienvenida</p>
            </div>
          </div>
          <div className="p-5">
            <NewsletterManager />
          </div>
        </div>

        {/* Other sections */}
        {CONTENT_SECTIONS.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#eae5f3" }}>
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "#eae5f3" }}>
              <div className={`w-9 h-9 rounded-xl ${section.bg} flex items-center justify-center flex-shrink-0`}>
                <section.icon className={`w-4 h-4 ${section.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{section.title}</h3>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </div>
            </div>
            <div className="p-5 space-y-5">
              {section.fields.map((field) => (
                <ContentField key={field.key} fieldKey={field.key} label={field.label} type={field.type} placeholder={field.placeholder} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
