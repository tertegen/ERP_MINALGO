"use client";

import { useEffect, useState } from "react";

type Cliente = { id: string; nombre: string };
type PipelineItem = {
  id: string;
  descripcion: string;
  montoEstimado: number | null;
  moneda: string;
  probabilidad: number | null;
  etapa: string;
  fechaEstimada: string | null;
  notas: string | null;
  cliente: { id: string; nombre: string };
  _count: { actividades: number };
};

const ETAPAS = [
  { key: "CONTACTO_INICIAL", label: "Contacto inicial", color: "border-blue-400 bg-blue-50" },
  { key: "PROPUESTA_ENVIADA", label: "Propuesta enviada", color: "border-amber-400 bg-amber-50" },
  { key: "NEGOCIACION", label: "Negociación", color: "border-purple-400 bg-purple-50" },
  { key: "GANADO", label: "Ganado", color: "border-emerald-400 bg-emerald-50" },
  { key: "PERDIDO", label: "Perdido", color: "border-red-400 bg-red-50" },
];

const etapaLabel: Record<string, string> = Object.fromEntries(ETAPAS.map((e) => [e.key, e.label]));

const empty = {
  clienteId: "",
  descripcion: "",
  montoEstimado: "",
  moneda: "DOLARES",
  probabilidad: "",
  etapa: "CONTACTO_INICIAL",
  fechaEstimada: "",
  notas: "",
};

function fmt(n: number, moneda: string) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: moneda === "DOLARES" ? "USD" : "PEN",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function PipelinePage() {
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [moviendo, setMoviendo] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      fetch("/api/pipeline").then((r) => r.json()),
      fetch("/api/clientes").then((r) => r.json()),
    ]);
    setItems(p);
    setClientes(c);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Error al guardar");
      return;
    }
    setModal(false);
    setForm(empty);
    fetchAll();
  };

  const moverEtapa = async (id: string, etapa: string) => {
    setMoviendo(id);
    await fetch(`/api/pipeline/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ etapa }),
    });
    setMoviendo(null);
    fetchAll();
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta oportunidad?")) return;
    await fetch(`/api/pipeline/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const valorTotal = items
    .filter((i) => !["GANADO", "PERDIDO"].includes(i.etapa))
    .reduce((a, i) => a + (i.montoEstimado ? Number(i.montoEstimado) * ((i.probabilidad ?? 100) / 100) : 0), 0);

  const ganados = items.filter((i) => i.etapa === "GANADO");
  const valorGanado = ganados.reduce((a, i) => a + (i.montoEstimado ? Number(i.montoEstimado) : 0), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.filter((i) => !["GANADO", "PERDIDO"].includes(i.etapa)).length} oportunidades activas
          </p>
        </div>
        <button
          onClick={() => { setModal(true); setForm(empty); setError(""); }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nueva oportunidad
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Valor ponderado activo</p>
          <p className="text-xl font-semibold text-gray-900">{fmt(valorTotal, "DOLARES")}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Ganados</p>
          <p className="text-xl font-semibold text-emerald-600">{ganados.length} — {fmt(valorGanado, "DOLARES")}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Perdidos</p>
          <p className="text-xl font-semibold text-red-500">{items.filter((i) => i.etapa === "PERDIDO").length}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm text-gray-400">Cargando pipeline...</div>
      ) : (
        <div className="grid grid-cols-5 gap-4 min-h-[400px]">
          {ETAPAS.map(({ key, label, color }) => {
            const col = items.filter((i) => i.etapa === key);
            return (
              <div key={key} className={`rounded-xl border-t-2 bg-gray-50 ${color} p-3`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">{label}</h3>
                  <span className="text-xs bg-white border border-gray-200 text-gray-600 rounded-full px-1.5 py-0.5 font-medium">
                    {col.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {col.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                      <p className="text-xs font-medium text-blue-700 mb-0.5">{item.cliente.nombre}</p>
                      <p className="text-xs text-gray-700 mb-2 leading-snug">{item.descripcion}</p>
                      {item.montoEstimado && (
                        <p className="text-xs font-semibold text-gray-900 mb-1">
                          {fmt(Number(item.montoEstimado), item.moneda)}
                          {item.probabilidad && (
                            <span className="ml-1 text-gray-400 font-normal">({item.probabilidad}%)</span>
                          )}
                        </p>
                      )}
                      {item.fechaEstimada && (
                        <p className="text-xs text-gray-400 mb-2">
                          {new Date(item.fechaEstimada).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                        </p>
                      )}
                      <div className="flex gap-1 flex-wrap">
                        {ETAPAS.filter((e) => e.key !== key).map((e) => (
                          <button
                            key={e.key}
                            onClick={() => moverEtapa(item.id, e.key)}
                            disabled={moviendo === item.id}
                            className="text-[10px] px-1.5 py-0.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40"
                          >
                            → {etapaLabel[e.key].split(" ")[0]}
                          </button>
                        ))}
                        <button
                          onClick={() => eliminar(item.id)}
                          className="text-[10px] px-1.5 py-0.5 border border-red-200 rounded text-red-400 hover:bg-red-50 transition-colors ml-auto"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  {col.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Sin oportunidades</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-base font-semibold text-gray-900">Nueva oportunidad</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cliente *</label>
                <select
                  required
                  value={form.clienteId}
                  onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Descripción *</label>
                <input
                  type="text"
                  required
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Levantamiento topográfico Zona Norte"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Monto estimado</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.montoEstimado}
                    onChange={(e) => setForm({ ...form, montoEstimado: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Moneda</label>
                  <select
                    value={form.moneda}
                    onChange={(e) => setForm({ ...form, moneda: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DOLARES">Dólares (USD)</option>
                    <option value="SOLES">Soles (PEN)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Probabilidad (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.probabilidad}
                    onChange={(e) => setForm({ ...form, probabilidad: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fecha estimada</label>
                  <input
                    type="date"
                    value={form.fechaEstimada}
                    onChange={(e) => setForm({ ...form, fechaEstimada: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Etapa inicial</label>
                <select
                  value={form.etapa}
                  onChange={(e) => setForm({ ...form, etapa: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ETAPAS.map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
