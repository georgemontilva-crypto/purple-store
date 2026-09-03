import { Link } from "wouter";
import { Instagram, Youtube, Heart, Palette } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Footer() {
  const { data: logoData } = trpc.content.get.useQuery({ key: "site_logo" });
  const { data: siteNameData } = trpc.content.get.useQuery({ key: "site_name" });
  const logoUrl = logoData?.value ?? "";
  const siteName = siteNameData?.value ?? "Guaiqui Avenue";
  return (
    <footer
      className="mt-16"
      style={{
        background: "linear-gradient(135deg, #3a1a63 0%, #2a1147 100%)",
      }}
    >
      <div className="container mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-11 w-auto object-contain" style={{ maxWidth: "120px" }} />
              ) : (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #ff39a0 0%, #944fdd 60%, #40c9e9 100%)" }}
                >
                  <Palette className="w-5 h-5 text-white" />
                </div>
              )}
              <span
                className="font-black text-xl text-white"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {siteName}
              </span>
            </div>
            <p
              className="text-sm leading-relaxed max-w-xs mb-6"
              style={{ color: "oklch(1 0 0 / 0.55)", fontFamily: "'Nunito', sans-serif" }}
            >
              Accesorios, maquillaje, arreglos florales y detalles bonitos para cada ocasión. Piezas seleccionadas con cariño y pedidos personalizados.
            </p>
            <div className="flex gap-2.5">
              {[
                { Icon: Instagram, label: "Instagram" },
                { Icon: Youtube, label: "YouTube" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: "oklch(1 0 0 / 0.10)",
                    border: "1px solid oklch(1 0 0 / 0.15)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "linear-gradient(135deg, #ff39a0 0%, #944fdd 60%, #40c9e9 100%)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "oklch(1 0 0 / 0.10)";
                  }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Tienda */}
          <div>
            <h4
              className="font-black text-white mb-4 text-xs uppercase tracking-widest"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Tienda
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/tienda", label: "Todos los cuadros" },
                { href: "/tienda", label: "Novedades" },
                { href: "/tienda", label: "Encargos" },
                { href: "/tienda", label: "Ofertas" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "oklch(1 0 0 / 0.55)", fontFamily: "'Nunito', sans-serif" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4
              className="font-black text-white mb-4 text-xs uppercase tracking-widest"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Información
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/sobre-nosotros", label: "Sobre nosotros" },
                { href: "/contacto", label: "Contacto" },
                { href: "/faqs", label: "Preguntas frecuentes" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "oklch(1 0 0 / 0.55)", fontFamily: "'Nunito', sans-serif" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid oklch(1 0 0 / 0.10)" }}
        >
          <p
            className="text-xs"
            style={{ color: "oklch(1 0 0 / 0.35)", fontFamily: "'Nunito', sans-serif" }}
          >
            © {new Date().getFullYear()} {siteName}. Todos los derechos reservados.
          </p>
          <p
            className="text-xs flex items-center gap-1"
            style={{ color: "oklch(1 0 0 / 0.35)", fontFamily: "'Nunito', sans-serif" }}
          >
            Hecho con{" "}
            <Heart
              className="w-3.5 h-3.5"
              style={{ color: "#c8a1ff", fill: "#c8a1ff" }}
            />{" "}
            para consentirte
          </p>
        </div>
      </div>
    </footer>
  );
}
