import { Injectable } from '@nestjs/common';
import { CreateServiciosDto } from './dto/create_servicios.dto';
import { UpdateServiciosDto } from './dto/update_servicios.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.servicioClinico.findMany({
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        precio: true,
        activo: true,
      },
    });
  }

  async findOne(id: number) {
    const servicio = await this.prisma.servicioClinico.findUnique({
      where: { id: id },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        precio: true,
        activo: true,
      },
    });
    if (!servicio) {
      return { message: 'Servicio no encontrado', code: 4 };
    }
    return servicio;
  }

  async createServicio(createServiciosDto: CreateServiciosDto) {
    const servicioExistente = await this.prisma.servicioClinico.findFirst({
      where: { nombre: createServiciosDto.nombre },
    });
    if (servicioExistente) {
      return { message: 'El servicio ya existe', code: 3 };
    }
    if (!createServiciosDto.nombre || createServiciosDto.nombre.trim() === '') {
      return { message: 'El nombre es obligatorio', code: 1 };
    }
    if (createServiciosDto.precio <= 0) {
      return { message: 'El precio debe ser mayor a cero', code: 2 };
    }
    try {
      const nuevoServicio = await this.prisma.servicioClinico.create({
        data: createServiciosDto,
      });
      return { message: nuevoServicio, code: 0 };
    } catch (error) {
      console.error('Error al actualizar el servicio:', error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }

  async updateServicio(id: number, updateServiciosDto: UpdateServiciosDto) {
    try {
      const servicio = await this.prisma.servicioClinico.findUnique({
        where: { id: id }});
      const servicioExistente = await this.prisma.servicioClinico.findFirst({
        where: { nombre: updateServiciosDto.nombre }});
      if (!servicio) {
        return { message: 'El servicio no existe', code: 4 };
      }
      if (servicioExistente) {
        return { message: 'Servicio existente', code: 6 }
      }
      if (
        updateServiciosDto.precio !== undefined &&
        updateServiciosDto.precio <= 0
      ) {
        return { message: 'El precio debe ser mayor a cero', code: 2 };
      }
      const updated = await this.prisma.servicioClinico.update({
        where: { id: id },
        data: updateServiciosDto,
      });
      return { message: updated, code: 0 };
    } catch (error) {
      console.error('Error al actualizar el servicio:', error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }

  async deleteServicio(id: number) {
    try {
      const citasAsociadas = await this.prisma.cita.findFirst({
        where: { servicioId: id },
      });
      if (citasAsociadas) {
        return {
          message:
            'No se puede eliminar el servicio porque tiene citas asociadas',
          code: 5,
        };
      }

      await this.prisma.servicioClinico.delete({ where: { id: id } });

      return { message: 'Servicio eliminado correctamente', code: 0 };
    } catch (error) {
      console.error('Error al eliminar el servicio:', error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }
}
