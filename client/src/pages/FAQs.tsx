import StoreLayout from "@/components/StoreLayout";
import { trpc } from "@/lib/trpc";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function FAQs() {
  const { data: faqs = [], isLoading } = trpc.faqs.list.useQuery();
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <StoreLayout>
      {/* Hero */}
      <div className="gradient-purple-soft py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1
            className="text-5xl font-bold text-foreground mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Preguntas frecuentes
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Encuentra respuestas a las preguntas más comunes sobre nuestra tienda
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-20 max-w-3xl">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full gradient-purple-soft flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">No hay preguntas disponibles aún.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  openId === faq.id
                    ? "border-primary/30 shadow-purple bg-card"
                    : "border-border/50 bg-card hover:border-primary/20"
                }`}
              >
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-foreground pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200 ${
                      openId === faq.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openId === faq.id && (
                  <div className="px-5 pb-5">
                    <div className="w-full h-px bg-border/50 mb-4" />
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 p-8 rounded-2xl gradient-purple-soft border border-primary/20 text-center">
          <HelpCircle className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3
            className="text-xl font-bold text-foreground mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            ¿No encontraste tu respuesta?
          </h3>
          <p className="text-muted-foreground mb-6">
            Nuestro equipo está listo para ayudarte con cualquier consulta.
          </p>
          <Link href="/contacto">
            <Button className="rounded-full gradient-purple text-white border-0 shadow-purple">
              Contáctanos
            </Button>
          </Link>
        </div>
      </div>
    </StoreLayout>
  );
}
