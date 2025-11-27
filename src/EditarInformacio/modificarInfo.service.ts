import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateModificarInfoDto } from './dtoModificar/update.modificarInfo';
import * as bcrypt from 'bcrypt';
import { CambiarPasswordDto } from './dtoModificar/cambiarPassword.dto';

type SearchCriterion = {
  correo?: string;
  dni?: string;
  telefono?: string;
};

@Injectable()
export class ModificarInfoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Función interna modular: Busca un usuario/cliente basado en un criterio.
   * Utiliza el modelo Persona para buscar por DNI/Teléfono e incluye el User.
   */
  private async findUserByCriterion(criterion: SearchCriterion) {
    // Si el criterio es el correo, busca directamente en el modelo User.
    if (criterion.correo) {
      return this.prisma.user.findUnique({
        where: { correo: criterion.correo },
        include: { persona: true },
      });
    }

    // Si el criterio es DNI o teléfono, busca primero en el modelo Persona.
    const persona = await this.prisma.persona.findFirst({
      where: {
        OR: [
          criterion.dni ? { dni: criterion.dni } : undefined,
          criterion.telefono ? { telefono: criterion.telefono } : undefined,
        ].filter(Boolean) as any, // Filtramos undefined para asegurar un WHERE válido
      },
      include: {
        user: true, // Incluimos el modelo User asociado a esta Persona
      },
    });

    // Si encuentra la persona y tiene un registro User asociado, lo devuelve.
    return persona?.user ? { ...persona.user, persona: persona } : null;
  }

  /**
   * Método central que maneja la validación de rol y errores.
   * @param criterion El objeto con el valor de búsqueda (correo, dni, o telefono).
   * @param value El valor del criterio para mensajes de error.
   */
  private async validateAndReturnClient(
    criterion: SearchCriterion,
    value: string,
  ): Promise<any> {
    const user = await this.findUserByCriterion(criterion);

    const key = Object.keys(criterion)[0]; // Obtiene 'correo', 'dni' o 'telefono'

    // 1. Validar existencia
    if (!user) {
      throw new NotFoundException(
        `No existe un cliente registrado con el ${key}: ${value}`,
      );
    }

    // 2. Validar rol (solo clientes)
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
    // 1️ Buscar persona por correo
    const user = await this.prisma.user.findUnique({
      where: { correo },
      include: { persona: true },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }

    // 2️ Filtrar campos válidos (solo los que vienen con valor)
    const camposValidos = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== null && value !== '' && value !== undefined,
      ),
    );

    if (Object.keys(camposValidos).length === 0) {
      throw new BadRequestException('No se enviaron datos para actualizar.');
    }

    // 3️ Validar teléfono si viene
    if (camposValidos.telefono) {
      const existeTel = await this.prisma.persona.findFirst({
        where: {
          telefono: camposValidos.telefono,
          NOT: { id: user.persona.id }, // Evitar conflicto con el mismo usuario
        },
      });
      if (existeTel) {
        throw new BadRequestException(
          'El teléfono ya está en uso por otro usuario.',
        );
      }
    }

    // 4️ Validar DNI si viene
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

    // 5️ Manejar password por separado
    let { password, ...restoDeCamposPersona } = camposValidos;

    if (password) {
      password = await bcrypt.hash(password, 10);
    }

    // 6️ Actualizar
    const personaActualizada = await this.prisma.user.update({
      where: { correo },
      data: {
        ...(password && { password }), // Actualiza password solo si viene
        persona: {
          update: restoDeCamposPersona, // Solo los campos válidos
        },
      },
    });

    return {
      message: 'Datos del cliente completados correctamente.',
      personaActualizada,
    };
  }

  // busca usuario por correo para modificar sus datos
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

  // actualizar los datos del usuario
  async updateUserInfo(
    correo: string,
    data: UpdateModificarInfoDto,
    userAuth: any,
  ) {
    const user = await this.findUserForUpdate(correo);

    // solo el usuario dueño o un ADMIN o RECEPCIONISTA pueden modificar
    if (
      userAuth.correo !== correo &&
      !['ADMIN', 'RECEPCIONISTA'].includes(userAuth.rol)
    ) {
      return {
        message: 'No tiene permisos para modificar este usuario.',
        code: 403,
      };
    }

    // filtrar campos válidos
    const camposValidos = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== '' && value !== null && value !== undefined,
      ),
    );
    if (Object.keys(camposValidos).length === 0) {
      return {
        message: 'No se enviaron datos para actualizar.',
        code: 400,
      };
    }

    // validar teléfono único
    if (camposValidos.telefono) {
      const existeTel = await this.prisma.persona.findFirst({
        where: {
          telefono: camposValidos.telefono,
          NOT: { id: user.persona.id },
        },
      });

      if (existeTel) {
        return {
          message: 'El teléfono ya está en uso por otro usuario.',
          code: 400,
        };
      }
    }

    // validar correo único si se desea modificar
    if (camposValidos.correo) {
      const existeCorreo = await this.prisma.user.findFirst({
        where: {
          correo: camposValidos.correo,
          NOT: { id: user.id },
        },
      });

      if (existeCorreo) {
        return {
          message: 'El correo ya está en uso.',
          code: 400,
        };
      }
    }

    //validar dni unico
    if (camposValidos.dni) {
      const existeDni = await this.prisma.persona.findFirst({
        where: {
          dni: camposValidos.dni,
          NOT: { id: user.persona.id },
        },
      });
      if (existeDni) {
        return {
          message: 'El DNI ya existe.',
          code: 400,
        };
      }
    }
    try {
      // separa lo que va en Persona y lo que va en User
      const userFields: any = {};
      const personaFields: any = {};

      if (camposValidos.correo) userFields.correo = camposValidos.correo;
      if (camposValidos.nombre) personaFields.nombre = camposValidos.nombre;
      if (camposValidos.direccion)
        personaFields.direccion = camposValidos.direccion;
      if (camposValidos.telefono)
        personaFields.telefono = camposValidos.telefono;
      if (camposValidos.fechaNac)
        personaFields.fechaNac = camposValidos.fechaNac;

      // actualizar en BD
      const actualizado = await this.prisma.user.update({
        where: { correo },
        data: {
          ...userFields,
          persona: {
            update: personaFields,
          },
        },
        include: { persona: true },
      });

      return {
        message: 'Información actualizada correctamente.',
        data: actualizado,
      };
    } catch (error) {
      console.error(error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }

  //modifcar contraseña del usuario
  async cambiarPassword(
    correo: string,
    dto: CambiarPasswordDto,
    userAuth: any,
  ) {
    const { passwordActual, passwordNueva } = dto;

    // Verificar si el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { correo },
    });

    if (!user) {
      return {
        message: 'Usuario no encontrado.',
        code: 400,
      };
    }

    // VALIDACIÓN ESTRICTA:
    // Solo el usuario dueño puede cambiar su contraseña
    if (userAuth.correo !== correo) {
      return {
        message: 'No tiene permiso para cambiar la contraseña de otro usuario.',
        code: 403,
      };
    }
    if (!user.password) {
      return {
        message: 'El usuario no tiene contraseña registrada.',
        code: 400,
      };
    }
    // Validar contraseña actual
    const esCorrecta = await bcrypt.compare(passwordActual, user.password);
    if (!esCorrecta) {
      return {
        message: 'La contraseña actual es incorrecta.',
        code: 401,
      };
    }

    if (passwordActual === passwordNueva) {
      return {
        message: 'La nueva contraseña no puede ser igual a la actual.',
        code: 401,
      };
    }
    try {
      // Hashear la nueva contraseña
      const hashed = await bcrypt.hash(passwordNueva, 10);

      // Actualizar en BD
      await this.prisma.user.update({
        where: { correo },
        data: { password: hashed },
      });

      return {
        message: 'Contraseña actualizada correctamente.',
      };
    } catch (error) {
      console.error(error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }
}
