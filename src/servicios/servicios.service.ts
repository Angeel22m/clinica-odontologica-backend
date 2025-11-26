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
        especialidades: { select: { especialidad: true } },
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
        especialidades: { select: { especialidad: true } },
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

    // Manejo de especialidades: se espera un arreglo de ids en createServiciosDto.especialidadIds
    const especialidadIds = Array.isArray(createServiciosDto.especialidadIds)
      ? Array.from(new Set(createServiciosDto.especialidadIds.map(Number))) // dedupe + ensure number
      : [];

    if (especialidadIds.length > 0) {
      // Validar que existan todas las especialidades
      const found = await this.prisma.especialidad.findMany({
        where: { id: { in: especialidadIds } },
        select: { id: true },
      });
      if (found.length !== especialidadIds.length) {
        return { message: 'Alguna especialidad no existe', code: 7 };
      }
    }

    try {
      // Construir data sin la propiedad especialidadIds
      const { especialidadIds: _es, ...servicioData } = createServiciosDto as any;

      const nuevoServicio = await this.prisma.servicioClinico.create({
        data: {
          ...servicioData,
          // Si vienen especialidades, crear las relaciones en la tabla ServicioEspecialidad
          ...(especialidadIds.length > 0
            ? {
                especialidades: {
                  createMany: {
                    data: especialidadIds.map((eid) => ({ especialidadId: eid })),
                  },
                },
              }
            : {}),
        },
        include: {
          especialidades: { include: { especialidad: true } },
        },
      });
      return { message: nuevoServicio, code: 0 };
    } catch (error) {
      console.error('Error al crear el servicio:', error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }

  async updateServicio(id: number, updateServiciosDto: UpdateServiciosDto) {
    try {
      const servicio = await this.prisma.servicioClinico.findUnique({
        where: { id: id },
      });

      if (!servicio) {
        return { message: 'El servicio no existe', code: 4 };
      }

      // Verificar si el nombre ya existe (y no es el mismo servicio)
      if (
        updateServiciosDto.nombre &&
        updateServiciosDto.nombre !== servicio.nombre
      ) {
        const servicioExistente = await this.prisma.servicioClinico.findFirst({
          where: { nombre: updateServiciosDto.nombre },
        });
        if (servicioExistente) {
          return { message: 'Servicio existente', code: 6 };
        }
      }

      // Validar precio si viene
      if (
        updateServiciosDto.precio !== undefined &&
        updateServiciosDto.precio <= 0
      ) {
        return { message: 'El precio debe ser mayor a cero', code: 2 };
      }

      // Manejo de especialidades si vienen en el DTO
      const especialidadIdsProvided = Array.isArray(updateServiciosDto.especialidadIds)
        ? Array.from(new Set(updateServiciosDto.especialidadIds.map(Number)))
        : undefined;

      if (especialidadIdsProvided !== undefined && especialidadIdsProvided.length > 0) {
        // validar existencia de las especialidades
        const found = await this.prisma.especialidad.findMany({
          where: { id: { in: especialidadIdsProvided } },
          select: { id: true },
        });
        if (found.length !== especialidadIdsProvided.length) {
          return { message: 'Alguna especialidad no existe', code: 7 };
        }
      }

      // Filtrar solo los campos definidos (sin especialidadIds)
      const dataToUpdate = Object.fromEntries(
        Object.entries(updateServiciosDto).filter(([key, v]) => v !== undefined && key !== 'especialidadIds')
      );

      // Si vienen especialidadIds, reemplazamos las relaciones en transacción (elimina y crea)
      if (especialidadIdsProvided !== undefined) {
        const txOps: any[] = [
          this.prisma.servicioEspecialidad.deleteMany({ where: { servicioId: id } }),
        ];
        if (especialidadIdsProvided.length > 0) {
          txOps.push(
            this.prisma.servicioEspecialidad.createMany({
              data: especialidadIdsProvided.map((eid) => ({ servicioId: id, especialidadId: eid })),
            })
          );
        }
        // Finalmente actualizar el servicio y devolverlo con relaciones
        txOps.push(
          this.prisma.servicioClinico.update({
            where: { id },
            data: dataToUpdate,
            include: { especialidades: { include: { especialidad: true } } },
          })
        );

        const results = await this.prisma.$transaction(txOps);
        const updated = results[results.length - 1];
        return { message: updated, code: 0 };
      }

      // Caso sin tocar especialidades: solo actualizar campos del servicio
      const updated = await this.prisma.servicioClinico.update({
        where: { id: id },
        data: dataToUpdate,
        include: { especialidades: { include: { especialidad: true } } },
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

      // eliminar primero relaciones en la tabla intermedia por seguridad (aunque cascade puede manejarlo)
      await this.prisma.servicioEspecialidad.deleteMany({ where: { servicioId: id } });

      await this.prisma.servicioClinico.delete({ where: { id: id } });

      return { message: 'Servicio eliminado correctamente', code: 0 };
    } catch (error) {
      console.error('Error al eliminar el servicio:', error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }
}
