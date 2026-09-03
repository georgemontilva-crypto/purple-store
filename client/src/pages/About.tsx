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
    { icon: Heart, value: "∞", label: "Amor por los detalles" },
  ];

  return (
    <StoreLayout>
      {/* Hero banner */}
      <div className="px-4 lg:px-8 pt-4 pb-2">
        <div
          className="rounded-2xl px-5 py-8 md:px-8 md:py-14 relative overflow-hidden"
          style={{
            background: "linear-gradient(125deg, #7331bd 0%, #944fdd 40%, #ff39a0 72%, #40c9e9 100%)",
          }}
        >
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-20"
            style={{ background: "#e3c8ff" }} />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full blur-2xl opacity-15"
            style={{ background: "#f6e6ff" }} />
          <div className="absolute top-6 right-24 w-10 h-10 rounded-full border-2 border-white/20" />
          <div className="absolute top-12 right-40 w-5 h-5 rounded-full border border-white/15" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-black"
              style={{ background: "oklch(1 0 0 / 0.15)", color: "white", border: "1px solid oklch(1 0 0 / 0.25)" }}
            >
              <Palette className="w-3.5 h-3.5" />
              Elegido con cariño
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-3" style={nunito}>
              {title?.value ?? "Sobre Nosotros"}
            </h1>
            <p className="text-white/75 text-base leading-relaxed font-semibold" style={nunito}>
              {subtitle?.value ?? "Conoce la historia detrás de Guaiqui Avenue y nuestra pasión por los detalles bonitos"}
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
              style={{ background: "#f0e4fd", color: "#6400aa", fontFamily: "'Nunito', sans-serif" }}
            >
              <Brush className="w-3.5 h-3.5" />
              Nuestra historia
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground leading-tight" style={nunito}>
              Detalles elegidos con amor
            </h2>
            <p className="text-muted-foreground leading-relaxed font-semibold whitespace-pre-line" style={nunito}>
              {body?.value ??
                "Somos una tienda de accesorios, maquillaje, arreglos florales y cositas lindas para regalar o consentirte.\n\nElegimos cada producto a mano, pensando en calidad y en que se vea bonito. Manejamos stock disponible para entrega inmediata y también armamos pedidos y arreglos personalizados para la ocasión que necesites.\n\nNuestro fuerte son los detalles: el empaque, la presentación y la atención cercana. Queremos que cada compra se sienta como un regalo."}
            </p>
          </div>

          <div className="relative">
            {image1?.value ? (
              <img
                src={image1.value}
                alt="Sobre Guaiqui Avenue"
                className="w-full aspect-square object-cover rounded-3xl"
                style={{ boxShadow: "0 20px 60px rgb(122 22 202 / 0.25)" }}
              />
            ) : (
              <div
                className="w-full aspect-square rounded-3xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #f6effe 0%, #d6f4f2 100%)",
                  boxShadow: "0 20px 60px rgb(122 22 202 / 0.20)",
                }}
              >
                <div className="text-center">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "linear-gradient(135deg, #944fdd 0%, #ff39a0 100%)" }}
                  >
                    <Palette className="w-12 h-12 text-white" />
                  </div>
                  <p className="font-black text-xl" style={{ color: "#6400aa", fontFamily: "'Nunito', sans-serif" }}>
                    Guaiqui Avenue
                  </p>
                  <p className="text-sm font-semibold mt-1" style={{ color: "#815ab5", fontFamily: "'Nunito', sans-serif" }}>
                    Elegido a mano
                  </p>
                </div>
              </div>
            )}
            {/* Floating badge */}
            <div
              className="absolute -bottom-4 -left-4 px-4 py-3 rounded-2xl"
              style={{
                background: "white",
                boxShadow: "0 8px 32px rgb(122 22 202 / 0.20)",
                border: "1px solid #e6dcf8",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #944fdd 0%, #ff39a0 100%)" }}
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
                background: "#f9f7fd",
                border: "1.5px solid #e6dcf8",
                boxShadow: "0 2px 12px rgb(122 22 202 / 0.05)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgb(122 22 202 / 0.15)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgb(186 133 255 / 0.5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgb(122 22 202 / 0.05)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "#e6dcf8";
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "linear-gradient(135deg, #f6effe 0%, #d6f4f2 100%)" }}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl font-black mb-1" style={{ ...nunito, color: "#6400aa" }}>
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
              background: "linear-gradient(135deg, #6400aa 0%, #862bd8 100%)",
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
                "Ofrecer accesorios, belleza y arreglos florales de calidad, con una atención cercana y una presentación cuidada, para que cada detalle que compres se sienta especial."}
            </p>
          </div>
          <div
            className="p-8 rounded-2xl"
            style={{
              background: "#f9f7fd",
              border: "1.5px solid #e6dcf8",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(135deg, #f6effe 0%, #d6f4f2 100%)" }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-3" style={nunito}>Nuestra visión</h3>
            <p className="text-muted-foreground leading-relaxed font-semibold text-sm" style={nunito}>
              {vision?.value ??
                "Ser la tienda de referencia para accesorios, belleza y detalles, reconocida por la calidad de la selección, los pedidos personalizados y el cariño con que atendemos a cada cliente."}
            </p>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
