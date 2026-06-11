import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.pipeline.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      cliente: { select: { id: true, nombre: true } },
      _count: { select: { actividades: true } },
    },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { clienteId, descripcion, montoEstimado, moneda, probabilidad, etapa, fechaEstimada, notas } = body;

  if (!clienteId || !descripcion) {
    return NextResponse.json({ error: "Cliente y descripción son requeridos" }, { status: 400 });
  }

  const item = await prisma.pipeline.create({
    data: {
      clienteId,
      descripcion,
      montoEstimado: montoEstimado ? parseFloat(montoEstimado) : null,
      moneda: moneda ?? "DOLARES",
      probabilidad: probabilidad ? parseInt(probabilidad) : null,
      etapa: etapa ?? "CONTACTO_INICIAL",
      fechaEstimada: fechaEstimada ? new Date(fechaEstimada) : null,
      notas: notas || null,
    },
    include: { cliente: { select: { id: true, nombre: true } } },
  });

  return NextResponse.json(item, { status: 201 });
}
