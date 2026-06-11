"use client";

import { useEffect, useState, useCallback } from "react";

type Nodo = {
  id: string;
  nombre: string;
  cargo: string | null;
  lado: "MINALGO" | "CLIENTE";
  parentId: string | null;
  orden: number;
};

type Jerarquia = {
  id: string;
  titulo: string;
  descripcion: string | null;
  cliente: { id: string; nombre: string };
  nodos: Nodo[];
};

type JerarquiaResumen = {
  id: string;
  titulo: string;
  descripcion: string | null;
  cliente: { id: string; nombre: string };
};

type Cliente = { id: string; nombre: string };

// ─── Org node component ───────────────────────────────────────────────────────

function OrgNode({
  node,
  allNodes,
  isBlue,
  jerarquiaId,
  onRefresh,
}: {
  node: Nodo;
  allNodes: Nodo[];
  isBlue: boolean;
  jerarquiaId: string;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nombre: node.nombre, cargo: node.cargo ?? "" });
  const [addingChild, setAddingChild] = useState(false);
  const [childForm, setChildForm] = useState({ nombre: "", cargo: "" });

  const children = allNodes
    .filter((n) => n.parentId === node.id)
    .sort((a, b) => a.orden - b.orden);

  const colorBox = isBlue
    ? "border-blue-300 bg-blue-50 text-blue-900"
    : "border-rose-300 bg-rose-50 text-rose-900";

  const colorAction = isBlue ? "text-blue-600 hover:text-blue-800" : "text-rose-500 hover:text-rose-700";

  async function saveEdit() {
    await fetch(`/api/jerarquias/${jerarquiaId}/nodos/${node.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: editForm.nombre, cargo: editForm.cargo }),
    });
    setEditing(false);
    onRefresh();
  }

  async function deleteNode() {
    if (!confirm(`¿Eliminar "${node.nombre}" y todos sus subordinados?`)) return;
    await fetch(`/api/jerarquias/${jerarquiaId}/nodos/${node.id}`, { method: "DELETE" });
    onRefresh();
  }

  async function addChild() {
    if (!childForm.nombre.trim()) return;
    await fetch(`/api/jerarquias/${jerarquiaId}/nodos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: childForm.nombre,
        cargo: childForm.cargo,
        lado: node.lado,
        parentId: node.id,
        orden: children.length,
      }),
    });
    setAddingChild(false);
    setChildForm({ nombre: "", cargo: "" });
    onRefresh();
  }

  return (
    <div className="flex flex-col items-center">
      {/* Node box */}
      <div className={`group relative border-2 rounded-xl px-4 py-3 text-center min-w-[140px] max-w-[190px] shadow-sm ${colorBox}`}>
        {editing ? (
          <div className="text-left space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={editForm.cargo}
              onChange={(e) => setEditForm({ ...editForm, cargo: e.target.value })}
              placeholder="Cargo"
              className="w-full text-[11px] border border-gray-200 rounded px-2 py-1 text-gray-700 focus:outline-none"
            />
            <input
              value={editForm.nombre}
              onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
              placeholder="Nombre"
              className="w-full text-[11px] border border-gray-200 rounded px-2 py-1 text-gray-900 focus:outline-none"
            />
            <div className="flex gap-1 pt-0.5">
              <button
                onClick={saveEdit}
                className="flex-1 text-[10px] bg-gray-900 text-white rounded py-0.5 hover:bg-gray-700"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 text-[10px] border border-gray-200 rounded py-0.5 hover:bg-gray-50 text-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            {node.cargo && (
              <p className="text-[10px] font-semibold leading-tight mb-0.5 opacity-70">{node.cargo}</p>
            )}
            <p className="text-xs font-medium leading-tight">{node.nombre}</p>

            {/* Hover actions */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-0.5 bg-white border border-gray-200 rounded-full shadow px-1.5 py-0.5 z-20 whitespace-nowrap">
              <button
                onClick={() => setAddingChild(true)}
                className={`text-[10px] px-1.5 font-medium ${colorAction}`}
              >
                + hijo
              </button>
              <span className="text-gray-200">|</span>
              <button
                onClick={() => setEditing(true)}
                className="text-[10px] px-1.5 text-gray-500 hover:text-gray-700"
              >
                editar
              </button>
              <span className="text-gray-200">|</span>
              <button
                onClick={deleteNode}
                className="text-[10px] px-1.5 text-red-400 hover:text-red-600"
              >
                eliminar
              </button>
            </div>
          </>
        )}
      </div>

      {/* Add child inline form */}
      {addingChild && (
        <div className="mt-6 border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 min-w-[150px] bg-white shadow-sm space-y-1.5">
          <input
            autoFocus
            value={childForm.cargo}
            onChange={(e) => setChildForm({ ...childForm, cargo: e.target.value })}
            placeholder="Cargo (opcional)"
            className="w-full text-[11px] border border-gray-200 rounded px-2 py-1 text-gray-600 focus:outline-none"
          />
          <input
            value={childForm.nombre}
            onChange={(e) => setChildForm({ ...childForm, nombre: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") addChild(); if (e.key === "Escape") setAddingChild(false); }}
            placeholder="Nombre *"
            className="w-full text-[11px] border border-gray-200 rounded px-2 py-1 text-gray-900 focus:outline-none"
          />
          <div className="flex gap-1">
            <button onClick={addChild} className="flex-1 text-[10px] bg-gray-900 text-white rounded py-0.5 hover:bg-gray-700">Agregar</button>
            <button onClick={() => setAddingChild(false)} className="flex-1 text-[10px] border border-gray-200 rounded py-0.5 text-gray-500">Cancelar</button>
          </div>
        </div>
      )}

      {/* Children */}
      {children.length > 0 && !addingChild && (
        <>
          <div className="w-px h-6 bg-gray-300 mt-6" />
          <div className="flex">
            {children.map((child, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === children.length - 1;
              return (
                <div key={child.id} className="flex flex-col items-center relative" style={{ paddingTop: 24, paddingLeft: 20, paddingRight: 20 }}>
                  {/* Left half of horizontal bar */}
                  {!isFirst && (
                    <div className="absolute top-0 left-0 h-px bg-gray-300" style={{ right: "50%" }} />
                  )}
                  {/* Right half of horizontal bar */}
                  {!isLast && (
                    <div className="absolute top-0 right-0 h-px bg-gray-300" style={{ left: "50%" }} />
                  )}
                  {/* Vertical connector down */}
                  <div className="absolute top-0 left-1/2 w-px h-6 bg-gray-300 -translate-x-px" />
                  <OrgNode
                    node={child}
                    allNodes={allNodes}
                    isBlue={isBlue}
                    jerarquiaId={jerarquiaId}
                    onRefresh={onRefresh}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tree side ────────────────────────────────────────────────────────────────

function OrgSide({
  lado,
  label,
  isBlue,
  nodes,
  jerarquiaId,
  onRefresh,
}: {
  lado: "MINALGO" | "CLIENTE";
  label: string;
  isBlue: boolean;
  nodes: Nodo[];
  jerarquiaId: string;
  onRefresh: () => void;
}) {
  const [addingRoot, setAddingRoot] = useState(false);
  const [rootForm, setRootForm] = useState({ nombre: "", cargo: "" });

  const rootNodes = nodes
    .filter((n) => n.lado === lado && !n.parentId)
    .sort((a, b) => a.orden - b.orden);

  async function addRoot() {
    if (!rootForm.nombre.trim()) return;
    await fetch(`/api/jerarquias/${jerarquiaId}/nodos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: rootForm.nombre,
        cargo: rootForm.cargo,
        lado,
        parentId: null,
        orden: rootNodes.length,
      }),
    });
    setAddingRoot(false);
    setRootForm({ nombre: "", cargo: "" });
    onRefresh();
  }

  const headerColor = isBlue
    ? "text-blue-700 border-blue-200"
    : "text-rose-600 border-rose-200";

  return (
    <div className="flex-1 flex flex-col items-center min-w-0">
      <p className={`text-xs font-semibold uppercase tracking-widest mb-8 pb-2 border-b ${headerColor}`}>
        {label}
      </p>

      {/* Trees (could be multiple root nodes) */}
      <div className="flex flex-col items-center gap-10">
        {rootNodes.map((root) => (
          <OrgNode
            key={root.id}
            node={root}
            allNodes={nodes}
            isBlue={isBlue}
            jerarquiaId={jerarquiaId}
            onRefresh={onRefresh}
          />
        ))}
      </div>

      {/* Add root node */}
      {addingRoot ? (
        <div className="mt-8 border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 min-w-[160px] bg-white shadow-sm space-y-1.5">
          <input
            autoFocus
            value={rootForm.cargo}
            onChange={(e) => setRootForm({ ...rootForm, cargo: e.target.value })}
            placeholder="Cargo (opcional)"
            className="w-full text-[11px] border border-gray-200 rounded px-2 py-1 text-gray-600 focus:outline-none"
          />
          <input
            value={rootForm.nombre}
            onChange={(e) => setRootForm({ ...rootForm, nombre: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") addRoot(); if (e.key === "Escape") setAddingRoot(false); }}
            placeholder="Nombre *"
            className="w-full text-[11px] border border-gray-200 rounded px-2 py-1 text-gray-900 focus:outline-none"
          />
          <div className="flex gap-1">
            <button onClick={addRoot} className="flex-1 text-[10px] bg-gray-900 text-white rounded py-0.5">Agregar</button>
            <button onClick={() => setAddingRoot(false)} className="flex-1 text-[10px] border rounded py-0.5 text-gray-500">Cancelar</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingRoot(true)}
          className="mt-8 text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg px-4 py-2 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          + Agregar nodo raíz
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const emptyForm = { titulo: "", descripcion: "", clienteId: "" };

export default function JerarquiasPage() {
  const [lista, setLista] = useState<JerarquiaResumen[]>([]);
  const [selected, setSelected] = useState<Jerarquia | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchLista = useCallback(async () => {
    const data = await fetch("/api/jerarquias").then((r) => r.json());
    setLista(data);
    setLoading(false);
    return data as JerarquiaResumen[];
  }, []);

  const fetchSelected = useCallback(async (id: string) => {
    const data = await fetch(`/api/jerarquias/${id}`).then((r) => r.json());
    setSelected(data);
  }, []);

  useEffect(() => {
    const loadClientes = fetch("/api/clientes")
      .then((r) => r.ok ? r.json() : [])
      .catch(() => []);

    const loadJerarquias = fetch("/api/jerarquias")
      .then((r) => r.ok ? r.json() : [])
      .catch(() => []);

    Promise.all([loadJerarquias, loadClientes]).then(([j, c]) => {
      setLista(Array.isArray(j) ? j : []);
      setClientes(Array.isArray(c) ? c : []);
      if (Array.isArray(j) && j.length > 0) fetchSelected(j[0].id);
      setLoading(false);
    });
  }, [fetchSelected]);

  const handleCreate = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/jerarquias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) return;
    const nueva = await res.json();
    setModal(false);
    setForm(emptyForm);
    const updated = await fetchLista();
    const found = updated.find((j) => j.id === nueva.id);
    if (found) fetchSelected(found.id);
  };

  const deleteJerarquia = async (id: string) => {
    if (!confirm("¿Eliminar esta jerarquía y todos sus nodos?")) return;
    await fetch(`/api/jerarquias/${id}`, { method: "DELETE" });
    const updated = await fetchLista();
    if (updated.length > 0) fetchSelected(updated[0].id);
    else setSelected(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Jerarquía de contacto con clientes</h1>
            <p className="text-sm text-gray-500 mt-0.5">Estructura operativa por proyecto y cliente</p>
          </div>
          <button
            onClick={() => { setModal(true); setForm(emptyForm); }}
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Nueva jerarquía
          </button>
        </div>

        {/* Tabs */}
        {!loading && (
          <div className="flex gap-2 flex-wrap">
            {lista.map((j) => (
              <button
                key={j.id}
                onClick={() => fetchSelected(j.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm border transition-colors ${
                  selected?.id === j.id
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${selected?.id === j.id ? "bg-white" : "bg-blue-500"}`} />
                {j.cliente.nombre} — {j.titulo}
              </button>
            ))}
            {lista.length === 0 && !loading && (
              <p className="text-sm text-gray-400">Aún no hay jerarquías. Crea la primera.</p>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        {loading ? (
          <div className="text-center py-20 text-sm text-gray-400">Cargando...</div>
        ) : !selected ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 text-sm mb-4">No hay jerarquías. Crea una para empezar.</p>
            <button
              onClick={() => setModal(true)}
              className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-700"
            >
              + Nueva jerarquía
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-4">
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Estructura de colaboración — {selected.cliente.nombre} / {selected.titulo}
                </p>
                {selected.descripcion && (
                  <p className="text-xs text-gray-500 mt-0.5">{selected.descripcion}</p>
                )}
              </div>
              <button
                onClick={() => deleteJerarquia(selected.id)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Eliminar jerarquía
              </button>
            </div>

            {/* Org chart area */}
            <div className="flex divide-x divide-gray-100 min-h-[400px] overflow-x-auto">
              <div className="flex-1 px-10 py-10">
                <OrgSide
                  lado="MINALGO"
                  label="MINALGO"
                  isBlue={true}
                  nodes={selected.nodos}
                  jerarquiaId={selected.id}
                  onRefresh={() => fetchSelected(selected.id)}
                />
              </div>
              <div className="flex-1 px-10 py-10">
                <OrgSide
                  lado="CLIENTE"
                  label={selected.cliente.nombre}
                  isBlue={false}
                  nodes={selected.nodos}
                  jerarquiaId={selected.id}
                  onRefresh={() => fetchSelected(selected.id)}
                />
              </div>
            </div>

            {/* Legend */}
            <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-6">
              <p className="text-[11px] text-gray-400 font-medium">Hover sobre un nodo para agregar hijos, editar o eliminar</p>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded border-2 border-blue-300 bg-blue-50" />
                <span className="text-[11px] text-gray-400">MINALGO</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded border-2 border-rose-300 bg-rose-50" />
                <span className="text-[11px] text-gray-400">{selected.cliente.nombre}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal nueva jerarquía */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Nueva jerarquía</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cliente *</label>
                <select
                  required
                  value={form.clienteId}
                  onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej: OIPs Cajamarca"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción breve"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gray-900 text-white text-sm py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
