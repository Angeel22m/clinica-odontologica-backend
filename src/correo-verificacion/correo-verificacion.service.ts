import { Injectable,Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service'; 

interface verificacionCorreoPayload {
    correo: string;
    codigo:string;
    asunto:string;
}

@Injectable()
export class EmailVerificationService {
  private readonly EXPIRATION_MINUTES = 15;
 

  constructor(private prisma: PrismaService,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy
  ) {}

  /**
   * Genera un código OTP de 6 dígitos.
   */
  private generateCode(): string {
    // Genera un número aleatorio entre 100000 y 999999
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generación y Almacenamiento + EMISIÓN a RabbitMQ
   */
  async generateAndStoreCode(userId: number) {
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.EXPIRATION_MINUTES);

    // 1. Obtener la información del usuario (necesitamos el email)
    const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { correo: true, verificado: true }
    });

    if (!user) {
        throw new NotFoundException('Usuario no encontrado.');
    }
    
    if (user.verificado) {
        throw new BadRequestException('El correo ya está verificado.');
    }
    
    // 2. Almacenar/Sobrescribir el código usando upsert
    await this.prisma.codigoVerificacion.upsert({
      where: { userId: userId },
      update: {
        codigo: code,
        fechaExpiracion: expiresAt,
        usado: false, 
        fechaCreacion: new Date(),
      },
      create: {
        userId: userId,
        codigo: code,
        fechaExpiracion: expiresAt,
      },
    });

    // 3. EMISIÓN del evento a la cola de RabbitMQ
    const payload: verificacionCorreoPayload = {
      correo: user.correo,
      codigo: code,
      asunto: 'Código de Verificación de Cuenta',
    };
    
    // PATRÓN: 'send_verification_email'
    // El microservicio/trabajador (worker) que consume la cola esperará este patrón.
    this.mailClient.emit<any, verificacionCorreoPayload>(
      'send_verification_email',
      payload
    );

    return { 
      message: 'Código de verificación generado y enviado.', 
      email: user.correo // Omitir si no quieres exponer el email
    };
  }

  
  async validateCodeAndVerifyUser(userId: number, code: string) {
    // 1. Buscar el registro que coincida con userId, código, no expirado y no usado.
    const now = new Date();
    const verificationRecord = await this.prisma.codigoVerificacion.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!verificationRecord) {
        throw new NotFoundException('No se encontró un código de verificación activo para este usuario.');
    }

    // --- Verificaciones Críticas ---
    // A. Coincidencia
    if (verificationRecord.codigo !== code) {
        throw new BadRequestException('El código proporcionado no es válido.');
    }

    // B. Expiración
    if (verificationRecord.fechaExpiracion < now) {
        // Actualizar como usado (o eliminar) para limpiar, aunque no pase la validación
        await this.prisma.codigoVerificacion.update({
            where: { userId: userId },
            data: { usado: true },
        });
        throw new BadRequestException('El código de verificación ha expirado.');
    }

    // C. Uso
    if (verificationRecord.usado) {
        throw new BadRequestException('El código ya fue utilizado.');
    }
    // --- Fin de Verificaciones Críticas ---

    // 2. Si es válido: Actualizar ambos modelos en una transacción.
    await this.prisma.$transaction([
      // Actualizar CodigoVerificacion: marcar como usado
      this.prisma.codigoVerificacion.update({
        where: { userId: userId },
        data: { usado: true },
      }),
      // Actualizar User: marcar como verificado
      this.prisma.user.update({
        where: { id: userId },
        data: { verificado: true },
      }),
    ]);

    return { message: '¡Correo electrónico verificado con éxito!' };
  }
}