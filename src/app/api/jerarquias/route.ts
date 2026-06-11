import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jerarquias = await prisma.jerarquia.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        cliente: { select: { id: true, nombre: true } },
        _count: { select: { nodos: true } },
      },
    });
    return NextResponse.json(jerarquias);
  } catch (e) {
    console.error("GET /api/jerarquias error:", e);
    return NextResponse.json({ error: "Error al cargar jerarquías" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { titulo, descripcion, clienteId } = await req.json();
  if (!titulo || !clienteId) {
    return NextResponse.json({ error: "Título y cliente son requeridos" }, { status: 400 });
  }
  const jerarquia = await prisma.jerarquia.create({
    data: { titulo, descripcion: descripcion || null, clienteId },
    include: { cliente: { select: { id: true, nombre: true } } },
  });
  return NextResponse.json(jerarquia, { status: 201 });
}
