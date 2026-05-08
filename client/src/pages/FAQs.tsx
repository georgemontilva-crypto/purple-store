import StoreLayout from "@/components/StoreLayout";
import { trpc } from "@/lib/trpc";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function FAQs() {
  const { data: faqs = [], isLoading } = trpc.faqs.list.useQuery();
  const [openId, setOpenId] = useState<number | null>(null);

  const nunito = { fontFamily: "'Nunito', sans-serif" };

  return (
    <StoreLayout>
      {/* Hero banner */}
      <div className="px-4 lg:px-8 pt-4 pb-2">
        <div
          className="rounded-2xl px-8 py-12 relative overflow-hidden"
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
              <HelpCircle className="w-3.5 h-3.5" />
              Resolvemos tus dudas
            </div>
            <h1 className="text-4xl font-black text-white mb-3" style={nunito}>
              Preguntas Frecuentes
            </h1>
            <p className="text-white/75 font-semibold" style={nunito}>
              Todo lo que necesitas saber sobre nuestros cuadros, encargos y envíos
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-3xl">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-2xl animate-pulse"
                style={{ background: "oklch(0.95 0.02 295)" }}
              />
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-16">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "linear-gradient(135deg, oklch(0.92 0.06 295) 0%, oklch(0.78 0.14 295) 100%)" }}
            >
              <HelpCircle className="w-9 h-9 text-white/70" />
            </div>
            <p className="text-muted-foreground font-bold" style={nunito}>
              Aún no hay preguntas disponibles. ¡Vuelve pronto!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={faq.id}
                className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  border: openId === faq.id
                    ? "1.5px solid oklch(0.62 0.22 295 / 0.5)"
                    : "1.5px solid oklch(0.91 0.04 295)",
                  background: openId === faq.id ? "oklch(0.97 0.01 295)" : "oklch(0.99 0.004 295)",
                  boxShadow: openId === faq.id
                    ? "0 4px 20px oklch(0.42 0.24 295 / 0.10)"
                    : "0 1px 4px oklch(0.42 0.24 295 / 0.04)",
                }}
              >
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span
                      className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black"
                      style={{
                        background: openId === faq.id
                          ? "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)"
                          : "oklch(0.92 0.06 295)",
                        color: openId === faq.id ? "white" : "oklch(0.42 0.24 295)",
                        fontFamily: "'Nunito', sans-serif",
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-black text-foreground text-sm" style={nunito}>
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className="flex-shrink-0 transition-transform duration-200"
                    style={{
                      width: "18px",
                      height: "18px",
                      color: "oklch(0.52 0.24 295)",
                      transform: openId === faq.id ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                {openId === faq.id && (
                  <div className="px-5 pb-5">
                    <div
                      className="w-full h-px mb-4"
                      style={{ background: "oklch(0.91 0.04 295)" }}
                    />
                    <p className="text-muted-foreground leading-relaxed font-semibold text-sm" style={nunito}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div
          className="mt-12 p-8 rounded-2xl text-center"
          style={{
            background: "linear-gradient(135deg, oklch(0.35 0.22 295) 0%, oklch(0.52 0.24 295) 100%)",
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "oklch(1 0 0 / 0.15)" }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-black text-white mb-2" style={nunito}>
            ¿No encontraste tu respuesta?
          </h3>
          <p className="text-white/75 font-semibold text-sm mb-6" style={nunito}>
            Nuestro equipo está listo para ayudarte con cualquier consulta sobre encargos o productos.
          </p>
          <Link href="/contacto">
            <Button
              className="rounded-full font-black border-0 hover:opacity-90 transition-opacity"
              style={{
                ...nunito,
                background: "white",
                color: "oklch(0.35 0.22 295)",
                boxShadow: "0 4px 16px oklch(0 0 0 / 0.15)",
              }}
            >
              Contáctanos
            </Button>
          </Link>
        </div>
      </div>
    </StoreLayout>
  );
}
