import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, HelpCircle, GripVertical, X, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function FAQForm({ faq, onClose }: { faq?: any; onClose: () => void }) {
  const isEdit = !!faq;
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [sortOrder, setSortOrder] = useState(faq?.sortOrder ?? 0);
  const utils = trpc.useUtils();

  const createMutation = trpc.faqs.create.useMutation({
    onSuccess: () => { toast.success("FAQ creada"); utils.faqs.list.invalidate(); utils.faqs.adminList.invalidate(); onClose(); },
    onError: (err) => toast.error("Error", { description: err.message }),
  });

  const updateMutation = trpc.faqs.update.useMutation({
    onSuccess: () => { toast.success("FAQ actualizada"); utils.faqs.list.invalidate(); utils.faqs.adminList.invalidate(); onClose(); },
    onError: (err) => toast.error("Error", { description: err.message }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !answer) { toast.error("Pregunta y respuesta son requeridas"); return; }
    if (isEdit) updateMutation.mutate({ id: faq.id, question, answer, sortOrder: Number(sortOrder), active: faq.active });
    else createMutation.mutate({ question, answer, sortOrder: Number(sortOrder) });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: "#eae5f3" }}>
        <h3 className="font-semibold text-sm text-foreground">{isEdit ? "Editar pregunta" : "Nueva pregunta frecuente"}</h3>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pregunta *</label>
          <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="¿Cuál es el tiempo de entrega?" className="rounded-xl" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Respuesta *</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="El tiempo de entrega es de 7 a 14 días hábiles..."
            rows={4}
            required
            className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
            style={{ borderColor: "#dcd2ee" }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Orden de aparición</label>
          <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} className="rounded-xl w-24" />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} className="rounded-xl gap-2"><X className="w-4 h-4" /> Cancelar</Button>
        <Button type="submit" disabled={isPending} className="rounded-xl gradient-purple text-white border-0 shadow-purple">
          {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear FAQ"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminFAQs() {
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data: faqs = [], isLoading } = trpc.faqs.adminList.useQuery();

  const deleteMutation = trpc.faqs.delete.useMutation({
    onSuccess: () => { toast.success("FAQ eliminada"); utils.faqs.list.invalidate(); utils.faqs.adminList.invalidate(); },
    onError: (err) => toast.error("Error al eliminar", { description: err.message }),
  });

  const toggleMutation = trpc.faqs.update.useMutation({
    onSuccess: () => { utils.faqs.list.invalidate(); utils.faqs.adminList.invalidate(); },
  });

  if (showForm) {
    return (
      <AdminLayout title={editingFaq ? "Editar FAQ" : "Nueva FAQ"}>
        <FAQForm faq={editingFaq} onClose={() => { setShowForm(false); setEditingFaq(null); }} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Preguntas frecuentes</h2>
            <p className="text-sm text-muted-foreground">{faqs.length} pregunta{faqs.length !== 1 ? "s" : ""} configurada{faqs.length !== 1 ? "s" : ""}</p>
          </div>
          <Button onClick={() => { setEditingFaq(null); setShowForm(true); }} className="rounded-xl gradient-purple text-white border-0 shadow-purple hover:opacity-90 gap-2 font-semibold">
            <Plus className="w-4 h-4" /> Nueva pregunta
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : faqs.length === 0 ? (
          <div className="bg-white rounded-2xl border py-16 text-center" style={{ borderColor: "#eae5f3" }}>
            <HelpCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold text-foreground">No hay preguntas frecuentes</p>
            <p className="text-sm text-muted-foreground mt-1">Agrega preguntas para ayudar a tus clientes</p>
            <Button onClick={() => { setEditingFaq(null); setShowForm(true); }} className="mt-4 rounded-xl gradient-purple text-white border-0 shadow-purple gap-2">
              <Plus className="w-4 h-4" /> Crear primera FAQ
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-sm ${!faq.active ? "opacity-60" : ""}`}
                style={{ borderColor: faq.active ? "#eae5f3" : "#dfdce4" }}
              >
                <div className="flex items-start gap-3 p-4">
                  <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                    <GripVertical className="w-4 h-4 text-muted-foreground/30" />
                    <span className="text-xs font-bold text-muted-foreground/40 w-5 text-center">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{faq.question}</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggleMutation.mutate({ id: faq.id, question: faq.question, answer: faq.answer, active: !faq.active, sortOrder: faq.sortOrder })}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                        faq.active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {faq.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {faq.active ? "Activa" : "Inactiva"}
                    </button>
                    <button
                      onClick={() => { setEditingFaq(faq); setShowForm(true); }}
                      className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => { if (confirm("¿Eliminar esta FAQ?")) deleteMutation.mutate({ id: faq.id }); }}
                      className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
