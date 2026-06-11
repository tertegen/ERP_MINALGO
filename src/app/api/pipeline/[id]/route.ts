import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const item = await prisma.pipeline.update({
    where: { id },
    data: {
      ...(body.etapa && { etapa: body.etapa }),
      ...(body.descripcion && { descripcion: body.descripcion }),
      ...(body.probabilidad !== undefined && { probabilidad: body.probabilidad ? parseInt(body.probabilidad) : null }),
      ...(body.montoEstimado !== undefined && { montoEstimado: body.montoEstimado ? parseFloat(body.montoEstimado) : null }),
      ...(body.notas !== undefined && { notas: body.notas }),
    },
    include: { cliente: { select: { id: true, nombre: true } } },
  });

  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.actividad.deleteMany({ where: { pipelineId: id } });
  await prisma.pipeline.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
