"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DashboardData = {
  clientes: { total: number; activos: number };
  contratos: { activos: number; total: number };
  pipeline: { valor: number; items: number; porEtapa: Record<string, number> };
  planilla: { totalMes: number };
  eventosProximos: Array<{ id: string; titulo: string; tipo: string; fechaInicio: string; lugar: string | null }>;
};

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

function fmt(n: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function fmtPEN(n: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);
}

export default function DashboardHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  const mes = new Date().toLocaleDateString("es-PE", { month: "long", year: "numeric" });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1 capitalize">{mes}</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm text-gray-400">Cargando datos...</div>
      ) : data ? (
        <>
          {/* KPIs principales */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Link href="/clientes" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors group">
              <p className="text-xs text-gray-500 mb-2">Clientes activos</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{data.clientes.activos}</p>
              <p className="text-xs text-gray-400">{data.clientes.total} totales</p>
            </Link>

            <Link href="/contratos" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors group">
              <p className="text-xs text-gray-500 mb-2">Contratos activos</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{data.contratos.activos}</p>
              <p className="text-xs text-gray-400">{data.contratos.total} totales</p>
            </Link>

            <Link href="/pipeline" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors group">
              <p className="text-xs text-gray-500 mb-2">Proyecciones activas</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{fmt(data.pipeline.valor)}</p>
              <p className="text-xs text-gray-400">{data.pipeline.items} oportunidades</p>
            </Link>

            <Link href="/planilla" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors group">
              <p className="text-xs text-gray-500 mb-2">Planilla del mes</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{fmtPEN(data.planilla.totalMes)}</p>
              <p className="text-xs text-gray-400">Total registrado</p>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Pipeline por etapa */}
            <div className="col-span-1 bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">Proyecciones por etapa</h2>
                <Link href="/pipeline" className="text-xs text-blue-600 hover:text-blue-700">Ver todo →</Link>
              </div>
              <div className="space-y-3">
                {[
                  { key: "CONTACTO_INICIAL", label: "Contacto inicial", color: "bg-blue-400" },
                  { key: "PROPUESTA_ENVIADA", label: "Propuesta enviada", color: "bg-amber-400" },
                  { key: "NEGOCIACION", label: "Negociación", color: "bg-purple-400" },
                ].map(({ key, label, color }) => {
                  const count = data.pipeline.porEtapa[key] ?? 0;
                  const total = data.pipeline.items || 1;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{label}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${color}`}
                          style={{ width: `${Math.round((count / total) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {data.pipeline.items === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">Sin oportunidades activas</p>
                )}
              </div>
            </div>

            {/* Eventos próximos */}
            <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">Próximos eventos</h2>
                <Link href="/calendario" className="text-xs text-blue-600 hover:text-blue-700">Ver calendario →</Link>
              </div>
              {data.eventosProximos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 mb-2">No hay eventos próximos</p>
                  <Link href="/calendario" className="text-xs text-blue-600 hover:text-blue-700">+ Agregar evento</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.eventosProximos.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="flex-shrink-0 w-10 text-center">
                        <p className="text-xs text-gray-400">
                          {new Date(ev.fechaInicio).toLocaleDateString("es-PE", { month: "short" }).toUpperCase()}
                        </p>
                        <p className="text-lg font-bold text-gray-900 leading-none">
                          {new Date(ev.fechaInicio).getDate()}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{ev.titulo}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${tipoColor[ev.tipo]}`}>
                            {tipoLabel[ev.tipo]}
                          </span>
                          {ev.lugar && <span className="text-xs text-gray-400 truncate">{ev.lugar}</span>}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(ev.fechaInicio).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="mt-6 grid grid-cols-5 gap-3">
            {[
              { href: "/clientes", label: "Nuevo cliente", icon: "👤" },
              { href: "/contratos", label: "Nuevo contrato", icon: "📄" },
              { href: "/pipeline", label: "Nueva proyección", icon: "📊" },
              { href: "/planilla", label: "Registrar planilla", icon: "💰" },
              { href: "/calendario", label: "Nuevo evento", icon: "📅" },
            ].map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
