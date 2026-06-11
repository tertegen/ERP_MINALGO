export default function PlanillaPage() {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Planilla</h1>
          <p className="text-sm text-gray-500 mt-1">Gastos y personal por proyecto</p>
        </div>
        <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Agregar gasto
        </button>
      </div>

      {/* Selector de mes */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {meses.map((m, i) => (
          <button
            key={m}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              i === 5
                ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Cards por proyecto */}
      <div className="grid grid-cols-2 gap-4">
        {["Hudbay OIPs", "Odebrecht Pomalca"].map((proyecto) => (
          <div
            key={proyecto}
            className="bg-white border border-gray-200 rounded-xl p-5"
          >
            <h3 className="font-medium text-gray-900 mb-3">{proyecto}</h3>
            <div className="text-sm text-gray-400 py-8 text-center">
              Sin datos para este mes
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-400">Propuesto</p>
                <p className="text-sm font-semibold text-gray-700">S/ —</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Real</p>
                <p className="text-sm font-semibold text-gray-700">S/ —</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Utilidad</p>
                <p className="text-sm font-semibold text-emerald-600">S/ —</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
