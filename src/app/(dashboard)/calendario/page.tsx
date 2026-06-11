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

const tipoChipColor: Record<string, string> = {
  REUNION: "bg-blue-100 text-blue-800 border border-blue-200",
  VISITA_CAMPO: "bg-green-100 text-green-800 border border-green-200",
  CONFERENCIA: "bg-pink-100 text-pink-800 border border-pink-200",
  CAPACITACION: "bg-amber-100 text-amber-800 border border-amber-200",
  OTRO: "bg-purple-100 text-purple-800 border border-purple-200",
};

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

// Returns 0=Mon ... 6=Sun
function dayOfWeekMon(d: Date) {
  return (d.getDay() + 6) % 7;
}

function buildCalendarDays(viewDate: Date): (Date | null)[] {
  const first = startOfMonth(viewDate);
  const offset = dayOfWeekMon(first);
  const total = daysInMonth(viewDate);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) {
    cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const emptyForm = { titulo: "", descripcion: "", tipo: "REUNION", fechaInicio: "", horaInicio: "09:00", fechaFin: "", lugar: "" };

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);

  const fetchEventos = async () => {
    const data = await fetch("/api/calendario").then((r) => r.json());
    setEventos(data);
  };

  useEffect(() => { fetchEventos(); }, []);

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const goToday = () => setViewDate(new Date());

  const openNewEvent = (day: Date) => {
    const yyyy = day.getFullYear();
    const mm = String(day.getMonth() + 1).padStart(2, "0");
    const dd = String(day.getDate()).padStart(2, "0");
    setForm({ ...emptyForm, fechaInicio: `${yyyy}-${mm}-${dd}` });
    setSelectedEvento(null);
    setError("");
    setModal(true);
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const fechaInicio = form.horaInicio
      ? `${form.fechaInicio}T${form.horaInicio}`
      : form.fechaInicio;
    const res = await fetch("/api/calendario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, fechaInicio }),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Error"); return; }
    setModal(false);
    fetchEventos();
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar este evento?")) return;
    await fetch(`/api/calendario/${id}`, { method: "DELETE" });
    setSelectedEvento(null);
    fetchEventos();
  };

  const cells = buildCalendarDays(viewDate);
  const today = new Date();

  const getEventosDelDia = (day: Date) =>
    eventos.filter((ev) => isSameDay(new Date(ev.fechaInicio), day));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Calendario de actividades</h1>
          <p className="text-sm text-gray-500 mt-0.5">Operaciones y agenda del equipo</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setSelectedEvento(null); setError(""); setModal(true); }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo evento
        </button>
      </div>

      {/* Navegación de mes */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-base font-semibold text-gray-900 uppercase tracking-wide min-w-[200px] text-center">
              {MESES[viewDate.getMonth()].toUpperCase()} {viewDate.getFullYear()}
            </h2>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button onClick={goToday} className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            Hoy
          </button>
        </div>

        {/* Grilla */}
        <div className="grid grid-cols-7">
          {/* Cabeceras días */}
          {DIAS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">
              {d}
            </div>
          ))}

          {/* Celdas */}
          {cells.map((day, i) => {
            const isToday = day ? isSameDay(day, today) : false;
            const isWeekend = i % 7 >= 5;
            const evs = day ? getEventosDelDia(day) : [];

            return (
              <div
                key={i}
                onClick={() => day && openNewEvent(day)}
                className={`min-h-[110px] border-b border-r border-gray-100 p-2 transition-colors ${
                  day ? "cursor-pointer hover:bg-gray-50" : "bg-gray-50/40"
                } ${isWeekend && day ? "bg-gray-50/60" : ""}`}
              >
                {day && (
                  <>
                    <span className={`inline-flex items-center justify-center w-6 h-6 text-sm mb-1 rounded-full font-medium ${
                      isToday
                        ? "bg-blue-600 text-white"
                        : isWeekend
                        ? "text-gray-400"
                        : "text-gray-700"
                    }`}>
                      {day.getDate()}
                    </span>
                    <div className="space-y-0.5">
                      {evs.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedEvento(ev); }}
                          className={`text-[11px] leading-tight px-1.5 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${tipoChipColor[ev.tipo]}`}
                        >
                          <p className="font-medium truncate">{ev.titulo}</p>
                          {ev.lugar && <p className="opacity-70 truncate">{ev.lugar}</p>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 mt-3 flex-wrap">
        {TIPOS.map((t) => (
          <div key={t} className="flex items-center gap-1.5">
            <span className={`inline-block w-2.5 h-2.5 rounded-sm ${tipoChipColor[t].split(" ")[0]}`} />
            <span className="text-xs text-gray-500">{tipoLabel[t]}</span>
          </div>
        ))}
      </div>

      {/* Modal detalle evento */}
      {selectedEvento && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvento(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tipoChipColor[selectedEvento.tipo]}`}>
                {tipoLabel[selectedEvento.tipo]}
              </span>
              <button onClick={() => setSelectedEvento(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="px-5 py-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">{selectedEvento.titulo}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex gap-2">
                  <span className="text-gray-400 w-5">📅</span>
                  <span>
                    {new Date(selectedEvento.fechaInicio).toLocaleDateString("es-PE", {
                      weekday: "long", day: "numeric", month: "long",
                    })}
                    {" — "}
                    {new Date(selectedEvento.fechaInicio).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {selectedEvento.lugar && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-5">📍</span>
                    <span>{selectedEvento.lugar}</span>
                  </div>
                )}
                {selectedEvento.descripcion && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-5">📝</span>
                    <span>{selectedEvento.descripcion}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100">
              <button
                onClick={() => eliminar(selectedEvento.id)}
                className="w-full text-sm text-red-500 hover:text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
              >
                Eliminar evento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nuevo evento */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
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
                  autoFocus
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
                    placeholder="Lima / Campo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={form.fechaInicio}
                    onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hora</label>
                  <input
                    type="time"
                    value={form.horaInicio}
                    onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Descripción / Participantes</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Ej: Gral. Hidalgo · Jose Antonio"
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
