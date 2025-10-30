import { Injectable, NotFoundException,InternalServerErrorException,BadRequestException } from '@nestjs/common';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';




const expedienteInclude = {
      paciente: {
        select: {
          nombre: true,
          apellido: true,
        },
      },
      doctor: {select:{
          persona: {
            select: {             
              nombre: true,
              apellido: true,
            },
          },
        },
      },
    }

@Injectable()
export class ExpedienteService {
  constructor(private prisma: PrismaService) {}

async create(createExpedienteDto: CreateExpedienteDto) {
    
    // 1. Validar que la Persona exista (paciente)
    const personaExists = await this.prisma.persona.findUnique({
      where: { id: createExpedienteDto.pacienteId },
    });
    if (!personaExists) {
      throw new NotFoundException(
        `No se encontró la persona (paciente) con ID ${createExpedienteDto.pacienteId}.`,
      );
    }

    // 2. Validar que el Expediente NO exista (Validación de Unicidad)
    const expedienteExists = await this.prisma.expediente.findUnique({
      where: { pacienteId: createExpedienteDto.pacienteId },  
    });
    if (expedienteExists) {
      throw new BadRequestException(
        `El expediente para el paciente con ID ${createExpedienteDto.pacienteId} ya existe.`,
      );
    }
    
    // 👈 NUEVA LÓGICA: Validar que el Doctor exista (Clave Foránea)
    const doctorExists = await this.prisma.empleado.findUnique({
        where: { id: createExpedienteDto.doctorId },
        select: { id: true, puesto: true } // Opcional: solo traer los IDs
    });

    if (!doctorExists || doctorExists.puesto !== 'DOCTOR') {
        // Podrías refinar esta validación a solo chequear el ID,
        // pero es buena práctica chequear que el empleado sea realmente un doctor.
        throw new NotFoundException(
          `No se encontró un Doctor válido con ID ${createExpedienteDto.doctorId}.`,
        );
    }
    
    // 3. Intentar crear el Expediente
    try {
      const expediente = await this.prisma.expediente.create({
        data: createExpedienteDto
      });
      return expediente;
    } catch (error) {
      // 4. Manejo Genérico del Error (Solo errores inesperados)
      // En este punto, solo deberíamos capturar errores de conexión o del servidor.
      console.error('Error inesperado al crear expediente:', error);
      throw new InternalServerErrorException('Error desconocido al crear el expediente. La validación previa falló o es un error de servidor.', error.message);
    }
}

  async findAll() {
    return this.prisma.expediente.findMany(
      {include: expedienteInclude}
    );
  }

 async findOne(id: number) {
  const expediente = await this.prisma.expediente.findUnique({
    where: { id },
    include: expedienteInclude,
  });

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

  async getHistorialPaciente(pacienteId: number){
  const expedienteDetalles = await this.prisma.expedienteDetalle.findMany({
  where: {
    expediente: { pacienteId },
  },
  orderBy: { fecha: 'desc' },
  include: {
    doctor: {
      select: {
        persona: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    },
  },
});

  if (!expedienteDetalles.length) {
    throw new NotFoundException(`No se encontró historial para el paciente con ID ${pacienteId}`);
  }

  return expedienteDetalles;

}

}
