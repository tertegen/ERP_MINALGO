"use client";

import { useEffect, useState } from "react";

type Evento = {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: string;
  fechaInicio: string;
  fechaFin: string | null;
  lugar: string | null;
};

const TIPOS = ["REUNION", "VISITA_CAMPO", "CONFERENCIA", "CAPACITACION", "OTRO"];

const tipoLabel: Record<string, string> = {
  REUNION: "Reunión",
  VISITA_CAMPO: "Visita de campo",
  CONFERENCIA: "Conferencia",
  CAPACITACION: "Capacitación",
  OTRO: "Otro",
};

const tipoColor: Record<string, string> = {
  REUNION: "bg-blue-100 text-blue-700",
  VISITA_CAMPO: "bg-emerald-100 text-emerald-700",
  CONFERENCIA: "bg-purple-100 text-purple-700",
  CAPACITACION: "bg-amber-100 text-amber-700",
  OTRO: "bg-gray-100 text-gray-600",
};

const empty = { titulo: "", descripcion: "", tipo: "REUNION", fechaInicio: "", fechaFin: "", lugar: "" };

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("es-PE", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function isPast(d: string) {
  return new Date(d) < new Date();
}

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"proximos" | "pasados" | "todos">("proximos");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchEventos = async () => {
    setLoading(true);
    const data = await fetch("/api/calendario").then((r) => r.json());
    setEventos(data);
    setLoading(false);
  };

  useEffect(() => { fetchEventos(); }, []);

  const filtrados = eventos.filter((e) => {
    if (filtro === "proximos") return !isPast(e.fechaInicio);
    if (filtro === "pasados") return isPast(e.fechaInicio);
    return true;
  });

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/calendario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Error"); return; }
    setModal(false);
    setForm(empty);
    fetchEventos();
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar este evento?")) return;
    await fetch(`/api/calendario/${id}`, { method: "DELETE" });
    fetchEventos();
  };

  const proximos = eventos.filter((e) => !isPast(e.fechaInicio)).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Calendario</h1>
          <p className="text-sm text-gray-500 mt-1">
            {proximos} evento{proximos !== 1 ? "s" : ""} próximo{proximos !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => { setModal(true); setForm(empty); setError(""); }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo evento
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5">
        {([["proximos", "Próximos"], ["pasados", "Pasados"], ["todos", "Todos"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFiltro(key)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              filtro === key
                ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm text-gray-400">Cargando...</div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">
          No hay eventos {filtro === "proximos" ? "próximos" : filtro === "pasados" ? "pasados" : ""}.
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((ev) => (
            <div
              key={ev.id}
              className={`bg-white border rounded-xl p-4 flex items-start gap-4 transition-opacity ${isPast(ev.fechaInicio) ? "opacity-60" : ""}`}
            >
              <div className="flex-shrink-0 w-14 text-center bg-gray-50 border border-gray-200 rounded-lg py-2">
                <p className="text-xs text-gray-500">
                  {new Date(ev.fechaInicio).toLocaleDateString("es-PE", { month: "short" }).toUpperCase()}
                </p>
                <p className="text-2xl font-bold text-gray-900 leading-none">
                  {new Date(ev.fechaInicio).getDate()}
                </p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900">{ev.titulo}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tipoColor[ev.tipo]}`}>
                    {tipoLabel[ev.tipo]}
                  </span>
                  {isPast(ev.fechaInicio) && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Pasado</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-1">{fmtDate(ev.fechaInicio)}</p>
                {ev.lugar && <p className="text-xs text-gray-400">📍 {ev.lugar}</p>}
                {ev.descripcion && <p className="text-sm text-gray-600 mt-1">{ev.descripcion}</p>}
              </div>
              <button
                onClick={() => eliminar(ev.id)}
                className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Nuevo evento</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Reunión con Hudbay"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TIPOS.map((t) => <option key={t} value={t}>{tipoLabel[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Lugar</label>
                  <input
                    type="text"
                    value={form.lugar}
                    onChange={(e) => setForm({ ...form, lugar: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Oficina / Remoto"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fecha inicio *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.fechaInicio}
                    onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fecha fin</label>
                  <input
                    type="datetime-local"
                    value={form.fechaFin}
                    onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
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
                  {saving ? "Guardando..." : "Guardar evento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
