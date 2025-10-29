import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExpedienteService {
  constructor(private prisma: PrismaService) {}

  async create(createExpedienteDto: CreateExpedienteDto) {
    return this.prisma.expediente.create({ data: createExpedienteDto });
  }

  async findAll() {
    return this.prisma.expediente.findMany();
  }

  async findOne(id: number) {
    const expediente = await this.prisma.expediente.findUnique({
      where: { id },});

    if (!expediente) {
      throw new NotFoundException(`Expediente con ID ${id} no encontrado`);
    }
    return expediente;
  }

  async update(id: number, updateExpedienteDto: UpdateExpedienteDto) {
    try {
      return await this.prisma.expediente.update({
        where: { id },
        data: updateExpedienteDto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`No se encontró el expediente con ID ${id}`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.expediente.delete({
        where: { id },
      });

      return {message: "Expediente eliminado correctamente"        
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`No se encontró el expediente con ID ${id}`);
      }
      throw error;
    }
  }
}
