import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const persona = await prisma.personal.update({
    where: { id },
    data: {
      ...(body.nombre && { nombre: body.nombre }),
      ...(body.cargo && { cargo: body.cargo }),
      ...(body.activo !== undefined && { activo: body.activo }),
    },
  });

  return NextResponse.json(persona);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.planilla.deleteMany({ where: { personalId: id } });
  await prisma.personal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
