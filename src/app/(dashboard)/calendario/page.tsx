export default function CalendarioPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Calendario</h1>
          <p className="text-sm text-gray-500 mt-1">
            Eventos, visitas y actividades operativas
          </p>
        </div>
        <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Nuevo evento
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400">
        Vista de calendario — próximamente
      </div>
    </div>
  );
}
