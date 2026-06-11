import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { contratos: true } } },
    });
    return NextResponse.json(clientes);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, tipo, estado, contacto, email, telefono, ruc, notas } = body;

    if (!nombre || !tipo) {
      return NextResponse.json({ error: "Nombre y tipo son requeridos" }, { status: 400 });
    }

    const cliente = await prisma.cliente.create({
      data: { nombre, tipo, estado: estado ?? "PROSPECTO", contacto, email, telefono, ruc, notas },
    });
    return NextResponse.json(cliente, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
  }
}
