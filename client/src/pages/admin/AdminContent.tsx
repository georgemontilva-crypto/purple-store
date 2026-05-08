import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Loader2, Save, ImageIcon, FileText, Phone, Sparkles } from "lucide-react";

const CONTENT_SECTIONS = [
  {
    title: "Hero (Página de inicio)",
    description: "El banner principal que ven los visitantes al entrar a la tienda",
    icon: Sparkles,
    color: "text-violet-600",
    bg: "bg-violet-50",
    fields: [
      { key: "hero_title", label: "Título principal", type: "text", placeholder: "Arte Anime Hecho a Mano" },
      { key: "hero_subtitle", label: "Subtítulo / descripción", type: "textarea", placeholder: "Cuadros originales de anime..." },
      { key: "hero_cta", label: "Texto del botón CTA", type: "text", placeholder: "Ver colección" },
      { key: "hero_image", label: "Imagen de fondo del hero", type: "image" },
    ],
  },
  {
    title: "Sobre nosotros",
    description: "Información sobre la artista y la historia de BoraHae Art",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
    fields: [
      { key: "about_title", label: "Título de la página", type: "text", placeholder: "Sobre BoraHae Art" },
      { key: "about_subtitle", label: "Subtítulo", type: "text", placeholder: "Arte anime con alma" },
      { key: "about_short", label: "Texto corto (aparece en el Home)", type: "textarea", placeholder: "Somos artistas apasionados..." },
      { key: "about_body", label: "Texto completo (página Sobre Nosotros)", type: "textarea", placeholder: "Historia detallada..." },
      { key: "about_mission", label: "Misión", type: "textarea", placeholder: "Nuestra misión es..." },
      { key: "about_vision", label: "Visión", type: "textarea", placeholder: "Nuestra visión es..." },
      { key: "about_image", label: "Imagen principal", type: "image" },
      { key: "about_image2", label: "Imagen secundaria", type: "image" },
    ],
  },
  {
    title: "Información de contacto",
    description: "Datos que aparecen en la página de contacto y el footer",
    icon: Phone,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    fields: [
      { key: "contact_email", label: "Email de contacto", type: "text", placeholder: "hola@borahaeart.com" },
      { key: "contact_phone", label: "Teléfono / WhatsApp", type: "text", placeholder: "+57 300 123 4567" },
      { key: "contact_address", label: "Ciudad / País", type: "text", placeholder: "Bogotá, Colombia" },
    ],
  },
];

function ContentField({ fieldKey, label, type, placeholder }: { fieldKey: string; label: string; type: string; placeholder?: string }) {
  const { data } = trpc.content.get.useQuery({ key: fieldKey });
  const [value, setValue] = useState<string>("");
  const [initialized, setInitialized] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  if (!initialized && data !== undefined) {
    setValue(data?.value ?? "");
    setInitialized(true);
  }

  const setMutation = trpc.content.set.useMutation({
    onSuccess: () => { toast.success("Guardado correctamente"); utils.content.get.invalidate({ key: fieldKey }); },
    onError: (err) => toast.error("Error al guardar", { description: err.message }),
  });

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (res) => { setValue(res.url); setMutation.mutate({ key: fieldKey, value: res.url }); toast.success("Imagen subida y guardada"); },
    onError: (err) => toast.error("Error al subir imagen", { description: err.message }),
    onSettled: () => setUploading(false),
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

  if (type === "image") {
    return (
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted border flex-shrink-0" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
            {value ? (
              <img src={value} alt={label} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Button type="button" variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? "Subiendo..." : "Subir imagen"}
            </Button>
            {value && <p className="text-xs text-muted-foreground/60 truncate max-w-[200px]">✓ Imagen guardada</p>}
          </div>
        </div>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
        <div className="flex gap-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="flex-1 px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
            style={{ borderColor: "oklch(0.88 0.04 295)" }}
          />
          <Button type="button" size="sm" className="rounded-xl gradient-purple text-white border-0 shadow-purple self-start gap-1" onClick={() => setMutation.mutate({ key: fieldKey, value })} disabled={setMutation.isPending}>
            {setMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="rounded-xl flex-1"
          onKeyDown={(e) => e.key === "Enter" && setMutation.mutate({ key: fieldKey, value })}
        />
        <Button type="button" size="sm" className="rounded-xl gradient-purple text-white border-0 shadow-purple gap-1" onClick={() => setMutation.mutate({ key: fieldKey, value })} disabled={setMutation.isPending}>
          {setMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Guardar
        </Button>
      </div>
    </div>
  );
}

export default function AdminContent() {
  return (
    <AdminLayout>
      <div className="space-y-5 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Contenido del sitio</h2>
            <p className="text-sm text-muted-foreground">Los cambios se aplican inmediatamente en la tienda</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border flex items-start gap-3" style={{ background: "oklch(0.96 0.03 295)", borderColor: "oklch(0.88 0.06 295)" }}>
          <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-primary font-medium">
            Edita el contenido de tu tienda sin tocar código. Cada campo tiene su propio botón de guardar.
          </p>
        </div>

        {CONTENT_SECTIONS.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
              <div className={`w-9 h-9 rounded-xl ${section.bg} flex items-center justify-center flex-shrink-0`}>
                <section.icon className={`w-4.5 h-4.5 ${section.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{section.title}</h3>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </div>
            </div>
            <div className="p-5 space-y-5">
              {section.fields.map((field) => (
                <ContentField
                  key={field.key}
                  fieldKey={field.key}
                  label={field.label}
                  type={field.type}
                  placeholder={field.placeholder}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
