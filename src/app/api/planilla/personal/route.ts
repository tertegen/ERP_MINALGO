import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const personal = await prisma.personal.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { planilla: true } } },
  });
  return NextResponse.json(personal);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { nombre, cargo, dni, email, telefono } = body;

  if (!nombre || !cargo) {
    return NextResponse.json({ error: "Nombre y cargo son requeridos" }, { status: 400 });
  }

  const persona = await prisma.personal.create({
    data: { nombre, cargo, dni: dni || null, email: email || null, telefono: telefono || null },
  });

  return NextResponse.json(persona, { status: 201 });
}
