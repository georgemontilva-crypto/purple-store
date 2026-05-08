import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { MessageSquare, Mail, Calendar, Eye } from "lucide-react";
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

  return (
    <AdminLayout title="Mensajes de contacto">
      <div className="grid lg:grid-cols-5 gap-5 h-[calc(100vh-8rem)]">
        {/* List */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Mensajes ({messages.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="p-4"><div className="h-12 bg-muted rounded-lg animate-pulse" /></div>)
            ) : messages.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No hay mensajes</p>
              </div>
            ) : (
              messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelectedId(msg.id);
                    if (!msg.read) markReadMutation.mutate({ id: msg.id });
                  }}
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${selectedId === msg.id ? "bg-accent" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!msg.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                        <p className={`text-sm truncate ${!msg.read ? "font-semibold text-foreground" : "text-foreground"}`}>{msg.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.subject || msg.message}</p>
                    </div>
                    <p className="text-xs text-muted-foreground flex-shrink-0">{new Date(msg.createdAt).toLocaleDateString("es")}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border/50 overflow-hidden flex flex-col">
          {selected ? (
            <>
              <div className="p-5 border-b border-border">
                <h3 className="font-semibold text-foreground">{selected.subject || "Sin asunto"}</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{selected.name} &lt;{selected.email}&gt;</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(selected.createdAt).toLocaleString("es")}</span>
                </div>
              </div>
              <div className="flex-1 p-5 overflow-y-auto">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div className="p-4 border-t border-border">
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
                <Eye className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Selecciona un mensaje para verlo</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
