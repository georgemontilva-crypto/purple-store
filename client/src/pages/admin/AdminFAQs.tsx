import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Trash2, HelpCircle, GripVertical } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface FAQFormProps {
  faq?: any;
  onClose: () => void;
}

function FAQForm({ faq, onClose }: FAQFormProps) {
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

  return (
    <div className="max-w-lg">
      <h3 className="font-semibold text-lg text-foreground mb-5">{isEdit ? "Editar pregunta" : "Nueva pregunta"}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Pregunta <span className="text-rose-500">*</span></label>
          <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="¿Cuál es el tiempo de entrega?" className="rounded-xl" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Respuesta <span className="text-rose-500">*</span></label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="El tiempo de entrega es de..."
            rows={4}
            required
            className="w-full px-3 py-2.5 rounded-xl border border-border/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground placeholder:text-muted-foreground text-sm resize-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Orden</label>
          <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} className="rounded-xl w-24" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1 rounded-xl gradient-purple text-white border-0 shadow-purple" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear FAQ"}
          </Button>
          <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </div>
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
    <AdminLayout title="Preguntas frecuentes (FAQs)">
      <div className="space-y-5">
        <div className="flex justify-end">
          <Button onClick={() => { setEditingFaq(null); setShowForm(true); }} className="rounded-xl gradient-purple text-white border-0 shadow-purple gap-2">
            <Plus className="w-4 h-4" />Nueva pregunta
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : faqs.length === 0 ? (
          <div className="py-16 text-center">
            <HelpCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground">No hay FAQs aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className={`bg-card rounded-2xl border overflow-hidden transition-all ${faq.active ? "border-border/50" : "border-border/30 opacity-60"}`}>
                <div className="flex items-start gap-3 p-4">
                  <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{faq.question}</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleMutation.mutate({ id: faq.id, question: faq.question, answer: faq.answer, active: !faq.active, sortOrder: faq.sortOrder })}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${faq.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      {faq.active ? "Activa" : "Inactiva"}
                    </button>
                    <button onClick={() => { setEditingFaq(faq); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-primary">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm("¿Eliminar esta FAQ?")) deleteMutation.mutate({ id: faq.id }); }} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
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
