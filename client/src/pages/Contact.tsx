import StoreLayout from "@/components/StoreLayout";
import { trpc } from "@/lib/trpc";
import { Mail, Phone, MapPin, Send, CheckCircle, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const { data: contactEmail } = trpc.content.get.useQuery({ key: "contact_email" });
  const { data: contactPhone } = trpc.content.get.useQuery({ key: "contact_phone" });
  const { data: contactAddress } = trpc.content.get.useQuery({ key: "contact_address" });

  const sendMutation = trpc.contact.send.useMutation({
    onSuccess: () => {
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    },
    onError: (err) => {
      toast.error("Error al enviar el mensaje", { description: err.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }
    sendMutation.mutate(form);
  };

  const nunito = { fontFamily: "'Nunito', sans-serif" };

  const contactInfo = [
    { icon: Mail, label: "Email", value: contactEmail?.value ?? "hola@borahaeart.com" },
    { icon: Phone, label: "Teléfono / WhatsApp", value: contactPhone?.value ?? "+57 300 000 0000" },
    { icon: MapPin, label: "Ubicación", value: contactAddress?.value ?? "Colombia" },
  ];

  return (
    <StoreLayout>
      {/* Hero banner */}
      <div className="px-4 lg:px-8 pt-4 pb-2">
        <div
          className="rounded-2xl px-5 py-8 md:px-8 md:py-12 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, oklch(0.35 0.22 295) 0%, oklch(0.52 0.24 295) 55%, oklch(0.72 0.18 295) 100%)",
          }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20"
            style={{ background: "oklch(0.88 0.10 295)" }} />
          <div className="absolute top-6 right-24 w-10 h-10 rounded-full border-2 border-white/20" />
          <div className="absolute top-12 right-40 w-5 h-5 rounded-full border border-white/15" />

          <div className="relative z-10 text-center max-w-xl mx-auto">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-black"
              style={{ background: "oklch(1 0 0 / 0.15)", color: "white", border: "1px solid oklch(1 0 0 / 0.25)" }}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Estamos aquí para ti
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white mb-3" style={nunito}>Contáctanos</h1>
            <p className="text-white/75 font-semibold" style={nunito}>
              ¿Tienes dudas sobre un encargo o quieres más info? Escríbenos y te respondemos pronto.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid md:grid-cols-5 gap-6 md:gap-10">
          {/* Contact info */}
          <div className="md:col-span-2 space-y-5">
            <div>
              <h2 className="text-2xl font-black text-foreground mb-2" style={nunito}>
                Información de contacto
              </h2>
              <p className="text-muted-foreground font-semibold text-sm leading-relaxed" style={nunito}>
                Puedes escribirnos por cualquiera de estos medios o completar el formulario.
              </p>
            </div>

            <div className="space-y-3">
              {contactInfo.map((info, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-2xl transition-all hover:-translate-y-0.5"
                  style={{
                    background: "oklch(0.98 0.008 295)",
                    border: "1.5px solid oklch(0.91 0.04 295)",
                    boxShadow: "0 2px 8px oklch(0.42 0.24 295 / 0.05)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px oklch(0.42 0.24 295 / 0.12)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(0.72 0.18 295 / 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px oklch(0.42 0.24 295 / 0.05)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(0.91 0.04 295)";
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, oklch(0.92 0.06 295) 0%, oklch(0.78 0.14 295) 100%)" }}
                  >
                    <info.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider mb-0.5" style={{ color: "oklch(0.62 0.22 295)", fontFamily: "'Nunito', sans-serif" }}>
                      {info.label}
                    </p>
                    <p className="text-foreground font-bold text-sm" style={nunito}>{info.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Response time */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, oklch(0.35 0.22 295) 0%, oklch(0.52 0.24 295) 100%)",
              }}
            >
              <p className="font-black text-white text-sm mb-1" style={nunito}>⚡ Tiempo de respuesta</p>
              <p className="text-white/75 text-xs font-semibold" style={nunito}>
                Respondemos en menos de 24 horas en días hábiles. Para encargos urgentes, escríbenos por WhatsApp.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            <div
              className="p-8 rounded-2xl"
              style={{
                background: "oklch(0.98 0.008 295)",
                border: "1.5px solid oklch(0.91 0.04 295)",
                boxShadow: "0 4px 24px oklch(0.42 0.24 295 / 0.08)",
              }}
            >
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: "linear-gradient(135deg, oklch(0.92 0.06 295) 0%, oklch(0.78 0.14 295) 100%)" }}
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground mb-2" style={nunito}>
                    ¡Mensaje enviado!
                  </h3>
                  <p className="text-muted-foreground font-semibold text-sm mb-6" style={nunito}>
                    Gracias por escribirnos. Te responderemos a la brevedad.
                  </p>
                  <Button
                    className="rounded-full font-black border-0"
                    style={{ ...nunito, background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)", color: "white" }}
                    onClick={() => setSent(false)}
                  >
                    Enviar otro mensaje
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-xl font-black text-foreground mb-1" style={nunito}>Envíanos un mensaje</h3>
                  <p className="text-muted-foreground text-sm font-semibold mb-4" style={nunito}>
                    Cuéntanos sobre tu encargo o consulta
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-black text-foreground" style={nunito}>
                        Nombre <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        placeholder="Tu nombre"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="rounded-2xl font-semibold text-sm"
                        style={{ ...nunito, border: "1.5px solid oklch(0.91 0.04 295)" }}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-black text-foreground" style={nunito}>
                        Email <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="rounded-2xl font-semibold text-sm"
                        style={{ ...nunito, border: "1.5px solid oklch(0.91 0.04 295)" }}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-black text-foreground" style={nunito}>Asunto</label>
                    <Input
                      placeholder="¿En qué podemos ayudarte?"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="rounded-2xl font-semibold text-sm"
                      style={{ ...nunito, border: "1.5px solid oklch(0.91 0.04 295)" }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-black text-foreground" style={nunito}>
                      Mensaje <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      placeholder="Describe tu encargo o escribe tu consulta aquí..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={5}
                      required
                      className="w-full px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 bg-background text-foreground placeholder:text-muted-foreground text-sm resize-none transition-all font-semibold"
                      style={{
                        ...nunito,
                        border: "1.5px solid oklch(0.91 0.04 295)",
                        // @ts-ignore
                        "--tw-ring-color": "oklch(0.62 0.22 295 / 0.3)",
                      }}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-2xl font-black h-12 text-base border-0 hover:opacity-90 transition-opacity"
                    style={{
                      ...nunito,
                      background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)",
                      color: "white",
                      boxShadow: "0 6px 24px oklch(0.42 0.24 295 / 0.35)",
                    }}
                    disabled={sendMutation.isPending}
                  >
                    {sendMutation.isPending ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar mensaje
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
