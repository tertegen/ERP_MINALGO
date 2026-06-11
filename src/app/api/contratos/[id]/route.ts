import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const contrato = await prisma.contrato.update({
    where: { id },
    data: {
      ...(body.estado && { estado: body.estado }),
      ...(body.descripcion && { descripcion: body.descripcion }),
      ...(body.montoTotal && { montoTotal: parseFloat(body.montoTotal) }),
      ...(body.fechaFin !== undefined && { fechaFin: body.fechaFin ? new Date(body.fechaFin) : null }),
      ...(body.notas !== undefined && { notas: body.notas }),
    },
    include: { cliente: { select: { id: true, nombre: true } } },
  });

  return NextResponse.json(contrato);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.gasto.deleteMany({ where: { contratoId: id } });
  await prisma.contrato.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
