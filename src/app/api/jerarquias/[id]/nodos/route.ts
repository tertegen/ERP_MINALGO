import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: jerarquiaId } = await params;
  const { nombre, cargo, lado, parentId, orden } = await req.json();
  if (!nombre) {
    return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 });
  }
  const nodo = await prisma.nodoJerarquia.create({
    data: {
      jerarquiaId,
      nombre,
      cargo: cargo || null,
      lado: lado === "CLIENTE" ? "CLIENTE" : "MINALGO",
      parentId: parentId || null,
      orden: orden ?? 0,
    },
  });
  return NextResponse.json(nodo, { status: 201 });
}
