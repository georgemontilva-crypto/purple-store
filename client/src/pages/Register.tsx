import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Register() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerMutation = trpc.customAuth.register.useMutation({
    onSuccess: (data) => {
      // In dev mode, show preview URL if available
      if (data.previewUrl) {
        console.log("[Dev] Email preview:", data.previewUrl);
        toast.success("Cuenta creada. Revisa la consola para el enlace de previsualización del email (modo dev).");
      } else {
        toast.success("¡Cuenta creada! Revisa tu correo para el código de verificación.");
      }
      navigate(`/verificar?email=${encodeURIComponent(form.email)}`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "El nombre debe tener al menos 2 caracteres";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (form.password.length < 8) e.password = "La contraseña debe tener al menos 8 caracteres";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    registerMutation.mutate({ name: form.name, email: form.email, password: form.password });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 md:py-16"
      style={{ background: "#f9f7fd" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 md:mb-8">
          <Link href="/">
            <span
              className="text-2xl font-black tracking-tight cursor-pointer"
              style={{ color: "#6400aa" }}
            >
              ✨ Guaiqui Avenue
            </span>
          </Link>
          <p className="mt-2 text-sm" style={{ color: "#7a6699" }}>
            Accesorios, Belleza y Flores
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: "#ffffff",
            boxShadow: "0 8px 40px rgb(122 22 202 / 0.12)",
            border: "1.5px solid #e6dcf8",
          }}
        >
          <h1
            className="text-2xl font-black mb-1"
            style={{ color: "#2e005d" }}
          >
            Crear cuenta
          </h1>
          <p className="text-sm mb-6" style={{ color: "#7a6699" }}>
            Únete a la comunidad Guaiqui Avenue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#4e0586" }}>
                Nombre completo
              </label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "#f6f4fb",
                  border: errors.name ? "2px solid oklch(0.65 0.22 25)" : "1.5px solid #decff9",
                  color: "#2e005d",
                }}
              />
              {errors.name && <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.22 25)" }}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#4e0586" }}>
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "#f6f4fb",
                  border: errors.email ? "2px solid oklch(0.65 0.22 25)" : "1.5px solid #decff9",
                  color: "#2e005d",
                }}
              />
              {errors.email && <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.22 25)" }}>{errors.email}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#4e0586" }}>
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "#f6f4fb",
                  border: errors.password ? "2px solid oklch(0.65 0.22 25)" : "1.5px solid #decff9",
                  color: "#2e005d",
                }}
              />
              {errors.password && <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.22 25)" }}>{errors.password}</p>}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#4e0586" }}>
                Confirmar contraseña
              </label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "#f6f4fb",
                  border: errors.confirmPassword ? "2px solid oklch(0.65 0.22 25)" : "1.5px solid #decff9",
                  color: "#2e005d",
                }}
              />
              {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.22 25)" }}>{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all mt-2"
              style={{
                background: registerMutation.isPending
                  ? "#bc9bed"
                  : "linear-gradient(135deg, #6400aa 0%, #862bd8 100%)",
                color: "#ffffff",
                boxShadow: "0 4px 16px rgb(122 22 202 / 0.35)",
              }}
            >
              {registerMutation.isPending ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm mt-6" style={{ color: "#7a6699" }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login">
              <span className="font-bold cursor-pointer" style={{ color: "#7a16ca" }}>
                Inicia sesión
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
