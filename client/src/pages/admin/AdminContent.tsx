import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Loader2, Save, Image, FileText, Info } from "lucide-react";

const CONTENT_SECTIONS = [
  {
    title: "Hero (Página de inicio)",
    icon: Image,
    fields: [
      { key: "hero_title", label: "Título principal", type: "text", placeholder: "Descubre tu estilo único" },
      { key: "hero_subtitle", label: "Subtítulo", type: "textarea", placeholder: "Colecciones exclusivas..." },
      { key: "hero_cta", label: "Texto del botón CTA", type: "text", placeholder: "Explorar colección" },
      { key: "hero_image", label: "Imagen de fondo del hero", type: "image" },
    ],
  },
  {
    title: "Sobre nosotros",
    icon: Info,
    fields: [
      { key: "about_title", label: "Título", type: "text", placeholder: "Sobre nosotras" },
      { key: "about_subtitle", label: "Subtítulo", type: "text", placeholder: "Descubre la historia..." },
      { key: "about_short", label: "Texto corto (Home)", type: "textarea", placeholder: "Somos una tienda..." },
      { key: "about_body", label: "Texto completo", type: "textarea", placeholder: "Texto largo..." },
      { key: "about_mission", label: "Misión", type: "textarea", placeholder: "Nuestra misión..." },
      { key: "about_vision", label: "Visión", type: "textarea", placeholder: "Nuestra visión..." },
      { key: "about_image", label: "Imagen principal", type: "image" },
      { key: "about_image2", label: "Imagen secundaria", type: "image" },
    ],
  },
  {
    title: "Contacto",
    icon: FileText,
    fields: [
      { key: "contact_email", label: "Email de contacto", type: "text", placeholder: "hola@purplestore.com" },
      { key: "contact_phone", label: "Teléfono", type: "text", placeholder: "+1 (555) 123-4567" },
      { key: "contact_address", label: "Dirección", type: "text", placeholder: "Ciudad, País" },
    ],
  },
];

function ContentField({
  fieldKey,
  label,
  type,
  placeholder,
}: {
  fieldKey: string;
  label: string;
  type: string;
  placeholder?: string;
}) {
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
    onSuccess: () => {
      toast.success("Guardado correctamente");
      utils.content.get.invalidate({ key: fieldKey });
    },
    onError: (err) => toast.error("Error al guardar", { description: err.message }),
  });

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (res) => {
      setValue(res.url);
      setMutation.mutate({ key: fieldKey, value: res.url });
      toast.success("Imagen subida y guardada");
    },
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

  const handleSave = () => {
    setMutation.mutate({ key: fieldKey, value });
  };

  if (type === "image") {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted border border-border flex-shrink-0">
            {value ? (
              <img src={value} alt={label} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full gradient-purple-soft flex items-center justify-center">
                <Image className="w-6 h-6 text-primary/40" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl gap-2"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? "Subiendo..." : "Cambiar imagen"}
            </Button>
            {value && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{value}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="flex gap-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="flex-1 px-3 py-2.5 rounded-xl border border-border/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground placeholder:text-muted-foreground text-sm resize-none"
          />
          <Button
            type="button"
            size="sm"
            className="rounded-xl gradient-purple text-white border-0 shadow-purple self-start gap-1"
            onClick={handleSave}
            disabled={setMutation.isPending}
          >
            {setMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="rounded-xl flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <Button
          type="button"
          size="sm"
          className="rounded-xl gradient-purple text-white border-0 shadow-purple gap-1"
          onClick={handleSave}
          disabled={setMutation.isPending}
        >
          {setMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Guardar
        </Button>
      </div>
    </div>
  );
}

export default function AdminContent() {
  return (
    <AdminLayout title="Contenido del sitio">
      <div className="space-y-8 max-w-3xl">
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-sm text-primary">
            Edita aquí el contenido visible en el sitio web. Los cambios se aplican inmediatamente.
          </p>
        </div>

        {CONTENT_SECTIONS.map((section) => (
          <div key={section.title} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-border bg-muted/30">
              <div className="w-8 h-8 rounded-lg gradient-purple-soft flex items-center justify-center">
                <section.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{section.title}</h3>
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
