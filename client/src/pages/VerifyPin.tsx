import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useCustomAuth } from "@/contexts/AuthContext";

export default function VerifyPin() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const email = params.get("email") ?? "";
  const { refetch } = useCustomAuth();

  const [pins, setPins] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyMutation = trpc.customAuth.verifyPin.useMutation({
    onSuccess: () => {
      toast.success("¡Cuenta verificada! Bienvenido a Guaiqui Avenue ✨");
      refetch();
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.message);
      setPins(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
  });

  const resendMutation = trpc.customAuth.resendPin.useMutation({
    onSuccess: (data) => {
      if (data.previewUrl) {
        console.log("[Dev] Email preview:", data.previewUrl);
        toast.success("Código reenviado. Revisa la consola para el enlace de previsualización (modo dev).");
      } else {
        toast.success("Código reenviado. Revisa tu correo.");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newPins = [...pins];
    newPins[index] = digit;
    setPins(newPins);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (digit && index === 5) {
      const fullPin = [...newPins.slice(0, 5), digit].join("");
      if (fullPin.length === 6 && email) {
        verifyMutation.mutate({ email, pin: fullPin });
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !pins[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setPins(text.split(""));
      verifyMutation.mutate({ email, pin: text });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pin = pins.join("");
    if (pin.length !== 6) {
      toast.error("Ingresa el código de 6 dígitos completo");
      return;
    }
    verifyMutation.mutate({ email, pin });
  }

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 md:py-16"
      style={{ background: "#f9f7fd" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span
              className="text-2xl font-black tracking-tight cursor-pointer"
              style={{ color: "#6400aa" }}
            >
              ✨ Guaiqui Avenue
            </span>
          </Link>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-5 md:p-8 text-center"
          style={{
            background: "#ffffff",
            boxShadow: "0 8px 40px rgb(122 22 202 / 0.12)",
            border: "1.5px solid #e6dcf8",
          }}
        >
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #e8d9ff, #dcbbff)" }}
          >
            <span className="text-3xl">📧</span>
          </div>

          <h1 className="text-2xl font-black mb-2" style={{ color: "#2e005d" }}>
            Verifica tu correo
          </h1>
          <p className="text-sm mb-1" style={{ color: "#7a6699" }}>
            Enviamos un código de 6 dígitos a
          </p>
          <p className="text-sm font-bold mb-6" style={{ color: "#7a16ca" }}>
            {email || "tu correo"}
          </p>

          <form onSubmit={handleSubmit}>
            {/* PIN inputs */}
            <div className="flex gap-1.5 sm:gap-2 justify-center mb-6" onPaste={handlePaste}>
              {pins.map((pin, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={pin}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-black rounded-xl outline-none transition-all"
                  style={{
                    background: pin ? "#eed9ff" : "#f6f4fb",
                    border: pin
                      ? "2px solid #862bd8"
                      : "1.5px solid #decff9",
                    color: "#2e005d",
                    fontSize: "1.5rem",
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={verifyMutation.isPending || pins.join("").length !== 6}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background:
                  verifyMutation.isPending || pins.join("").length !== 6
                    ? "#cdb8f0"
                    : "linear-gradient(135deg, #6400aa 0%, #862bd8 100%)",
                color: "#ffffff",
                boxShadow:
                  pins.join("").length === 6
                    ? "0 4px 16px rgb(122 22 202 / 0.35)"
                    : "none",
              }}
            >
              {verifyMutation.isPending ? "Verificando..." : "Verificar cuenta"}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 pt-6" style={{ borderTop: "1px solid #ece2ff" }}>
            <p className="text-sm mb-2" style={{ color: "#7a6699" }}>
              ¿No recibiste el código?
            </p>
            <button
              onClick={() => resendMutation.mutate({ email })}
              disabled={resendMutation.isPending || !email}
              className="text-sm font-bold transition-all"
              style={{ color: "#7a16ca" }}
            >
              {resendMutation.isPending ? "Enviando..." : "Reenviar código"}
            </button>
          </div>

          <p className="text-center text-sm mt-4" style={{ color: "#7a6699" }}>
            <Link href="/registro">
              <span className="cursor-pointer" style={{ color: "#7a16ca" }}>
                ← Volver al registro
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
