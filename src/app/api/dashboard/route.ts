import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    totalClientes,
    clientesActivos,
    contratosActivos,
    totalContratos,
    pipelineItems,
    eventosProximos,
    planillaMesActual,
  ] = await Promise.all([
    prisma.cliente.count(),
    prisma.cliente.count({ where: { estado: "ACTIVO" } }),
    prisma.contrato.count({ where: { estado: "ACTIVO" } }),
    prisma.contrato.count(),
    prisma.pipeline.findMany({
      where: { etapa: { notIn: ["GANADO", "PERDIDO"] } },
      select: { montoEstimado: true, moneda: true, probabilidad: true, etapa: true },
    }),
    prisma.evento.findMany({
      where: { fechaInicio: { gte: new Date() } },
      orderBy: { fechaInicio: "asc" },
      take: 5,
      select: { id: true, titulo: true, tipo: true, fechaInicio: true, lugar: true },
    }),
    prisma.planilla.aggregate({
      where: {
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear(),
      },
      _sum: { total: true },
    }),
  ]);

  const valorPipeline = pipelineItems.reduce((acc, item) => {
    if (!item.montoEstimado) return acc;
    const monto = Number(item.montoEstimado);
    const prob = (item.probabilidad ?? 100) / 100;
    return acc + monto * prob;
  }, 0);

  const pipelinePorEtapa = {
    CONTACTO_INICIAL: pipelineItems.filter((i) => i.etapa === "CONTACTO_INICIAL").length,
    PROPUESTA_ENVIADA: pipelineItems.filter((i) => i.etapa === "PROPUESTA_ENVIADA").length,
    NEGOCIACION: pipelineItems.filter((i) => i.etapa === "NEGOCIACION").length,
  };

  return NextResponse.json({
    clientes: { total: totalClientes, activos: clientesActivos },
    contratos: { activos: contratosActivos, total: totalContratos },
    pipeline: { valor: valorPipeline, items: pipelineItems.length, porEtapa: pipelinePorEtapa },
    planilla: { totalMes: Number(planillaMesActual._sum.total ?? 0) },
    eventosProximos,
  });
}
