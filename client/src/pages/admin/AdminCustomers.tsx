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
    <AdminLayout title="Users" subtitle={`${total} registered user${total !== 1 ? "s" : ""}`}>
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 border-gray-200 bg-white text-sm"
          />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">USER</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">EMAIL</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">JOINED</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">ROLE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-guaiqui-purple-100 flex items-center justify-center text-guaiqui-purple-dark text-sm font-bold flex-shrink-0">
                            {customer.name?.[0]?.toUpperCase() ?? "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{customer.name ?? "Sin nombre"}</p>
                            <p className="text-xs text-gray-400 md:hidden truncate">{customer.email ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 hidden md:table-cell">
                        <a href={`mailto:${customer.email}`} className="text-sm text-gray-500 hover:text-guaiqui-purple transition-colors">
                          {customer.email ?? "—"}
                        </a>
                      </td>
                      <td className="px-6 py-3.5 hidden sm:table-cell">
                        <span className="text-sm text-gray-500">
                          {new Date(customer.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          customer.role === "admin"
                            ? "bg-guaiqui-purple-50 text-guaiqui-purple-dark"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {customer.role === "admin" ? (
                            <><Shield className="w-3 h-3" /> admin</>
                          ) : (
                            <><User className="w-3 h-3" /> user</>
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
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Página {page} de {totalPages} · {total} clientes</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="text-xs">Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-xs">Siguiente</Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400">
          Para cambiar el rol de un usuario a administrador, usa el panel de base de datos en el menú de Manus.
        </p>
      </div>
    </AdminLayout>
  );
}
