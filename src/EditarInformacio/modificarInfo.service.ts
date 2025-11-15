import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateModificarInfoDto } from "./dtoModificar/update.modificarInfo";


@Injectable()
export class ModificarInfoService{
    constructor (private prisma: PrismaService){}


    //Completar el expediente de la persona 
   async completarDatosPorCorreo(correo: string, data: UpdateModificarInfoDto) {
    // 1️ Buscar persona por correo
    const user = await this.prisma.user.findUnique({
      where: { correo },
      include: { persona: true },
    });

    // 2️ Validar existencia
    if (!user) {
      throw new NotFoundException(
        `No existe una persona registrada con el correo: ${correo}`,
      );
    }

    // 3️ Validar que sea cliente
    if (!user.personaId) {
      throw new BadRequestException(
        `La persona con correo ${correo} no es un cliente. Solo a los clientes pueden completar datos.`,
      );
    }

    // 4️ Remover campos vacíos para evitar sobreescrituras
    const camposValidos = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== null && value !== '')
    );

    // Validación adicional
    if (Object.keys(camposValidos).length === 0) {
      throw new BadRequestException(
        'No se enviaron datos para completar.'
      );
    }

    // 5️ Actualizar los datos faltantes
    const personaActualizada = await this.prisma.user.update({
      where: { correo },
      data: camposValidos,
    });

    // 6️ Retornar resultado
    return {
      message: 'Datos del cliente completados correctamente.',
      personaActualizada,
    };
  }
}
