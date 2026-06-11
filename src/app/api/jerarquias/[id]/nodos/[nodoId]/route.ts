import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; nodoId: string }> }
) {
  const { nodoId } = await params;
  const { nombre, cargo, parentId, orden } = await req.json();
  const nodo = await prisma.nodoJerarquia.update({
    where: { id: nodoId },
    data: {
      nombre,
      cargo: cargo || null,
      parentId: parentId ?? undefined,
      orden: orden ?? undefined,
    },
  });
  return NextResponse.json(nodo);
}

async function deleteDescendants(nodeId: string) {
  const children = await prisma.nodoJerarquia.findMany({ where: { parentId: nodeId } });
  for (const child of children) {
    await deleteDescendants(child.id);
  }
  await prisma.nodoJerarquia.deleteMany({ where: { parentId: nodeId } });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string; nodoId: string }> }
) {
  const { nodoId } = await params;
  await deleteDescendants(nodoId);
  await prisma.nodoJerarquia.delete({ where: { id: nodoId } });
  return NextResponse.json({ ok: true });
}
