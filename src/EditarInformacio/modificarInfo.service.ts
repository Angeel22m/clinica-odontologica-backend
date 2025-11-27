import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { UpdateModificarInfoDto } from './dtoModificar/update.modificarInfo';
import * as bcrypt from 'bcrypt';
import { CambiarPasswordDto } from './dtoModificar/cambiarPassword.dto';
import { ResetPasswordAdminDto } from './dtoModificar/resetPassword.dto';

type SearchCriterion = {
  correo?: string;
  dni?: string;
  telefono?: string;
};

interface passwordCorreoPayload {
  correo: string;
  codigo: string;
  asunto: string;
}

@Injectable()
export class ModificarInfoService {
  constructor(
    private prisma: PrismaService,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
  ) { }

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

  // método para generar contrasñeas temporales
  private generarPasswordTemporal(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}';
    const length = 12;
    let pass = '';
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }

  async restablecerPassword(
    correo: string,
    dto: ResetPasswordAdminDto,
    userAuth: any,
  ) {
    // Solo ADMIN
    if (userAuth.rol !== 'ADMIN') {
      return {
        message: 'Solo un administrador puede restablecer contraseñas.',
        code: 403,
      };
    }

    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { correo },
    });

    if (!user) {
      return { message: 'Usuario no encontrado.', code: 404 };
    }

    // PROTEGER que el admin no se cambie a sí mismo aquí
    if (userAuth.correo === correo) {
      return {
        message: 'No puede restablecer su propia contraseña.',
        code: 400,
      };
    }

    let passwordTemporal: string;

    if (dto.nuevaPassword) {
      // El admin quiere asignar una manual
      passwordTemporal = dto.nuevaPassword;
    } else {
      // Generar automáticamente
      passwordTemporal = this.generarPasswordTemporal();
    }
    try {
      // Hashear
      const hashed = await bcrypt.hash(passwordTemporal, 10);

      // Expiración en 24 horas
      const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Actualizar usuario
      await this.prisma.user.update({
        where: { correo },
        data: {
          password: hashed,
          requierCambioPassword: true,
          passwordTemporalExpira: expiracion,
        },
      });

      await this.temporaryPasswordCorreo(user.id, passwordTemporal);

      return {
        message: 'Contraseña restablecida correctamente.',
        passwordTemporal, // mostrar solo la NUEVA temporal
      };
    } catch (error) {
      console.error(error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }

  async temporaryPasswordCorreo(userId: number, passwordTemporal: string) {
    const EXPIRATION_HOURS = 24;

    // 1. Obtener la información del usuario (necesitamos el email)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { correo: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    // Hashear
    const hashed = await bcrypt.hash(passwordTemporal, 10);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + EXPIRATION_HOURS);

    // 2. Almacenar/Sobrescribir el código usando update
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordTemporal: hashed,
        passwordTemporalExpira: expiresAt,
        requierCambioPassword: true,
      },
    });

    // 3. EMISIÓN del evento a la cola de RabbitMQ
    const payload = {
      correo: user.correo,
      codigo: passwordTemporal,
      asunto: 'Restablecimiento de Contraseña Temporal',
    };

    // PATRÓN: 'send_verification_email'
    // El microservicio/trabajador (worker) que consume la cola esperará este patrón.
    this.mailClient.emit('send_verification_email', payload);

    return {
      message: 'Contraseña temporal generada y enviada al correo.',
    };
  }
}
