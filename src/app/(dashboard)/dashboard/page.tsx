export default function DashboardHome() {
  const kpis = [
    { label: "Contratos activos", value: "—", sub: "clientes activos" },
    { label: "Facturación del mes", value: "S/ —", sub: "vs mes anterior" },
    { label: "Planilla total", value: "S/ —", sub: "personal activo" },
    { label: "Pipeline estimado", value: "$ —", sub: "prospectos activos" },
  ];

  const modulos = [
    {
      href: "/clientes",
      titulo: "Clientes",
      desc: "Gestiona clientes, contactos y estado de relación comercial.",
      color: "bg-blue-50 border-blue-100",
      icon: "⬡",
    },
    {
      href: "/contratos",
      titulo: "Contratos",
      desc: "Contratos activos, montos, fechas y estructura de gastos.",
      color: "bg-emerald-50 border-emerald-100",
      icon: "◧",
    },
    {
      href: "/planilla",
      titulo: "Planilla",
      desc: "Personal, sueldos y resumen de gastos por proyecto y mes.",
      color: "bg-amber-50 border-amber-100",
      icon: "▤",
    },
    {
      href: "/pipeline",
      titulo: "Pipeline",
      desc: "Proyección de nuevos clientes y etapas del proceso comercial.",
      color: "bg-purple-50 border-purple-100",
      icon: "◈",
    },
    {
      href: "/calendario",
      titulo: "Calendario",
      desc: "Eventos, visitas de campo, conferencias y reuniones.",
      color: "bg-rose-50 border-rose-100",
      icon: "◫",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Resumen general · MINALGO
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="bg-white border border-gray-200 rounded-xl p-5"
          >
            <p className="text-xs text-gray-500 mb-1">{k.label}</p>
            <p className="text-2xl font-semibold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Módulos */}
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
        Módulos
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {modulos.map((m) => (
          <a
            key={m.href}
            href={m.href}
            className={`block border rounded-xl p-5 hover:shadow-sm transition-shadow ${m.color}`}
          >
            <span className="text-2xl">{m.icon}</span>
            <h3 className="text-sm font-semibold text-gray-900 mt-2">
              {m.titulo}
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {m.desc}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
