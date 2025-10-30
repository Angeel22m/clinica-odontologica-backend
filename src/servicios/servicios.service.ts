import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  findAll() {
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

  async createServicio(
    nombre: string,
    descripcion: string,
    precio: number,
    activo: boolean,
  ) {
    try {
      if (!nombre || nombre.trim() === '') {
        return { message: 'El nombre es obligatorio', code: 1 };
      }
      if (precio <= 0) {
        return { message: 'El precio debe ser mayor a cero', code: 2 };
      }
      if (
        await this.prisma.servicioClinico.findFirst({
          where: { nombre: nombre },
        })
      ) {
        return { message: 'El servicio ya existe', code: 3 };
      }
      const nuevoServicio = await this.prisma.servicioClinico.create({
        data: {
          nombre,
          descripcion,
          precio,
          activo,
        },
      });
      return { message: nuevoServicio, code: 0 };
    } catch (error) {
      console.error('Error al actualizar el servicio:', error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }

  async updateServicio(
    id: number,
    nombre?: string,
    descripcion?: string,
    precio?: number,
    activo?: boolean,
  ) {
    try {
      const servicio = await this.prisma.servicioClinico.findUnique({
        where: { id: id },
      });
      if (!servicio) {
        return { message: 'El servicio no existe', code: 4 };
      }
      if (precio !== undefined && precio <= 0) {
        return { message: 'El precio debe ser mayor a cero', code: 2 };
      }
      const data: any = {};
      if (nombre !== undefined) data.nombre = nombre;
      if (descripcion !== undefined) data.descripcion = descripcion;
      if (precio !== undefined) data.precio = precio;
      if (activo !== undefined) data.activo = activo;

      const updated = await this.prisma.servicioClinico.update({
        where: { id: id },
        data,
      });
      return { message: updated, code: 0 };
    } catch (error) {
      console.error('Error al actualizar el servicio:', error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }
}
