export default function PipelinePage() {
  const etapas = [
    { id: "CONTACTO_INICIAL", label: "Contacto inicial", color: "bg-gray-100" },
    { id: "PROPUESTA_ENVIADA", label: "Propuesta enviada", color: "bg-blue-50" },
    { id: "NEGOCIACION", label: "Negociación", color: "bg-amber-50" },
    { id: "GANADO", label: "Ganado", color: "bg-emerald-50" },
    { id: "PERDIDO", label: "Perdido", color: "bg-red-50" },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            Proyección y seguimiento de nuevos clientes
          </p>
        </div>
        <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Nuevo prospecto
        </button>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-5 gap-3">
        {etapas.map((etapa) => (
          <div key={etapa.id} className={`${etapa.color} rounded-xl p-3`}>
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              {etapa.label}
            </h3>
            <div className="text-center py-8 text-xs text-gray-400">
              Sin prospectos
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
