import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jerarquia = await prisma.jerarquia.findUnique({
    where: { id },
    include: {
      cliente: { select: { id: true, nombre: true } },
      nodos: { orderBy: { orden: "asc" } },
    },
  });
  if (!jerarquia) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(jerarquia);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { titulo, descripcion } = await req.json();
  const jerarquia = await prisma.jerarquia.update({
    where: { id },
    data: { titulo, descripcion },
    include: { cliente: { select: { id: true, nombre: true } } },
  });
  return NextResponse.json(jerarquia);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.jerarquia.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
