import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useCustomAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [, navigate] = useLocation();
  const { refetch } = useCustomAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loginMutation = trpc.customAuth.login.useMutation({
    onSuccess: () => {
      toast.success("¡Bienvenida de vuelta! 🎨");
      refetch();
      navigate("/");
    },
    onError: (err) => {
      if (err.message.includes("verificar")) {
        toast.error(err.message, {
          action: {
            label: "Verificar ahora",
            onClick: () => navigate(`/verificar?email=${encodeURIComponent(form.email)}`),
          },
        });
      } else {
        toast.error(err.message);
      }
    },
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (!form.password) e.password = "Ingresa tu contraseña";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    loginMutation.mutate({ email: form.email, password: form.password });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: "oklch(0.98 0.008 295)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span
              className="text-2xl font-black tracking-tight cursor-pointer"
              style={{ color: "oklch(0.35 0.22 295)" }}
            >
              🎨 BoraHae Art
            </span>
          </Link>
          <p className="mt-2 text-sm" style={{ color: "oklch(0.55 0.08 295)" }}>
            Arte Anime Hecho a Mano
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: "#ffffff",
            boxShadow: "0 8px 40px oklch(0.42 0.24 295 / 0.12)",
            border: "1.5px solid oklch(0.91 0.04 295)",
          }}
        >
          <h1 className="text-2xl font-black mb-1" style={{ color: "oklch(0.22 0.18 295)" }}>
            Iniciar sesión
          </h1>
          <p className="text-sm mb-6" style={{ color: "oklch(0.55 0.08 295)" }}>
            Bienvenida de vuelta a BoraHae Art
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "oklch(0.35 0.18 295)" }}>
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "oklch(0.97 0.01 295)",
                  border: errors.email ? "2px solid oklch(0.65 0.22 25)" : "1.5px solid oklch(0.88 0.06 295)",
                  color: "oklch(0.22 0.18 295)",
                }}
              />
              {errors.email && <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.22 25)" }}>{errors.email}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "oklch(0.35 0.18 295)" }}>
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Tu contraseña"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "oklch(0.97 0.01 295)",
                  border: errors.password ? "2px solid oklch(0.65 0.22 25)" : "1.5px solid oklch(0.88 0.06 295)",
                  color: "oklch(0.22 0.18 295)",
                }}
              />
              {errors.password && <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.22 25)" }}>{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all mt-2"
              style={{
                background: loginMutation.isPending
                  ? "oklch(0.75 0.12 295)"
                  : "linear-gradient(135deg, oklch(0.35 0.22 295) 0%, oklch(0.52 0.24 295) 100%)",
                color: "#ffffff",
                boxShadow: "0 4px 16px oklch(0.42 0.24 295 / 0.35)",
              }}
            >
              {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm mt-6" style={{ color: "oklch(0.55 0.08 295)" }}>
            ¿No tienes cuenta?{" "}
            <Link href="/registro">
              <span className="font-bold cursor-pointer" style={{ color: "oklch(0.42 0.24 295)" }}>
                Regístrate gratis
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
