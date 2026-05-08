import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Users, Search, Shield, User, Mail, Calendar } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.customers.list.useQuery({ page, limit: 20 });

  const allCustomers = data?.users ?? [];
  const customers = search
    ? allCustomers.filter(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.email?.toLowerCase().includes(search.toLowerCase())
      )
    : allCustomers;
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout>
      <div className="space-y-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Clientes</h2>
            <p className="text-sm text-muted-foreground">{total} cliente{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border p-4" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 rounded-xl border-border/60 bg-muted/30 focus:bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold text-foreground">No hay clientes</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? "Prueba con otro término de búsqueda" : "Los clientes aparecerán aquí cuando se registren"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "oklch(0.93 0.02 295)", background: "oklch(0.98 0.01 295)" }}>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Cliente</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Registrado</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Rol</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "oklch(0.95 0.01 295)" }}>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full gradient-purple flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-purple">
                            {customer.name?.[0]?.toUpperCase() ?? "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{customer.name ?? "Sin nombre"}</p>
                            <p className="text-xs text-muted-foreground md:hidden truncate">{customer.email ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <a href={`mailto:${customer.email}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{customer.email ?? "—"}</span>
                        </a>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          {new Date(customer.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          customer.role === "admin"
                            ? "bg-violet-50 text-violet-700 border-violet-200"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}>
                          {customer.role === "admin" ? (
                            <><Shield className="w-3 h-3" /> Admin</>
                          ) : (
                            <><User className="w-3 h-3" /> Usuario</>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "oklch(0.93 0.02 295)" }}>
              <p className="text-xs text-muted-foreground">Página {page} de {totalPages} · {total} clientes</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl text-xs">Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl text-xs">Siguiente</Button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 rounded-2xl border" style={{ background: "oklch(0.97 0.01 295)", borderColor: "oklch(0.93 0.02 295)" }}>
          <p className="text-xs text-muted-foreground">
            💡 Para cambiar el rol de un usuario a administrador, usa el panel de base de datos (Database) en el menú de Manus.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
