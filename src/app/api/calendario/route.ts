import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const eventos = await prisma.evento.findMany({
    orderBy: { fechaInicio: "asc" },
  });
  return NextResponse.json(eventos);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { titulo, descripcion, tipo, fechaInicio, fechaFin, lugar } = body;

  if (!titulo || !fechaInicio) {
    return NextResponse.json({ error: "Título y fecha de inicio son requeridos" }, { status: 400 });
  }

  const evento = await prisma.evento.create({
    data: {
      titulo,
      descripcion: descripcion || null,
      tipo: tipo ?? "REUNION",
      fechaInicio: new Date(fechaInicio),
      fechaFin: fechaFin ? new Date(fechaFin) : null,
      lugar: lugar || null,
    },
  });

  return NextResponse.json(evento, { status: 201 });
}
