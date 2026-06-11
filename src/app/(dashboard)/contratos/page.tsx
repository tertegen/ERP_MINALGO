export default function ContratosPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contratos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Contratos activos y estructura de gastos
          </p>
        </div>
        <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Nuevo contrato
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vigencia
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td
                colSpan={7}
                className="text-center py-16 text-sm text-gray-400"
              >
                No hay contratos registrados aún.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
