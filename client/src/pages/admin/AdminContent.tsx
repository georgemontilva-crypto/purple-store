import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Upload, Loader2, Save, ImageIcon, FileText, Phone, Sparkles,
  Video, Trash2, Plus, GripVertical, CheckCircle2, XCircle, Image as ImageLucide, LayoutTemplate,
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
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted border flex-shrink-0" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
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
        <textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} rows={3} className="flex-1 px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background" style={{ borderColor: "oklch(0.88 0.04 295)" }} />
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
      <div className="w-28 h-16 rounded-xl overflow-hidden bg-muted border flex items-center justify-center flex-shrink-0" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
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
        <div className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors" style={{ borderColor: "oklch(0.88 0.04 295)" }} onClick={() => fileRef.current?.click()}>
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
            <div key={slide.id} className={`bg-muted/30 rounded-xl border overflow-hidden transition-all ${!slide.active ? "opacity-60" : ""}`} style={{ borderColor: "oklch(0.93 0.02 295)" }}>
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
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${slide.type === "video" ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"}`}>
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
    description: "Informacion sobre la artista y la historia de BoraHae Art",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
    fields: [
      { key: "about_title", label: "Titulo de la pagina", type: "text", placeholder: "Sobre BoraHae Art" },
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
    color: "text-violet-600",
    bg: "bg-violet-50",
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
      { key: "contact_email", label: "Email de contacto", type: "text", placeholder: "hola@borahaeart.com" },
      { key: "contact_phone", label: "Telefono / WhatsApp", type: "text", placeholder: "+57 300 123 4567" },
      { key: "contact_address", label: "Ciudad / Pais", type: "text", placeholder: "Bogota, Colombia" },
    ],
  },
];

export default function AdminContent() {
  return (
    <AdminLayout>
      <div className="space-y-5 max-w-3xl">
        <div>
          <h2 className="text-lg font-bold text-foreground">Contenido del sitio</h2>
          <p className="text-sm text-muted-foreground">Los cambios se aplican inmediatamente en la tienda</p>
        </div>

        {/* Logo */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
              <LayoutTemplate className="w-4 h-4 text-violet-600" />
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
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
              <LayoutTemplate className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Nombre de la tienda</h3>
              <p className="text-xs text-muted-foreground">Aparece en el menu lateral, footer y titulo del sitio</p>
            </div>
          </div>
          <div className="p-5">
            <ContentField fieldKey="site_name" label="Nombre de la tienda" type="text" placeholder="BoraHae Art" />
          </div>
        </div>
        {/* Banner Slides */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-violet-600" />
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

        {/* Other sections */}
        {CONTENT_SECTIONS.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
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
