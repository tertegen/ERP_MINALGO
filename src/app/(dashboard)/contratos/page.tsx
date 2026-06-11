"use client";

import { useEffect, useState } from "react";

type Cliente = { id: string; nombre: string };
type Contrato = {
  id: string;
  codigo: string | null;
  descripcion: string;
  moneda: string;
  montoTotal: number;
  fechaInicio: string;
  fechaFin: string | null;
  estado: string;
  cliente: { id: string; nombre: string };
  _count: { gastos: number };
};

const ESTADOS = ["ACTIVO", "PAUSADO", "CERRADO"];
const MONEDAS = ["SOLES", "DOLARES"];

const estadoColor: Record<string, string> = {
  ACTIVO: "bg-emerald-100 text-emerald-700",
  PAUSADO: "bg-amber-100 text-amber-700",
  CERRADO: "bg-gray-100 text-gray-500",
};

const estadoLabel: Record<string, string> = {
  ACTIVO: "Activo",
  PAUSADO: "Pausado",
  CERRADO: "Cerrado",
};

const empty = {
  clienteId: "",
  codigo: "",
  descripcion: "",
  moneda: "SOLES",
  montoTotal: "",
  fechaInicio: "",
  fechaFin: "",
  estado: "ACTIVO",
  notas: "",
};

function fmt(n: number, moneda: string) {
  const sym = moneda === "DOLARES" ? "USD" : "PEN";
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: sym === "USD" ? "USD" : "PEN" }).format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Todos");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const [c, cl] = await Promise.all([
      fetch("/api/contratos").then((r) => r.json()),
      fetch("/api/clientes").then((r) => r.json()),
    ]);
    setContratos(c);
    setClientes(cl);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtrados = contratos.filter((c) => {
    if (filtro === "Todos") return true;
    return c.estado === filtro;
  });

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/contratos", {
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

  const cambiarEstado = async (id: string, estado: string) => {
    await fetch(`/api/contratos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    fetchAll();
  };

  const montoTotal = filtrados.reduce((a, c) => a + Number(c.montoTotal), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contratos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {contratos.length} contrato{contratos.length !== 1 ? "s" : ""} registrados
          </p>
        </div>
        <button
          onClick={() => { setModal(true); setForm(empty); setError(""); }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo contrato
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5">
        {["Todos", "ACTIVO", "PAUSADO", "CERRADO"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              filtro === f
                ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f === "Todos" ? "Todos" : estadoLabel[f]}
          </button>
        ))}
      </div>

      {/* Resumen */}
      {filtrados.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 text-sm text-blue-800">
          <span className="font-medium">{filtrados.length} contratos</span> — Valor total:{" "}
          <span className="font-semibold">
            {new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(montoTotal)}
          </span>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vigencia</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-sm text-gray-400">Cargando...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-sm text-gray-400">No hay contratos registrados aún.</td></tr>
            ) : (
              filtrados.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.codigo ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.cliente.nombre}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{c.descripcion}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{fmt(Number(c.montoTotal), c.moneda)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${estadoColor[c.estado]}`}>
                      {estadoLabel[c.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {fmtDate(c.fechaInicio)}
                    {c.fechaFin ? ` → ${fmtDate(c.fechaFin)}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={c.estado}
                      onChange={(e) => cambiarEstado(c.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {ESTADOS.map((s) => <option key={s} value={s}>{estadoLabel[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-base font-semibold text-gray-900">Nuevo contrato</h2>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="CTR-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ESTADOS.map((s) => <option key={s} value={s}>{estadoLabel[s]}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Descripción *</label>
                <input
                  type="text"
                  required
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Suministro de servicios de topografía"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Monto total *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={form.montoTotal}
                    onChange={(e) => setForm({ ...form, montoTotal: e.target.value })}
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
                    {MONEDAS.map((m) => <option key={m} value={m}>{m === "SOLES" ? "Soles (PEN)" : "Dólares (USD)"}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fecha inicio *</label>
                  <input
                    type="date"
                    required
                    value={form.fechaInicio}
                    onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fecha fin</label>
                  <input
                    type="date"
                    value={form.fechaFin}
                    onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                  {saving ? "Guardando..." : "Guardar contrato"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
