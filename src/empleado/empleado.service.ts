import { Injectable,NotFoundException,BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpleadoDto } from './dtoempleado/create-empleado.dto';
import { UpdateEmpleadoDto } from './dtoempleado/update-empleado.dto';
import * as bcrypt from 'bcrypt';



@Injectable()
export class EmpleadoService {
  constructor(private prisma: PrismaService) {}

  // src/empleado/empleado.service.ts
async createEmpleado(dto: CreateEmpleadoDto) {
  return this.prisma.$transaction(async (tx) => {

     // 1️ Validar que el DNI no exista
    const dniExists = await tx.persona.findFirst({
      where: { dni: dto.dni },
    });

    if (dniExists) {
      throw new BadRequestException(`El DNI ${dto.dni} ya está registrado.`);
    }

    // 2️ Validar que el correo no exista
    const correoExists = await tx.user.findUnique({
      where: { correo: dto.correo },
    });
    if (correoExists) {
      throw new BadRequestException(`El correo ${dto.correo} ya está registrado.`);
    }

    // 1 crear la persona 
    const newpersona = await tx.persona.create({
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        dni: dto.dni,
        telefono: dto.telefono,
        direccion: dto.direccion,
        fechaNac: dto.fechaNac,
      },
    });

    // 2 Crear el empleado
    const empleado = await tx.empleado.create({
      data: {
        personaId: newpersona.id,
        puesto: dto.puesto,
        salario: dto.salario,
        fechaIngreso: dto.fechaIngreso,
        activo: dto.activo,
      },
    });

    // 3 Crear el usuario vinculado
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const usuario = await tx.user.create({
      data: {
        correo: dto.correo,
        password: hashedPassword, //  Aquí puedes aplicar hash si usas bcrypt
        rol: dto.rol,
        activo: dto.usuarioActivo ?? true,
        personaId:  newpersona.id,
      },
    });

    return { empleado, usuario, newpersona };
  });
}

  async findAll() {
    return this.prisma.empleado.findMany({ include: { persona: true } });
  }

 // src/empleado/empleado.service.ts

async findAllCompleto() {
  return this.prisma.empleado.findMany({
    include: {
      persona: true,
    },
  });
}

// src/empleado/empleado.service.ts
async UpdateEmpleado(id: number, dto: Partial<UpdateEmpleadoDto>) {
  return this.prisma.$transaction(async (tx) => {

    // 1️ Buscar el empleado existente
    const empleadoExistente = await tx.empleado.findUnique({
      where: { personaId: id },
      include: { persona: true },
    });


     // 1️ Validar que el DNI no exista
    const dniExists = await tx.persona.findFirst({
      where: { dni: dto.dni },
    });
    console.log(`${dniExists?.dni}=${dto.dni}`)
    if (dniExists&&dniExists.id!==id) {
      throw new BadRequestException(`El DNI ${dto.dni} ya está registrado.`);
    }

    const personaId = empleadoExistente?.personaId;

    // 2️ Actualizar Persona
    const personaActualizada = await tx.persona.update({
      where: { id: personaId },
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        dni: dto.dni,
        telefono: dto.telefono,
        direccion: dto.direccion,
        fechaNac: dto.fechaNac,
      },
    });

    // 3️ Actualizar Empleado
    const empleadoActualizado = await tx.empleado.update({
      where: { personaId },
      data: {
        puesto: dto.puesto,
        salario: dto.salario,
        fechaIngreso: dto.fechaIngreso,
        activo: dto.activo,
      },
    });

    // 4️ Actualizar Usuario (si existe)
    const usuarioExistente = await tx.user.findFirst({
      where: { personaId },
    });

    let usuarioActualizado: any = null;
    if (usuarioExistente) {
      let passwordHashed = usuarioExistente.password;

      //  Si el DTO incluye una nueva contraseña, la encriptamos
      if (dto.password) {
        const saltRounds = 10;
        passwordHashed = await bcrypt.hash(dto.password, saltRounds);
      }

      usuarioActualizado = await tx.user.update({
        where: { id: usuarioExistente.id },
        data: {
          correo: dto.correo ?? usuarioExistente.correo,
          password: passwordHashed,
          rol: dto.rol ?? usuarioExistente.rol,
          activo: dto.usuarioActivo ?? usuarioExistente.activo,
        },
      });
    }

    // 5️ Retornar datos combinados
    return {
      persona: personaActualizada,
      empleado: empleadoActualizado,
      usuario: usuarioActualizado,
    };
  });
}

}

 




  


