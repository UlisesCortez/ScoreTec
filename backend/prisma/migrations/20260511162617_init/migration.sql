-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ARBITRO');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PROXIMO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('GOL', 'PUNTO', 'ENCESTA', 'FALTA', 'TARJETA_AMARILLA', 'TARJETA_ROJA', 'TIEMPO_FUERA', 'ASISTENCIA', 'OTRO');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Role" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discipline" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "escudoUrl" TEXT,
    "entrenador" TEXT,
    "disciplinaId" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "numero" INTEGER,
    "posicion" TEXT,
    "fotoUrl" TEXT,
    "equipoId" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "disciplinaId" INTEGER NOT NULL,
    "equipoLocalId" INTEGER NOT NULL,
    "equipoVisitanteId" INTEGER NOT NULL,
    "arbitroId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL,
    "ubicacionNombre" TEXT,
    "ubicacionDireccion" TEXT,
    "ubicacionMapaUrl" TEXT,
    "estado" "MatchStatus" NOT NULL DEFAULT 'PROXIMO',
    "marcadorLocal" INTEGER NOT NULL DEFAULT 0,
    "marcadorVisitante" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "partidoId" INTEGER NOT NULL,
    "equipoId" INTEGER NOT NULL,
    "jugadorId" INTEGER,
    "tipo" "EventType" NOT NULL,
    "minuto" INTEGER,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_equipoLocalId_fkey" FOREIGN KEY ("equipoLocalId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_equipoVisitanteId_fkey" FOREIGN KEY ("equipoVisitanteId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_arbitroId_fkey" FOREIGN KEY ("arbitroId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
