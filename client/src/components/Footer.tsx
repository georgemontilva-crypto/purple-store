import { Link } from "wouter";
import { Instagram, Facebook, Twitter, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background mt-24">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl gradient-purple flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span
                className="font-semibold text-xl text-background"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Purple Store
              </span>
            </div>
            <p className="text-background/60 text-sm leading-relaxed max-w-xs">
              Tu destino de moda y estilo. Descubre piezas únicas diseñadas para la mujer moderna y sofisticada.
            </p>
            <div className="flex gap-3 mt-6">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Icon className="w-4 h-4 text-background" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-background mb-4 text-sm uppercase tracking-wider">
              Tienda
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/tienda", label: "Todos los productos" },
                { href: "/tienda", label: "Novedades" },
                { href: "/tienda", label: "Ofertas" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-background/60 text-sm hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4 text-sm uppercase tracking-wider">
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
                    className="text-background/60 text-sm hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/40 text-sm">
            © {new Date().getFullYear()} Purple Store. Todos los derechos reservados.
          </p>
          <p className="text-background/40 text-sm flex items-center gap-1">
            Hecho con <Heart className="w-3.5 h-3.5 text-primary fill-primary" /> para ti
          </p>
        </div>
      </div>
    </footer>
  );
}
