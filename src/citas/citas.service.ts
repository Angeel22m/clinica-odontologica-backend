import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';

@Injectable()
export class CitasService {
  constructor(private prisma: PrismaService) {}

  async create(createCitaDto: CreateCitaDto) {
    const { doctorId, pacienteId, fecha } = createCitaDto;
    const doctorExists = await this.prisma.empleado.findUnique({
      where: { id: doctorId },
    });
    if (!doctorExists) {
      return { message: 'Doctor no encontrado', code: 21 };
    }
    const pacienteExists = await this.prisma.user.findUnique({
      where: { id: pacienteId },
    });
    if (!pacienteExists) {
      return { message: 'Paciente no encontrado', code: 22 };
    }
    if (isNaN(new Date(fecha).getTime())) {
      return { message: 'Formato de fecha inválido', code: 23 };
    }
    try {
      const fechaConvertida = new Date(fecha);
      const nuevaCita = await this.prisma.cita.create({
        data: {
          ...createCitaDto,
          fecha: fechaConvertida,
        },
      });
      return {
        message: nuevaCita,
        code: 0,
      };
    } catch (error) {
      console.error('Error al actualizar el servicio:', error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }

  async findAll() {
    return this.prisma.cita.findMany({
      select: {
        id: true,
        fecha: true,
        pacienteId: true,
        paciente: true,
        doctorId: true,
        doctor: true,
        servicioId: true,
        servicio: true,
      },
    });
  }

  async findOne(id: number) {
    const cita = await this.prisma.cita.findUnique({
      where: { id: id },
      select: {
        id: true,
        fecha: true,
        pacienteId: true,
        paciente: true,
        doctorId: true,
        doctor: true,
        servicioId: true,
        servicio: true,
      },
    });
    if (!cita) {
      return { message: 'Cita no encontrada', code: 4 };
    }
    return cita;
  }

  async update(id: number, updateCitaDto: UpdateCitaDto) {
    try {
      const cita = await this.prisma.cita.findUnique({
        where: { id: id },
      });
      if (!cita) {
        return { message: 'Cita no encontrada', code: 4 };
      }
      const citaActualizada = await this.prisma.cita.update({
        where: { id: id },
        data: updateCitaDto,
      });
      return { message: citaActualizada, code: 0 };
    } catch (error) {
      console.error('Error al actualizar el servicio:', error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} cita`;
  }
}
