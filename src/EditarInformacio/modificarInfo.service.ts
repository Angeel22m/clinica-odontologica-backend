import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateModificarInfoDto } from './dtoModificar/update.modificarInfo';

@Injectable()
export class ModificarInfoService {
  constructor(private prisma: PrismaService) {}

  async buscarPorCorreo(correo: string) {
    const user = await this.prisma.user.findUnique({
      where: { correo },
      include: { persona: true },
    });

    // 1️⃣ Validar existencia
    if (!user) {
      throw new NotFoundException(
        `No existe un usuario registrado con el correo: ${correo}`,
      );
    }

    // 2️⃣ Validar rol (solo clientes)
    if (user.rol !== 'CLIENTE') {
      throw new BadRequestException(
        `El usuario con correo ${correo} no es un cliente.`,
      );
    }

    try {
      // 3️⃣ Retornar usuario si pasa validaciones
      return user;
    } catch (error) {
      console.error(error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }

  //Completar el expediente de la persona
  async completarDatosPorCorreo(correo: string, data: UpdateModificarInfoDto) {
    // 1️ Buscar persona por correo
    const user = await this.prisma.user.findUnique({
      where: { correo },
      include: { persona: true },
    });

    // 4️ Remover campos vacíos para evitar sobreescrituras
    const camposValidos = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== null && value !== '',
      ),
    );

    // Validación adicional
    if (Object.keys(camposValidos).length === 0) {
      throw new BadRequestException('No se enviaron datos para completar.');
    }

    try {
      // 5️ Actualizar los datos faltantes
      const { password, ...restoDeCampos } = camposValidos;
  
      const personaActualizada = await this.prisma.user.update({
        where: { correo },
        data: {
          // Si viene password → actualiza user
          ...(password && { password }),
  
          // Si vienen datos para persona → actualiza persona
          persona: {
            update: restoDeCampos,
          },
        },
      });
  
      // 6️ Retornar resultado
      return {
        message: 'Datos del cliente completados correctamente.',
        personaActualizada,
      };
    } catch (error) {
      console.error(error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }
}
