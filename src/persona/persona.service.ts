import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonaDto } from './dtopersona/crete-persona';
import { UpdatePersonaDto } from './dtopersona/update-persona';
import { Prisma } from '@prisma/client';

@Injectable()
export class PersonaService {
  constructor(private prisma: PrismaService) {}

  //  Crear persona
  async createPersona(creratePersonaDto: CreatePersonaDto) {
    return this.prisma.persona.create({ data: creratePersonaDto });
  }

   async findAll() {
    return this.prisma.persona.findMany();
  }

  async findOne(id: number) {
    const persona = await this.prisma.persona.findUnique({
      where: { id },});

    if (!persona) {
      throw new NotFoundException(`Expediente con ID ${id} no encontrado`);
    }
    return persona;
  }

  //  Actualizar persona
  async updatePersona(id: number, dto: UpdatePersonaDto) {
    const persona = await this.prisma.persona.findUnique({ where: { id } });

    if (!persona) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }

    return this.prisma.persona.update({
      where: { id },
      data: {
        nombre: dto.nombre ?? persona.nombre,
        apellido: dto.apellido ?? persona.apellido,
        dni: dto.dni ?? persona.dni,
        telefono: dto.telefono ?? persona.telefono,
        direccion: dto.direccion ?? persona.direccion,
        fechaNac: dto.fechaNac ?? persona.fechaNac,
      },
    });
  }
}
