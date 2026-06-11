export default function ClientesPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Clientes activos y prospectos
          </p>
        </div>
        <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Nuevo cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5">
        {["Todos", "Activos", "Prospectos", "Inactivos"].map((f) => (
          <button
            key={f}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tabla vacía */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contratos
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td
                colSpan={6}
                className="text-center py-16 text-sm text-gray-400"
              >
                No hay clientes registrados aún.
                <br />
                <span className="text-xs">Usa el botón &quot;+ Nuevo cliente&quot; para comenzar.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
