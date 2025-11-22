// logs.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  async registrarLogout(empleadoId: number) {
    // 1. Buscar el último log del empleado sin logout
    //
    const ultimoLog = await this.prisma.logs.findFirst({
      where: {
        empleadoId,
        logout: null,
      },
      orderBy: {
        login: 'desc',
      },
    });

    if (!ultimoLog) {
      throw new NotFoundException('No existe log activo para este empleado');
    }

    // 2. Actualizar el campo logout
    return await this.prisma.logs.update({
      where: { id: ultimoLog.id },
      data: { logout: new Date() },
    });
  }

  async findAll() {
    return this.prisma.logs.findMany({
      include: { empleado: true },
    });
  }

  async findOne(id: number) {
    const log = await this.prisma.logs.findUnique({
      where: { id },
      include: { empleado: true },
    });
    if (!log) {
      throw new NotFoundException('Log no encontrado');
    }
  }

  async getLogsByEmpleado(empleadoId: number) {
    return this.prisma.logs.findMany({
      where: { empleadoId },
      include: { empleado: true },
    });
  }
}
