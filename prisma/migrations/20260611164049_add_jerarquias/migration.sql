-- CreateEnum
CREATE TYPE "LadoJerarquia" AS ENUM ('MINALGO', 'CLIENTE');

-- CreateTable
CREATE TABLE "Jerarquia" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "clienteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jerarquia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NodoJerarquia" (
    "id" TEXT NOT NULL,
    "jerarquiaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT,
    "lado" "LadoJerarquia" NOT NULL DEFAULT 'MINALGO',
    "parentId" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NodoJerarquia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Jerarquia" ADD CONSTRAINT "Jerarquia_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodoJerarquia" ADD CONSTRAINT "NodoJerarquia_jerarquiaId_fkey" FOREIGN KEY ("jerarquiaId") REFERENCES "Jerarquia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodoJerarquia" ADD CONSTRAINT "NodoJerarquia_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NodoJerarquia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
