"use client";

import { useEffect, useState } from "react";

type Personal = {
  id: string;
  nombre: string;
  cargo: string;
  dni: string | null;
  email: string | null;
  telefono: string | null;
  activo: boolean;
  _count: { planilla: number };
};

type RegistroPlanilla = {
  id: string;
  mes: number;
  anio: number;
  sueldo: number;
  adicionales: number;
  descuentos: number;
  total: number;
  notas: string | null;
  personal: { id: string; nombre: string; cargo: string };
};

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const emptyPersonal = { nombre: "", cargo: "", dni: "", email: "", telefono: "" };
const emptyPlanilla = { personalId: "", mes: String(new Date().getMonth() + 1), anio: String(new Date().getFullYear()), sueldo: "", adicionales: "0", descuentos: "0", notas: "" };

function fmt(n: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);
}

export default function PlanillaPage() {
  const [tab, setTab] = useState<"planilla" | "personal">("planilla");
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [registros, setRegistros] = useState<RegistroPlanilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());

  const [modalPersonal, setModalPersonal] = useState(false);
  const [modalPlanilla, setModalPlanilla] = useState(false);
  const [formPersonal, setFormPersonal] = useState(emptyPersonal);
  const [formPlanilla, setFormPlanilla] = useState(emptyPlanilla);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const [p, r] = await Promise.all([
      fetch("/api/planilla/personal").then((res) => res.json()),
      fetch(`/api/planilla?mes=${mes}&anio=${anio}`).then((res) => res.json()),
    ]);
    setPersonal(p);
    setRegistros(r);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [mes, anio]);

  const submitPersonal = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/planilla/personal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formPersonal),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Error"); return; }
    setModalPersonal(false);
    setFormPersonal(emptyPersonal);
    fetchAll();
  };

  const submitPlanilla = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/planilla", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formPlanilla),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Error"); return; }
    setModalPlanilla(false);
    setFormPlanilla(emptyPlanilla);
    fetchAll();
  };

  const totalMes = registros.reduce((a, r) => a + Number(r.total), 0);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Planilla</h1>
          <p className="text-sm text-gray-500 mt-1">{personal.filter((p) => p.activo).length} personas activas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setModalPersonal(true); setFormPersonal(emptyPersonal); setError(""); }}
            className="border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            + Personal
          </button>
          <button
            onClick={() => { setModalPlanilla(true); setFormPlanilla({ ...emptyPlanilla, mes: String(mes), anio: String(anio) }); setError(""); }}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Registro
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {(["planilla", "personal"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm px-4 py-2 border-b-2 transition-colors capitalize ${
              tab === t ? "border-blue-500 text-blue-700 font-medium" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "planilla" ? "Registros mensuales" : "Personal"}
          </button>
        ))}
      </div>

      {tab === "planilla" && (
        <>
          {/* Filtro mes/año */}
          <div className="flex gap-3 mb-4 items-center">
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            {registros.length > 0 && (
              <span className="ml-auto text-sm font-medium text-gray-700">
                Total mes: <span className="text-blue-700">{fmt(totalMes)}</span>
              </span>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Personal</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sueldo</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Adicionales</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Descuentos</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400">Cargando...</td></tr>
                ) : registros.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-16 text-sm text-gray-400">No hay registros para {MESES[mes - 1]} {anio}.</td></tr>
                ) : (
                  registros.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.personal.nombre}</td>
                      <td className="px-4 py-3 text-gray-600">{r.personal.cargo}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(Number(r.sueldo))}</td>
                      <td className="px-4 py-3 text-right text-emerald-600">+{fmt(Number(r.adicionales))}</td>
                      <td className="px-4 py-3 text-right text-red-500">-{fmt(Number(r.descuentos))}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(Number(r.total))}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {registros.length > 0 && (
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">Total planilla:</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{fmt(totalMes)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}

      {tab === "personal" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Registros</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400">Cargando...</td></tr>
              ) : personal.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-sm text-gray-400">No hay personal registrado aún.</td></tr>
              ) : (
                personal.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{p.cargo}</td>
                    <td className="px-4 py-3 text-gray-500">{p.dni ?? "—"}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{p.email ?? "—"}</p>
                      {p.telefono && <p className="text-xs text-gray-400">{p.telefono}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${p.activo ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p._count.planilla}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal personal */}
      {modalPersonal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Nuevo personal</h2>
              <button onClick={() => setModalPersonal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={submitPersonal} className="px-6 py-5 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
                  <input type="text" required value={formPersonal.nombre}
                    onChange={(e) => setFormPersonal({ ...formPersonal, nombre: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cargo *</label>
                  <input type="text" required value={formPersonal.cargo}
                    onChange={(e) => setFormPersonal({ ...formPersonal, cargo: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Topógrafo" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">DNI</label>
                  <input type="text" value={formPersonal.dni}
                    onChange={(e) => setFormPersonal({ ...formPersonal, dni: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="text" value={formPersonal.telefono}
                    onChange={(e) => setFormPersonal({ ...formPersonal, telefono: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={formPersonal.email}
                  onChange={(e) => setFormPersonal({ ...formPersonal, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModalPersonal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal planilla */}
      {modalPlanilla && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Nuevo registro de planilla</h2>
              <button onClick={() => setModalPlanilla(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={submitPlanilla} className="px-6 py-5 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Personal *</label>
                <select required value={formPlanilla.personalId}
                  onChange={(e) => setFormPlanilla({ ...formPlanilla, personalId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Seleccionar...</option>
                  {personal.filter((p) => p.activo).map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} — {p.cargo}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mes *</label>
                  <select value={formPlanilla.mes}
                    onChange={(e) => setFormPlanilla({ ...formPlanilla, mes: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Año *</label>
                  <select value={formPlanilla.anio}
                    onChange={(e) => setFormPlanilla({ ...formPlanilla, anio: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sueldo base *</label>
                <input type="number" required step="0.01" min="0" value={formPlanilla.sueldo}
                  onChange={(e) => setFormPlanilla({ ...formPlanilla, sueldo: e.target.value })}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Adicionales</label>
                  <input type="number" step="0.01" min="0" value={formPlanilla.adicionales}
                    onChange={(e) => setFormPlanilla({ ...formPlanilla, adicionales: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Descuentos</label>
                  <input type="number" step="0.01" min="0" value={formPlanilla.descuentos}
                    onChange={(e) => setFormPlanilla({ ...formPlanilla, descuentos: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              {formPlanilla.sueldo && (
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                  Total estimado:{" "}
                  <span className="font-semibold">
                    {fmt(
                      parseFloat(formPlanilla.sueldo || "0") +
                      parseFloat(formPlanilla.adicionales || "0") -
                      parseFloat(formPlanilla.descuentos || "0")
                    )}
                  </span>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
                <textarea rows={2} value={formPlanilla.notas}
                  onChange={(e) => setFormPlanilla({ ...formPlanilla, notas: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModalPlanilla(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
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
