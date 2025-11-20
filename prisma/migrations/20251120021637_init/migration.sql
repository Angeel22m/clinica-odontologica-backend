-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'DOCTOR', 'RECEPCIONISTA', 'CLIENTE');

-- CreateEnum
CREATE TYPE "Puesto" AS ENUM ('DOCTOR', 'RECEPCIONISTA', 'ADMINISTRADOR', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('PENDIENTE', 'COMPLETADA', 'CANCELADA', 'CONFIRMADA');

-- CreateEnum
CREATE TYPE "HorarioLaboral" AS ENUM ('H08_00', 'H08_30', 'H09_00', 'H09_30', 'H10_00', 'H10_30', 'H11_00', 'H11_30', 'H13_00', 'H13_30', 'H14_00', 'H14_30', 'H15_00', 'H15_30', 'H16_00', 'H16_30');

-- CreateTable
CREATE TABLE "Persona" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "fechaNac" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT,
    "rol" "Rol" NOT NULL DEFAULT 'CLIENTE',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "personaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empleado" (
    "id" SERIAL NOT NULL,
    "personaId" INTEGER NOT NULL,
    "puesto" "Puesto" NOT NULL,
    "salario" DOUBLE PRECISION NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicioClinico" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicioClinico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expediente" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "alergias" TEXT,
    "enfermedades" TEXT,
    "medicamentos" TEXT,
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expediente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpedienteDoctor" (
    "expedienteId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "fechaAsociacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpedienteDoctor_pkey" PRIMARY KEY ("expedienteId","doctorId")
);

-- CreateTable
CREATE TABLE "ExpedienteDetalle" (
    "id" SERIAL NOT NULL,
    "expedienteId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "diagnostico" TEXT,
    "tratamiento" TEXT,
    "planTratamiento" TEXT,
    "doctorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpedienteDetalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpedienteArchivo" (
    "id" SERIAL NOT NULL,
    "expedienteId" INTEGER NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "tipoArchivo" TEXT,
    "creadoPorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "filePath" TEXT NOT NULL,
    "storageName" TEXT NOT NULL,

    CONSTRAINT "ExpedienteArchivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cita" (
    "id" SERIAL NOT NULL,
    "fecha" TEXT NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'PENDIENTE',
    "pacienteId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "servicioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hora" TEXT NOT NULL,

    CONSTRAINT "Cita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialCancelacionCita" (
    "id" SERIAL NOT NULL,
    "citaId" INTEGER NOT NULL,
    "motivoCancelacion" TEXT NOT NULL,
    "usuarioCancelaId" INTEGER NOT NULL,
    "rolCancela" VARCHAR(50) NOT NULL,
    "fechaCancelacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialCancelacionCita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_correo_key" ON "User"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "User_personaId_key" ON "User"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "Empleado_personaId_key" ON "Empleado"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "Expediente_pacienteId_key" ON "Expediente"("pacienteId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpedienteArchivo_storageName_key" ON "ExpedienteArchivo"("storageName");

-- CreateIndex
CREATE UNIQUE INDEX "HistorialCancelacionCita_citaId_key" ON "HistorialCancelacionCita"("citaId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expediente" ADD CONSTRAINT "Expediente_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpedienteDoctor" ADD CONSTRAINT "ExpedienteDoctor_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExpedienteDoctor" ADD CONSTRAINT "ExpedienteDoctor_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "Expediente"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExpedienteDetalle" ADD CONSTRAINT "ExpedienteDetalle_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpedienteDetalle" ADD CONSTRAINT "ExpedienteDetalle_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "Expediente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpedienteArchivo" ADD CONSTRAINT "ExpedienteArchivo_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpedienteArchivo" ADD CONSTRAINT "ExpedienteArchivo_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "Expediente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "ServicioClinico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialCancelacionCita" ADD CONSTRAINT "HistorialCancelacionCita_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "Cita"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
