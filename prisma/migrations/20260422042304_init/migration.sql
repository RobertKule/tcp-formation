-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'MOBILE_MONEY');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REJETTE');

-- CreateTable
CREATE TABLE "Formation" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "prix" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Formation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidat" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "postnom" TEXT NOT NULL,
    "prenom" TEXT,
    "adresse" TEXT,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "modePaiement" "PaymentMode" NOT NULL,
    "montant" DOUBLE PRECISION,
    "capturePaiementUrl" TEXT,
    "statut" "CandidateStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "formationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Candidat" ADD CONSTRAINT "Candidat_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
