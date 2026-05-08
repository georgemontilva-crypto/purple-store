import StoreLayout from "@/components/StoreLayout";
import { trpc } from "@/lib/trpc";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
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

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: contactEmail?.value ?? "hola@purplestore.com",
    },
    {
      icon: Phone,
      label: "Teléfono",
      value: contactPhone?.value ?? "+1 (555) 123-4567",
    },
    {
      icon: MapPin,
      label: "Dirección",
      value: contactAddress?.value ?? "Ciudad, País",
    },
  ];

  return (
    <StoreLayout>
      {/* Hero */}
      <div className="gradient-purple-soft py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1
            className="text-5xl font-bold text-foreground mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Contáctanos
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Estamos aquí para ayudarte. Escríbenos y te responderemos a la brevedad.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-20">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <h2
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Información de contacto
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Puedes contactarnos a través de cualquiera de estos medios o completar el formulario.
            </p>

            <div className="space-y-4">
              {contactInfo.map((info, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-purple transition-all"
                >
                  <div className="w-10 h-10 rounded-xl gradient-purple-soft flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                      {info.label}
                    </p>
                    <p className="text-foreground font-medium">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full gradient-purple-soft flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h3
                  className="text-2xl font-bold text-foreground mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  ¡Mensaje enviado!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Gracias por contactarnos. Te responderemos pronto.
                </p>
                <Button
                  variant="outline"
                  className="rounded-full border-primary/30 text-primary"
                  onClick={() => setSent(false)}
                >
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Nombre <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      placeholder="Tu nombre"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="rounded-xl border-border/60 focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="rounded-xl border-border/60 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Asunto</label>
                  <Input
                    placeholder="¿En qué podemos ayudarte?"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="rounded-xl border-border/60 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Mensaje <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    placeholder="Escribe tu mensaje aquí..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={6}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-border/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground placeholder:text-muted-foreground text-sm resize-none transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-xl gradient-purple text-white border-0 shadow-purple h-12 text-base font-semibold hover:opacity-90"
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
    </StoreLayout>
  );
}
