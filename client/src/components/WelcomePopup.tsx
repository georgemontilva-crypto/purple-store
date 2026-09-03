import { useEffect, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { X, Mail, ArrowRight, Sparkles } from "lucide-react";

const nunito = { fontFamily: "'Nunito', sans-serif" };
const purple = "#7a16ca";
const purpleLight = "#a159f1";
const purpleBg = "#f9f7fd";
const purpleBorder = "#e6dcf8";

const STORAGE_KEY = "guaiqui_popup_seen";

export default function WelcomePopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState("");

  const { data: popup } = trpc.popup.get.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (res) => {
      if (res?.alreadySubscribed) {
        toast.success("¡Ya estabas suscrita! Gracias por tu interés 💜");
      } else {
        toast.success("¡Suscripción exitosa! Gracias por unirte 🎨");
      }
      setSubscribed(true);
    },
    onError: (err) => {
      toast.error(err.message || "Error al suscribirse");
    },
  });

  useEffect(() => {
    if (!popup) return;
    if (!popup.active) return;

    const alreadySeen = localStorage.getItem(STORAGE_KEY);
    if (popup.showOnce && alreadySeen) return;

    const delay = (popup.delaySeconds ?? 2) * 1000;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [popup]);

  function handleClose() {
    setVisible(false);
    if (popup?.showOnce) {
      localStorage.setItem(STORAGE_KEY, "1");
    }
  }

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Ingresa un email válido");
      return;
    }
    setEmailError("");
    subscribeMutation.mutate({ email, name: name || undefined });
  }

  if (!visible || !popup) return null;

  const gradientBg = `linear-gradient(135deg, ${purple} 0%, ${purpleLight} 100%)`;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "#ffffff", border: `1.5px solid ${purpleBorder}` }}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "#f0e5ff", color: purple }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Imagen */}
        {popup.imageUrl && (
          <div className="w-full h-48 overflow-hidden">
            <img
              src={popup.imageUrl}
              alt="Bienvenida"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Contenido */}
        <div className="p-6">
          {/* Ícono decorativo si no hay imagen */}
          {!popup.imageUrl && (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto"
              style={{ background: gradientBg, boxShadow: `0 4px 16px rgb(122 22 202 / 0.35)` }}
            >
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          )}

          {/* Título */}
          <h2
            className="text-2xl font-black text-center mb-1 leading-tight"
            style={{ color: "#2e005d", ...nunito }}
          >
            {popup.title}
          </h2>

          {/* Subtítulo */}
          {popup.subtitle && (
            <p
              className="text-sm text-center mb-3 font-semibold"
              style={{ color: "#7951ab", ...nunito }}
            >
              {popup.subtitle}
            </p>
          )}

          {/* Cuerpo */}
          {popup.body && (
            <p
              className="text-sm text-center mb-5 leading-relaxed"
              style={{ color: "#5e4a7a", ...nunito }}
            >
              {popup.body}
            </p>
          )}

          {/* Formulario de suscripción */}
          {popup.showNewsletter && !subscribed && (
            <form onSubmit={handleSubscribe} className="mb-4">
              <p
                className="text-xs font-bold text-center mb-3 uppercase tracking-wide"
                style={{ color: purple, ...nunito }}
              >
                <Mail className="w-3.5 h-3.5 inline mr-1" />
                Suscríbete al boletín
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Tu nombre (opcional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: purpleBg,
                    border: `1.5px solid ${purpleBorder}`,
                    color: "#2e005d",
                    ...nunito,
                  }}
                />
                <div>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      background: purpleBg,
                      border: emailError ? "2px solid oklch(0.65 0.22 25)" : `1.5px solid ${purpleBorder}`,
                      color: "#2e005d",
                      ...nunito,
                    }}
                  />
                  {emailError && (
                    <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.22 25)", ...nunito }}>
                      {emailError}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all"
                  style={{
                    background: subscribeMutation.isPending ? "#bc9bed" : gradientBg,
                    boxShadow: `0 4px 14px rgb(122 22 202 / 0.30)`,
                    ...nunito,
                  }}
                >
                  {subscribeMutation.isPending ? "Suscribiendo..." : "Suscribirme 💜"}
                </button>
              </div>
            </form>
          )}

          {/* Mensaje de éxito suscripción */}
          {subscribed && (
            <div
              className="text-center py-3 px-4 rounded-2xl mb-4"
              style={{ background: "#f2e2ff", ...nunito }}
            >
              <p className="text-sm font-bold" style={{ color: purple }}>
                ✓ ¡Suscripción confirmada! 💜
              </p>
            </div>
          )}

          {/* Botón CTA */}
          {popup.buttonText && popup.buttonUrl && (
            <Link href={popup.buttonUrl} onClick={handleClose}>
              <button
                className="w-full py-3 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{
                  background: gradientBg,
                  boxShadow: `0 4px 16px rgb(122 22 202 / 0.35)`,
                  ...nunito,
                }}
              >
                {popup.buttonText}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          )}

          {/* Omitir */}
          <button
            onClick={handleClose}
            className="w-full mt-3 text-xs font-semibold text-center transition-opacity hover:opacity-70"
            style={{ color: "#8f7baf", ...nunito }}
          >
            No gracias, seguir explorando
          </button>
        </div>
      </div>
    </div>
  );
}
