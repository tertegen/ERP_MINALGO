import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mes = searchParams.get("mes");
  const anio = searchParams.get("anio");

  const planilla = await prisma.planilla.findMany({
    where: {
      ...(mes && { mes: parseInt(mes) }),
      ...(anio && { anio: parseInt(anio) }),
    },
    orderBy: [{ anio: "desc" }, { mes: "desc" }],
    include: { personal: { select: { id: true, nombre: true, cargo: true } } },
  });

  return NextResponse.json(planilla);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { personalId, mes, anio, sueldo, adicionales, descuentos, notas } = body;

  if (!personalId || !mes || !anio || !sueldo) {
    return NextResponse.json({ error: "Personal, mes, año y sueldo son requeridos" }, { status: 400 });
  }

  const sueldoN = parseFloat(sueldo);
  const adicionalesN = parseFloat(adicionales ?? 0);
  const descuentosN = parseFloat(descuentos ?? 0);
  const total = sueldoN + adicionalesN - descuentosN;

  const registro = await prisma.planilla.create({
    data: {
      personalId,
      mes: parseInt(mes),
      anio: parseInt(anio),
      sueldo: sueldoN,
      adicionales: adicionalesN,
      descuentos: descuentosN,
      total,
      notas: notas || null,
    },
    include: { personal: { select: { id: true, nombre: true, cargo: true } } },
  });

  return NextResponse.json(registro, { status: 201 });
}
