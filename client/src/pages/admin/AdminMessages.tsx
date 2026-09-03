import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { MessageSquare, Mail, Calendar, Inbox } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminMessages() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: contactData, isLoading } = trpc.contact.list.useQuery();
  const messages = contactData?.messages ?? [];
  const utils = trpc.useUtils();

  const markReadMutation = trpc.contact.markRead.useMutation({
    onSuccess: () => utils.contact.list.invalidate(),
  });

  const selected = messages.find((m: any) => m.id === selectedId);
  const unreadCount = messages.filter((m: any) => !m.read).length;

  return (
    <AdminLayout>
      <div className="space-y-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Mensajes de contacto</h2>
            <p className="text-sm text-muted-foreground">
              {messages.length} mensaje{messages.length !== 1 ? "s" : ""}
              {unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                  {unreadCount} sin leer
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-4" style={{ minHeight: "calc(100vh - 14rem)" }}>
          {/* Message List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border overflow-hidden flex flex-col" style={{ borderColor: "#eae5f3" }}>
            <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "#eae5f3", background: "#f9f7fe" }}>
              <Inbox className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">Bandeja de entrada</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "#efedf4" }}>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2 w-3/4" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                ))
              ) : messages.length === 0 ? (
                <div className="p-10 text-center">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-semibold text-foreground text-sm">No hay mensajes</p>
                  <p className="text-xs text-muted-foreground mt-1">Los mensajes del formulario de contacto apareceran aqui</p>
                </div>
              ) : (
                messages.map((msg: any) => (
                  <button
                    key={msg.id}
                    onClick={() => {
                      setSelectedId(msg.id);
                      if (!msg.read) markReadMutation.mutate({ id: msg.id });
                    }}
                    className={`w-full text-left px-4 py-3 transition-colors ${selectedId === msg.id ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/40"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {!msg.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                          <p className={`text-sm truncate ${!msg.read ? "font-bold text-foreground" : "font-medium text-foreground"}`}>{msg.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.subject || msg.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground flex-shrink-0 mt-0.5">
                        {new Date(msg.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-3 bg-white rounded-2xl border overflow-hidden flex flex-col" style={{ borderColor: "#eae5f3" }}>
            {selected ? (
              <>
                <div className="px-5 py-4 border-b" style={{ borderColor: "#eae5f3" }}>
                  <h3 className="font-bold text-foreground">{selected.subject || "Sin asunto"}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <strong className="text-foreground">{selected.name}</strong>
                      &lt;{selected.email}&gt;
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(selected.createdAt).toLocaleString("es-CO", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-5 overflow-y-auto">
                  <div className="bg-muted/30 rounded-2xl p-4">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                  </div>
                </div>
                <div className="px-5 py-4 border-t" style={{ borderColor: "#eae5f3" }}>
                  <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Tu mensaje"}`}>
                    <Button className="rounded-xl gradient-purple text-white border-0 shadow-purple gap-2">
                      <Mail className="w-4 h-4" />
                      Responder por email
                    </Button>
                  </a>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#f2eaff" }}>
                    <MessageSquare className="w-8 h-8 text-primary/40" />
                  </div>
                  <p className="font-semibold text-foreground">Selecciona un mensaje</p>
                  <p className="text-sm text-muted-foreground mt-1">Haz clic en un mensaje de la lista para leerlo</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
