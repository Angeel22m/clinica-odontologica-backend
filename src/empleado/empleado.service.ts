import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateEmpleadoDto } from './dtoempleado/create-empleado.dto';
import { UpdateEmpleadoDto } from './dtoempleado/update-empleado.dto';

@Injectable()
export class EmpleadoService {
  constructor(private prisma: PrismaService) {}

  async createEmpleado(dto: CreateEmpleadoDto) {
    return this.prisma.empleado.create({
      data: {
        puesto: dto.puesto,
        salario: dto.salario,
        fechaIngreso: dto.fechaIngreso,
        activo: dto.activo,
        persona: {
          // connect to an existing persona by id
          connect: { id: dto.personaId },
        },
      },
      include: { persona: true },
    });
  }

  async findAll() {
    return this.prisma.empleado.findMany({ include: { persona: true } });
  }

  async findOne(id: number) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id },
      include: { persona: true },
    });
    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }
    return empleado;
  }

  async updateEmpleado(id: number, dto: UpdateEmpleadoDto) {
    const empleado = await this.prisma.empleado.findUnique({ where: { id } });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    return this.prisma.empleado.update({
      where: { id },
      data: {
        puesto: dto.puesto ?? empleado.puesto,
        salario: dto.salario ?? empleado.salario,
        fechaIngreso: dto.fechaIngreso ?? empleado.fechaIngreso,
        activo: dto.activo ?? empleado.activo,
      },
      include: { persona: true },
    });
  }

}
 
