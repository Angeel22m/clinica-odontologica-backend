import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExpedienteArchivo } from '@prisma/client';

type CreateExpedienteArchivoDto = Omit<ExpedienteArchivo, 'id' | 'createdAt' | 'updatedAt'>;

@Injectable()
export class ExpedienteArchivoService {
  constructor(private prisma: PrismaService) {}

  // ======================================================================
  // Validar que existan las FK antes de crear un registro
  // ======================================================================
  async validateFks(expedienteId: number, creadoPorId: number): Promise<void> {
    // Validar existencia del Expediente
    const expediente = await this.prisma.expediente.findUnique({
      where: { id: expedienteId },
      select: { id: true }
    });
    if (!expediente) {
      throw new NotFoundException(`Expediente con ID ${expedienteId} no encontrado. No se puede iniciar la subida.`);
    }

    // Validar existencia del Empleado (Creador)
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: creadoPorId },
      select: { id: true }
    });
    if (!empleado) {
      throw new NotFoundException(`Empleado (creador) con ID ${creadoPorId} no encontrado.`);
    }
}

  // ======================================================================
  // Crea un nuevo registro en epedienteArchivo
  // ======================================================================
  async create(data: CreateExpedienteArchivoDto): Promise<ExpedienteArchivo> {
    const { expedienteId, creadoPorId } = data;
    return this.prisma.expedienteArchivo.create({ data });
  }

  // ======================================================================
  // Obtener archivos por el id del expediente
  // ======================================================================
  
  async findByExpediente(expedienteId: number): Promise<ExpedienteArchivo[]> {
    return this.prisma.expedienteArchivo.findMany({ 
        where: { expedienteId },
        orderBy: { createdAt: 'desc' },
    });
  }
  
  // ======================================================================
  // Obtener un archivo por su id
  // ======================================================================
  async findOne(id: number): Promise<ExpedienteArchivo> {
    const file = await this.prisma.expedienteArchivo.findUnique({ where: { id } });
    if (!file) {
        throw new NotFoundException(`Registro de archivo con ID ${id} no encontrado en la DB.`);
    }
    return file;
  }
  
  async delete(id: number): Promise<ExpedienteArchivo> {
    // Nota: El método delete en Prisma devolverá un error si el ID no existe,
    // pero si se llama desde StorageService, findOne ya habrá validado la existencia.
    return this.prisma.expedienteArchivo.delete({ where: { id } });
  }
}