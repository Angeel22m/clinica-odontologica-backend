import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { HorarioLaboral } from '../enums/enums';
import { Prisma } from '@prisma/client';

@Injectable()
export class CitasService {
  constructor(private prisma: PrismaService) {}

  async create(createCitaDto: CreateCitaDto) {
    const { fecha, hora, pacienteId, doctorId, servicioId} = createCitaDto;
    const doctorExists = await this.prisma.empleado.findUnique({
      where: { id: doctorId },
    });
    if (!doctorExists) {
      return { message: 'Doctor no encontrado', code: 21 };
    }
    const pacienteExists = await this.prisma.persona.findUnique({
      where: { id: pacienteId },
    });
    if (!pacienteExists) {
      return { message: 'Paciente no encontrado', code: 22 };
    }
    if (isNaN(new Date(fecha).getTime())) {
      return { message: 'Formato de fecha inválido', code: 23 };
    }
    const fechaConvertida = new Date(fecha);
    if (fechaConvertida < new Date()) {
      return { message: 'No se puede agendar una cita en el pasado', code: 25 };
    }
    if (!hora || !Object.values(HorarioLaboral).includes(hora)) {
      return { message: 'Hora inválida', code: 26 };
    }
    const citaExistente = await this.prisma.cita.findFirst({
      where: {
        fecha: fechaConvertida,
        doctorId: doctorId,
        hora: hora,
      },
    });
    if (citaExistente) {
      return {
        message: 'El doctor ya tiene una cita en ese horario',
        code: 24,
      };
    }
    const citaPaciente = await this.prisma.cita.findFirst({
      where: { fecha: fechaConvertida, hora, pacienteId },
    });
    if (citaPaciente) {
      return {
        message: 'El paciente ya tiene una cita en ese horario',
        code: 28,
      };
    }
    try {
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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return {
          message: 'El doctor ya tiene una cita en ese horario',
          code: 24,
        };
      }
      console.error('Error al actualizar el servicio:', error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }

  async findAll(filtros: {fecha?: string}) {
    const where: any = {};

    if (filtros.fecha) {
    
      const start = new Date(`${filtros.fecha}T00:00:00.000Z`);
      start.setHours(0, 0, 0, 0);

      const end = new Date(`${filtros.fecha}T23:59:59.999Z`);
      end.setHours(23, 59, 59, 999);

      where.fecha = {
        gte: start,
        lte: end,
      };
    }

    return this.prisma.cita.findMany({
      where,
      include: {
        doctor: true,
        servicio: true,
        paciente: true,
      },
      orderBy: {
        hora: 'asc',
      },
    });
  }

async getDoctoresDisponibles(fecha: string) {

  const fechaInicio = new Date(`${fecha}T00:00:00.000Z`);
  //fechaInicio.setHours(0, 0, 0, 0);

  const fechaFin = new Date(`${fecha}T23:59:59.999Z`);
  //fechaFin.setHours(23, 59, 59, 999);

  const horariosLaborales = Object.values(HorarioLaboral) as string[];

  // 1. Obtener doctores
  const doctores = await this.prisma.empleado.findMany({
    where: { 
      puesto: "DOCTOR",
      activo: true,
    },
    include: {
      persona: true,
    },
  });

  const citasDelDia = await this.prisma.cita.findMany({
    where: {
      fecha: {
        gte: fechaInicio,
        lte: fechaFin,
      },
    },
    select: {
      doctorId: true,
      hora: true,
    }
  });
  
  const citasPorDoctor = new Map<number, string[]>();
  for (const c of citasDelDia) {
    const arr = citasPorDoctor.get(c.doctorId) ?? [];
    arr.push(c.hora);
    citasPorDoctor.set(c.doctorId, arr);
  }

  const disponibles: {id: number; nombre:string }[] = [];

  for (const doctor of doctores) {
    //const citasDelDoctor = citas.filter(c => c.doctorId === doctor.id);
    const horasOcupadas = citasPorDoctor.get(doctor.id) ?? [];

    const horasLibres = horariosLaborales.filter(
      hora => !horasOcupadas.includes(hora)
    );

    if (horasLibres.length > 0) {
      const nombreCompleto = doctor.persona 
      ? `${doctor.persona.nombre} ${doctor.persona.apellido ?? ''}`.trim()
      : `Doctor ${doctor.id}`;
    
      disponibles.push({
        id: doctor.id,
        nombre: nombreCompleto,
      });
    }
  }

  return disponibles;
}


async getHorasDisponibles(doctorId: number, fecha: string) {
  console.log(typeof doctorId);
  
  const fechaObj = new Date(fecha + 'T00:00:00Z');
  if (isNaN(fechaObj.getTime())) {
    throw new Error('fecha invalida');
  }

  const fechaInicio = new Date(fechaObj);
  fechaInicio.setHours(0, 0, 0, 0);
  const fechaFin = new Date(fechaObj);
  fechaFin.setHours(23, 59, 59, 999);

  const horariosLaborales = Object.values(HorarioLaboral);

  const citas = await this.prisma.cita.findMany({
    where: {
      doctorId,
      fecha: {
        gte: fechaInicio,
        lte: fechaFin,
      },
    },
  });

  const horasOcupadas = citas.map(c => c.hora);

  const horasDisponibles = horariosLaborales.filter(
    hora => !horasOcupadas.includes(hora)
  );

  return horasDisponibles;
}

//obteniendo citas por id del paciente
  async getCitasPorPaciente(pacienteId: number) {
    const paciente = await this.prisma.persona.findUnique({
      where: { id: pacienteId },
    });
    
    if (!paciente) {
      return {message: 'Paciente no encontrado', code: 22};
    }
    
    const citas = await this.prisma.cita.findMany({
      where : {
        pacienteId,
        estado: 'PENDIENTE',
      },
      include: {
        doctor: {
          include: {
            persona: true,
          },
        },
        servicio: true,
      }, orderBy: [
        { fecha: 'asc'},
        { hora: 'asc'}
      ],
    });
    
    return citas;
  }




  async findOne(id: number) {
    const cita = await this.prisma.cita.findUnique({
      where: { id: id },
    });
    if (!cita) {
      return { message: 'Cita no encontrada', code: 4 };
    }
    return cita;
  }

  async update(id: number, updateCitaDto: UpdateCitaDto) {
    const { fecha } = updateCitaDto;
    const cita = await this.prisma.cita.findUnique({
      where: { id: id },
    });
    if (!cita) {
      return { message: 'Cita no encontrada', code: 4 };
    }
    if (updateCitaDto.doctorId) {
      const doctorExists = await this.prisma.empleado.findUnique({
        where: { id: updateCitaDto.doctorId },
      });
      if (!doctorExists) return { message: 'Doctor no encontrado', code: 21 };
    }
    if (updateCitaDto.pacienteId) {
      const pacienteExists = await this.prisma.persona.findUnique({
        where: { id: updateCitaDto.pacienteId },
      });
      if (!pacienteExists)
        return { message: 'Paciente no encontrado', code: 22 };
    }
    if (
      updateCitaDto.hora &&
      !Object.values(HorarioLaboral).includes(updateCitaDto.hora)
    ) {
      return { message: 'Hora inválida', code: 26 };
    }
    if (updateCitaDto.fecha) {
      const fechaNueva = new Date(updateCitaDto.fecha);
      if (fechaNueva < new Date()) {
        return {
          message: 'No se puede agendar una cita en el pasado',
          code: 25,
        };
      }
    }
    try {
      const dataToUpdate: any = { ...updateCitaDto };
      if (fecha) {
        dataToUpdate.fecha = new Date(fecha);
      }
      if (dataToUpdate.fecha || dataToUpdate.hora || dataToUpdate.doctorId) {
        const fechaCheck = dataToUpdate.fecha || cita.fecha;
        const horaCheck = dataToUpdate.hora || cita.hora;
        const doctorCheck = dataToUpdate.doctorId || cita.doctorId;

        const citaExistente = await this.prisma.cita.findFirst({
          where: {
            fecha: fechaCheck,
            hora: horaCheck,
            doctorId: doctorCheck,
            NOT: { id },
          },
        });

        if (citaExistente) {
          return {
            message: 'El doctor ya tiene una cita en ese horario',
            code: 24,
          };
        }
      }
      const citaActualizada = await this.prisma.cita.update({
        where: { id: id },
        data: dataToUpdate,
      });
      return { message: citaActualizada, code: 0 };
    } catch (error) {
      console.error('Error al actualizar el servicio:', error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }

  // obtener las citas por doctor
  async getCitasForDoctor(doctorId: number) {
  try {
    const citas = await this.prisma.cita.findMany({
      where: {
        doctorId: doctorId      
      },
     
      include:{
        servicio:true,
        paciente: true,        
      }

    });    
    if (citas.length === 0) {     
        return [];
    }

    return citas;
  } catch (error) {  
    console.error(`Error al obtener citas para el doctor ${doctorId}:`, error);
    throw new Error('No se pudieron recuperar las citas debido a un error en la base de datos.');
  }
}
}
