import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateModificarInfoDto } from './dtoModificar/update.modificarInfo';
import * as bcrypt from 'bcrypt';

type SearchCriterion = {
  correo?: string;
  dni?: string;
  telefono?: string;
};

@Injectable()
export class ModificarInfoService {
  constructor(private prisma: PrismaService) { }

  private async findUserByCriterion(criterion: SearchCriterion) {
    if (criterion.correo) {
      return this.prisma.user.findUnique({
        where: { correo: criterion.correo },
        include: { persona: true },
      });
    }

    const persona = await this.prisma.persona.findFirst({
      where: {
        OR: [
          criterion.dni ? { dni: criterion.dni } : undefined,
          criterion.telefono ? { telefono: criterion.telefono } : undefined,
        ].filter(Boolean) as any, // Filtramos undefined para asegurar un WHERE válido
      },
      include: {
        user: true,
      },
    });

    return persona?.user ? { ...persona.user, persona: persona } : null;
  }

  private async validateAndReturnClient(
    criterion: SearchCriterion,
    value: string,
  ): Promise<any> {
    const user = await this.findUserByCriterion(criterion);

    const key = Object.keys(criterion)[0]; // Obtiene 'correo', 'dni' o 'telefono'

    // Validar existencia
    if (!user) {
      throw new NotFoundException(
        `No existe un cliente registrado con el ${key}: ${value}`,
      );
    }

    // Validar rol (solo clientes)
    if (user.rol !== 'CLIENTE') {
      throw new BadRequestException(
        `El usuario asociado al ${key} ${value} no tiene el rol de cliente.`,
      );
    }

    // Retornar el usuario con la data de la persona anidada
    return user;
  }

  // --------------------------------------------------------------------------
  // Métodos Públicos
  // --------------------------------------------------------------------------

  async buscarPorCorreo(correo: string) {
    return this.validateAndReturnClient({ correo }, correo);
  }

  async buscarPorDni(dni: string) {
    return this.validateAndReturnClient({ dni }, dni);
  }

  async buscarPorTelefono(telefono: string) {
    return this.validateAndReturnClient({ telefono }, telefono);
  }

  async completarDatosPorCorreo(correo: string, data: UpdateModificarInfoDto) {
    const user = await this.prisma.user.findUnique({
      where: { correo },
      include: { persona: true },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }

    const camposValidos = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== null && value !== '' && value !== undefined,
      ),
    );

    if (Object.keys(camposValidos).length === 0) {
      throw new BadRequestException('No se enviaron datos para actualizar.');
    }

    if (camposValidos.telefono) {
      const existeTel = await this.prisma.persona.findFirst({
        where: {
          telefono: camposValidos.telefono,
          NOT: { id: user.persona.id },
        },
      });
      if (existeTel) {
        throw new BadRequestException(
          'El teléfono ya está en uso por otro usuario.',
        );
      }
    }

    if (camposValidos.dni) {
      const existeDni = await this.prisma.persona.findFirst({
        where: {
          dni: camposValidos.dni,
          NOT: { id: user.persona.id },
        },
      });
      if (existeDni) {
        throw new BadRequestException(
          'El DNI ya está en uso por otro usuario.',
        );
      }
    }

    let { password, ...restoDeCamposPersona } = camposValidos;

    if (password) {
      password = await bcrypt.hash(password, 10);
    }

    const personaActualizada = await this.prisma.user.update({
      where: { correo },
      data: {
        ...(password && { password }), 
        persona: {
          update: restoDeCamposPersona,
        },
      },
    });

    return {
      message: 'Datos del cliente completados correctamente.',
      personaActualizada,
    };
  }

  async findUserForUpdate(correo: string) {
    const user = await this.prisma.user.findUnique({
      where: { correo },
      include: { persona: true },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return user;
  }

async updateUserInfo(
    correo: string,
    data: UpdateModificarInfoDto,
  ) {
    if (data.correo && data.correo !== correo) {
      const existingUser = await this.prisma.user.findUnique({
        where: { correo: data.correo },
      });
      if (existingUser) {
        throw new BadRequestException('El nuevo correo electrónico ya está en uso.');
      }
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { correo },
        data: {
          correo: data.correo,
          
          persona: {
            update: {
              nombre: data.nombre,
              apellido: data.apellido,
              dni: data.dni,
              telefono: data.telefono,
              direccion: data.direccion,
            },
          },
        },
        select: {
          correo: true,
          rol: true,
          persona: {
            select: {
              nombre: true,
              apellido: true,
              dni: true,
              telefono: true,
              direccion: true,
              createdAt: true,
            }
          }
        }
      });

      return {
        message: 'Información actualizada exitosamente.',
        data: updatedUser,
      };
      
    } catch (error) {
      console.error("Error al actualizar en DB (Prisma):", error);

      // Errores propios de prisma
      if (error.code === 'P2025') { 
        throw new NotFoundException(`Usuario con correo ${correo} no encontrado.`);
      }
      
      throw new InternalServerErrorException('Error interno del servidor al procesar la actualización de datos. Verifique los tipos de datos enviados.'); 
    }
  }
}
