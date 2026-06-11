import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const evento = await prisma.evento.update({
    where: { id },
    data: {
      ...(body.titulo && { titulo: body.titulo }),
      ...(body.tipo && { tipo: body.tipo }),
      ...(body.fechaInicio && { fechaInicio: new Date(body.fechaInicio) }),
      ...(body.fechaFin !== undefined && { fechaFin: body.fechaFin ? new Date(body.fechaFin) : null }),
      ...(body.lugar !== undefined && { lugar: body.lugar }),
      ...(body.descripcion !== undefined && { descripcion: body.descripcion }),
    },
  });

  return NextResponse.json(evento);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.evento.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
