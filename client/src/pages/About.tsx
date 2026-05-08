import StoreLayout from "@/components/StoreLayout";
import { trpc } from "@/lib/trpc";
import { Heart, Star, Users, Award } from "lucide-react";

export default function About() {
  const { data: title } = trpc.content.get.useQuery({ key: "about_title" });
  const { data: subtitle } = trpc.content.get.useQuery({ key: "about_subtitle" });
  const { data: body } = trpc.content.get.useQuery({ key: "about_body" });
  const { data: mission } = trpc.content.get.useQuery({ key: "about_mission" });
  const { data: vision } = trpc.content.get.useQuery({ key: "about_vision" });
  const { data: image1 } = trpc.content.get.useQuery({ key: "about_image" });
  const { data: image2 } = trpc.content.get.useQuery({ key: "about_image2" });

  const stats = [
    { icon: Users, value: "2,500+", label: "Clientas felices" },
    { icon: Star, value: "4.9", label: "Calificación promedio" },
    { icon: Award, value: "5+", label: "Años de experiencia" },
    { icon: Heart, value: "100%", label: "Satisfacción garantizada" },
  ];

  return (
    <StoreLayout>
      {/* Hero */}
      <div className="gradient-purple-soft py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1
            className="text-5xl lg:text-6xl font-bold text-foreground mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title?.value ?? "Sobre nosotras"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {subtitle?.value ?? "Descubre la historia detrás de Purple Store y nuestra pasión por la moda femenina"}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
              {body?.value ??
                "Somos una tienda apasionada por la moda femenina, fundada con el sueño de ofrecer piezas únicas y de calidad para cada mujer.\n\nCreemos que la moda es una forma de expresión personal, y cada pieza que seleccionamos está pensada para hacerte sentir segura, elegante y auténtica.\n\nNuestro equipo trabaja incansablemente para traerte las últimas tendencias combinadas con estilos atemporales que nunca pasan de moda."}
            </p>
          </div>
          <div className="relative">
            {image1?.value ? (
              <img
                src={image1.value}
                alt="Sobre nosotros"
                className="w-full aspect-square object-cover rounded-3xl shadow-purple-lg"
              />
            ) : (
              <div className="w-full aspect-square rounded-3xl gradient-purple-soft flex items-center justify-center shadow-purple-lg">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full gradient-purple mx-auto flex items-center justify-center shadow-purple mb-4">
                    <Heart className="w-10 h-10 text-white fill-white" />
                  </div>
                  <p className="text-primary font-semibold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Con amor
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-purple transition-all"
            >
              <div className="w-12 h-12 rounded-2xl gradient-purple-soft flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl gradient-purple-soft border border-primary/20">
            <h3 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Nuestra misión
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {mission?.value ??
                "Ofrecer moda femenina de calidad que empodere a cada mujer a expresar su estilo único, con piezas cuidadosamente seleccionadas que combinan elegancia, comodidad y tendencia."}
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-card border border-border/50">
            <h3 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Nuestra visión
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {vision?.value ??
                "Ser la tienda de moda femenina de referencia, reconocida por nuestra curaduría excepcional, servicio personalizado y compromiso con la satisfacción de cada clienta."}
            </p>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
