import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const contratos = await prisma.contrato.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      cliente: { select: { id: true, nombre: true } },
      _count: { select: { gastos: true } },
    },
  });
  return NextResponse.json(contratos);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { clienteId, codigo, descripcion, moneda, montoTotal, fechaInicio, fechaFin, estado, notas } = body;

  if (!clienteId || !descripcion || !montoTotal || !fechaInicio) {
    return NextResponse.json({ error: "Cliente, descripción, monto y fecha de inicio son requeridos" }, { status: 400 });
  }

  const contrato = await prisma.contrato.create({
    data: {
      clienteId,
      codigo: codigo || null,
      descripcion,
      moneda: moneda ?? "SOLES",
      montoTotal: parseFloat(montoTotal),
      fechaInicio: new Date(fechaInicio),
      fechaFin: fechaFin ? new Date(fechaFin) : null,
      estado: estado ?? "ACTIVO",
      notas: notas || null,
    },
    include: { cliente: { select: { id: true, nombre: true } } },
  });

  return NextResponse.json(contrato, { status: 201 });
}
