import StoreLayout from "@/components/StoreLayout";
import { trpc } from "@/lib/trpc";
import { Heart, Star, Users, Award, Palette, Brush, Sparkles } from "lucide-react";

export default function About() {
  const { data: title } = trpc.content.get.useQuery({ key: "about_title" });
  const { data: subtitle } = trpc.content.get.useQuery({ key: "about_subtitle" });
  const { data: body } = trpc.content.get.useQuery({ key: "about_body" });
  const { data: mission } = trpc.content.get.useQuery({ key: "about_mission" });
  const { data: vision } = trpc.content.get.useQuery({ key: "about_vision" });
  const { data: image1 } = trpc.content.get.useQuery({ key: "about_image" });

  const nunito = { fontFamily: "'Nunito', sans-serif" };

  const stats = [
    { icon: Users, value: "+200", label: "Cuadros vendidos" },
    { icon: Star, value: "5.0", label: "Calificación promedio" },
    { icon: Award, value: "100%", label: "Hecho a mano" },
    { icon: Heart, value: "∞", label: "Amor por el anime" },
  ];

  return (
    <StoreLayout>
      {/* Hero banner */}
      <div className="px-4 lg:px-8 pt-4 pb-2">
        <div
          className="rounded-2xl px-5 py-8 md:px-8 md:py-14 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, oklch(0.35 0.22 295) 0%, oklch(0.52 0.24 295) 55%, oklch(0.72 0.18 295) 100%)",
          }}
        >
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-20"
            style={{ background: "oklch(0.88 0.10 295)" }} />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full blur-2xl opacity-15"
            style={{ background: "oklch(0.95 0.06 295)" }} />
          <div className="absolute top-6 right-24 w-10 h-10 rounded-full border-2 border-white/20" />
          <div className="absolute top-12 right-40 w-5 h-5 rounded-full border border-white/15" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-black"
              style={{ background: "oklch(1 0 0 / 0.15)", color: "white", border: "1px solid oklch(1 0 0 / 0.25)" }}
            >
              <Palette className="w-3.5 h-3.5" />
              Arte original · Con alma
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-3" style={nunito}>
              {title?.value ?? "Sobre Nosotros"}
            </h1>
            <p className="text-white/75 text-base leading-relaxed font-semibold" style={nunito}>
              {subtitle?.value ?? "Conoce la historia detrás de BoraHae Art y nuestra pasión por el arte anime hecho a mano"}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-14">
        {/* Story section */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-10 md:mb-14">
          <div className="space-y-5">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black"
              style={{ background: "oklch(0.92 0.06 295)", color: "oklch(0.35 0.22 295)", fontFamily: "'Nunito', sans-serif" }}
            >
              <Brush className="w-3.5 h-3.5" />
              Nuestra historia
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground leading-tight" style={nunito}>
              Arte anime pintado con amor
            </h2>
            <p className="text-muted-foreground leading-relaxed font-semibold whitespace-pre-line" style={nunito}>
              {body?.value ??
                "Somos un pequeño estudio de arte especializado en cuadros de anime y personajes favoritos, pintados completamente a mano con materiales de alta calidad.\n\nCada cuadro es una pieza única e irrepetible. Manejamos stock disponible para entrega inmediata y también realizamos encargos personalizados para que tengas exactamente el arte que sueñas.\n\nNuestro proceso combina técnica, pasión y un profundo amor por la cultura anime. Cada pincelada lleva nuestra dedicación y cariño por este arte."}
            </p>
          </div>

          <div className="relative">
            {image1?.value ? (
              <img
                src={image1.value}
                alt="Sobre BoraHae Art"
                className="w-full aspect-square object-cover rounded-3xl"
                style={{ boxShadow: "0 20px 60px oklch(0.42 0.24 295 / 0.25)" }}
              />
            ) : (
              <div
                className="w-full aspect-square rounded-3xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, oklch(0.92 0.06 295) 0%, oklch(0.78 0.14 295) 100%)",
                  boxShadow: "0 20px 60px oklch(0.42 0.24 295 / 0.20)",
                }}
              >
                <div className="text-center">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)" }}
                  >
                    <Palette className="w-12 h-12 text-white" />
                  </div>
                  <p className="font-black text-xl" style={{ color: "oklch(0.35 0.22 295)", fontFamily: "'Nunito', sans-serif" }}>
                    BoraHae Art
                  </p>
                  <p className="text-sm font-semibold mt-1" style={{ color: "oklch(0.55 0.14 295)", fontFamily: "'Nunito', sans-serif" }}>
                    Arte hecho a mano
                  </p>
                </div>
              </div>
            )}
            {/* Floating badge */}
            <div
              className="absolute -bottom-4 -left-4 px-4 py-3 rounded-2xl"
              style={{
                background: "white",
                boxShadow: "0 8px 32px oklch(0.42 0.24 295 / 0.20)",
                border: "1px solid oklch(0.91 0.04 295)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, oklch(0.42 0.24 295) 0%, oklch(0.62 0.22 295) 100%)" }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-black text-foreground text-sm" style={nunito}>Encargos abiertos</p>
                  <p className="text-xs font-semibold text-muted-foreground" style={nunito}>7-14 días de entrega</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-2xl transition-all hover:-translate-y-1"
              style={{
                background: "oklch(0.98 0.008 295)",
                border: "1.5px solid oklch(0.91 0.04 295)",
                boxShadow: "0 2px 12px oklch(0.42 0.24 295 / 0.05)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px oklch(0.42 0.24 295 / 0.15)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(0.72 0.18 295 / 0.5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px oklch(0.42 0.24 295 / 0.05)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(0.91 0.04 295)";
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "linear-gradient(135deg, oklch(0.92 0.06 295) 0%, oklch(0.78 0.14 295) 100%)" }}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl font-black mb-1" style={{ ...nunito, color: "oklch(0.35 0.22 295)" }}>
                {stat.value}
              </p>
              <p className="text-xs font-bold text-muted-foreground" style={nunito}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div
            className="p-8 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, oklch(0.35 0.22 295) 0%, oklch(0.52 0.24 295) 100%)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "oklch(1 0 0 / 0.15)" }}
            >
              <Brush className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-black text-white mb-3" style={nunito}>Nuestra misión</h3>
            <p className="text-white/75 leading-relaxed font-semibold text-sm" style={nunito}>
              {mission?.value ??
                "Crear arte anime auténtico y de alta calidad, pintado a mano con amor, que conecte emocionalmente a los fans con sus personajes favoritos a través de piezas únicas e irrepetibles."}
            </p>
          </div>
          <div
            className="p-8 rounded-2xl"
            style={{
              background: "oklch(0.98 0.008 295)",
              border: "1.5px solid oklch(0.91 0.04 295)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(135deg, oklch(0.92 0.06 295) 0%, oklch(0.78 0.14 295) 100%)" }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-3" style={nunito}>Nuestra visión</h3>
            <p className="text-muted-foreground leading-relaxed font-semibold text-sm" style={nunito}>
              {vision?.value ??
                "Ser el estudio de arte anime de referencia, reconocido por la calidad artesanal de cada pieza, la personalización de encargos y el amor genuino por la cultura anime."}
            </p>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
